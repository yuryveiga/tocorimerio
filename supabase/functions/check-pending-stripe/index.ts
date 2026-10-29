import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3';
import Stripe from 'npm:stripe@13';
import { sessionMatchesPendingSale } from '../_shared/pendingStripeCheck.ts';

const Body = z.object({ saleId: z.string().uuid(), token: z.string().uuid() });
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return json({});
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: 'Invalid verification request' }, 400);
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!url || !key || !stripeKey) return json({ error: 'Missing configuration' }, 500);
  const db = createClient(url, key);
  const { saleId, token } = parsed.data;
  // A private per-sale capability and due-time check authorize this callback.
  const { data: jobs, error: claimError } = await db.rpc('claim_pending_stripe_check', { _sale_id: saleId, _token: token });
  if (claimError) return json({ error: 'Could not claim verification' }, 500);
  if (!jobs?.length) return json({ skipped: true });
  const job = jobs[0];
  try {
    const { data: sale, error } = await db.from('sales').select('id,is_paid,is_cancelled').eq('id', saleId).single();
    if (error || !sale) throw new Error('Reservation unavailable');
    let outcome = 'already_resolved';
    if (!sale.is_paid && !sale.is_cancelled) {
      const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
      const session = await stripe.checkout.sessions.retrieve(job.session_id);
      outcome = 'unpaid';
      if (sessionMatchesPendingSale(session, saleId)) {
        // Retain existing calendar/partner side effects and database-triggered emails.
        const response = await fetch(`${url}/functions/v1/sync-stripe`, {
          method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: session.id }),
        });
        if (!response.ok) throw new Error('Payment synchronization failed');
        const { data: updated, error: readError } = await db.from('sales').select('is_paid,is_cancelled').eq('id', saleId).single();
        if (readError || !updated || (!updated.is_paid && !updated.is_cancelled)) throw new Error('Payment update not confirmed');
        outcome = 'paid';
      }
    }
    const { error: finishError } = await db.from('pending_stripe_checks').update({ completed_at: new Date().toISOString(), locked_until: null, outcome, last_error: null }).eq('sale_id', saleId);
    if (finishError) throw new Error('Could not complete verification');
    await db.rpc('dispatch_pending_stripe_checks');
    return json({ success: true, outcome });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Verification failed';
    await db.from('pending_stripe_checks').update({ last_error: message, locked_until: null, next_attempt_at: new Date(Date.now() + 5 * 60_000).toISOString() }).eq('sale_id', saleId);
    await db.rpc('dispatch_pending_stripe_checks');
    console.error('Pending payment verification failed:', message);
    return json({ error: message, retryScheduled: job.attempts < 3 }, 502);
  }
});