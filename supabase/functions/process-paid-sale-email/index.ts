import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3';
import { needsPaidConfirmation, paidEmailBody } from '../_shared/paidSaleEmail.ts';

const Body = z.object({ saleId: z.string().uuid(), token: z.string().uuid().optional() });
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: 'Invalid saleId or token' }, 400);
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return json({ error: 'Missing configuration' }, 500);
  const db = createClient(url, key);
  const { saleId, token } = parsed.data;
  // Database webhooks use a private, per-sale capability. Manual calls require service/admin auth.
  if (!token) {
    const bearer = req.headers.get('Authorization')?.replace(/^Bearer /, '');
    if (bearer !== key) {
      if (!bearer) return json({ error: 'Unauthorized' }, 401);
      const { data: user } = await db.auth.getUser(bearer);
      if (!user.user) return json({ error: 'Unauthorized' }, 401);
      const { data: admin } = await db.rpc('has_role', { _user_id: user.user.id, _role: 'admin' });
      if (!admin) return json({ error: 'Forbidden' }, 403);
    }
    const { error } = await db.rpc('enqueue_paid_sale_email', { _sale_id: saleId });
    if (error) return json({ error: 'Could not schedule confirmation' }, 500);
    return json({ scheduled: true });
  }
  const { data: job, error: claimError } = await db.rpc('claim_paid_sale_email', { _sale_id: saleId, _token: token });
  if (claimError) return json({ error: 'Could not claim confirmation' }, 500);
  if (!job?.length) return json({ skipped: true });
  const delivery = job[0];
  try {
    const { data: sale, error } = await db.from('sales').select('*').eq('id', saleId).single();
    if (error || !sale) throw new Error('Reservation unavailable');
    if (!needsPaidConfirmation(sale)) {
      await db.from('paid_sale_email_deliveries').update({ completed_at: new Date().toISOString(), locked_until: null }).eq('sale_id', saleId);
      await db.rpc('dispatch_pending_paid_sale_emails');
      return json({ skipped: true });
    }
    const configured = Deno.env.get('ADMIN_EMAIL') || '';
    const adminTo = configured.includes('@') ? configured : 'tocorimeriotours@gmail.com, veiga.yury@gmail.com';
    for (const audience of ['admin', 'customer'] as const) {
      if (delivery[`${audience}_sent_at`]) continue;
      const response = await fetch(`${url}/functions/v1/send-alert-email`, {
        method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(paidEmailBody(sale, audience === 'admin' ? adminTo : sale.customer_email, audience)),
      });
      if (!response.ok) throw new Error(`${audience} confirmation rejected (${response.status})`);
      const { error: saveError } = await db.from('paid_sale_email_deliveries').update({ [`${audience}_sent_at`]: new Date().toISOString() }).eq('sale_id', saleId);
      if (saveError) throw new Error('Could not record accepted confirmation');
    }
    const { error: finishError } = await db.rpc('complete_paid_sale_email', { _sale_id: saleId });
    if (finishError) throw new Error('Could not complete confirmation');
    console.log('Paid reservation confirmations accepted:', saleId);
    return json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Confirmation failed';
    await db.from('paid_sale_email_deliveries').update({ last_error: message, locked_until: null, next_attempt_at: new Date(Date.now() + 5 * 60_000).toISOString() }).eq('sale_id', saleId);
    console.error('Paid reservation confirmation will retry:', saleId, message);
    return json({ error: message, retryScheduled: true }, 502);
  }
});