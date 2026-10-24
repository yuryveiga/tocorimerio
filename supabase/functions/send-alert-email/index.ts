import { isFootballReservation } from "../_shared/footballReservation.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3';

const EmailBody = z.object({
  to: z.union([z.string().min(3).max(1000), z.array(z.string().email()).min(1).max(10)]),
  customerName: z.string().max(255), customerEmail: z.string().email(),
  customerPhone: z.string().nullish(), items: z.array(z.object({ tour: z.string(), quantity: z.number(), date: z.string() })).min(1).max(50),
  total: z.number().finite().nonnegative(), isCustomerCopy: z.boolean().default(false),
  selectedPeriod: z.string().nullish(), isPrivate: z.boolean().nullish(), replyTo: z.string().email().optional(),
  provider: z.string().nullish(), tourTitle: z.string().nullish(), tourSlug: z.string().nullish(),
  idempotencyKey: z.string().min(1).max(256).regex(/^[a-zA-Z0-9_-]+$/).optional(),
});
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] || char));

Deno.serve(async (req) => {

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const url = Deno.env.get('SUPABASE_URL');
    const bearer = req.headers.get('Authorization')?.replace(/^Bearer /, '');
    if (!serviceKey || !url) throw new Error('Missing configuration');
    if (bearer !== serviceKey) {
      const db = createClient(url, serviceKey);
      const { data } = await db.auth.getUser(bearer || '');
      if (!data.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
      const { data: admin } = await db.rpc('has_role', { _user_id: data.user.id, _role: 'admin' });
      if (!admin) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: corsHeaders });
    }
    const parsed = EmailBody.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return new Response(JSON.stringify({ error: 'Invalid email data' }), { status: 400, headers: corsHeaders });
    const { to, total, isCustomerCopy, isPrivate, replyTo, provider, tourTitle, tourSlug, idempotencyKey } = parsed.data;
    const customerName = escapeHtml(parsed.data.customerName);
    const customerEmail = escapeHtml(parsed.data.customerEmail);
    const customerPhone = escapeHtml(parsed.data.customerPhone || '');
    const selectedPeriod = escapeHtml(parsed.data.selectedPeriod || '');
    const items = parsed.data.items.map(item => ({ ...item, tour: escapeHtml(item.tour), date: escapeHtml(item.date) }));
    const hasFootball = isFootballReservation({ provider, selected_period: selectedPeriod, tour_title: tourTitle, tour_slug: tourSlug })
      || items.some((item: { tour?: string; title?: string; slug?: string; period?: string }) => isFootballReservation({ tour_title: item.tour || item.title, tour_slug: item.slug, selected_period: item.period }));

    if (!to) {
      return new Response(JSON.stringify({ error: 'Email não configurado' }), { status: 400, headers: corsHeaders })
    }

    const headerTitle = isCustomerCopy 
      ? 'Reserva Confirmada ✨ / Booking Confirmed ✨' 
      : 'Nova Reserva Recebida 🔔 / New Booking Received 🔔';
    
    const subject = isCustomerCopy 
      ? 'Sua reserva na Tocorime Rio está confirmada! / Your booking with Tocorime Rio is confirmed!' 
      : '🔔 Nova Reserva Recebida! / New Booking Received!';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background: #2A9D8F; color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; letter-spacing: 1px; }
          .content { padding: 30px; }
          .section { margin-bottom: 25px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
          .section-title { font-weight: bold; font-size: 14px; color: #2A9D8F; text-transform: uppercase; margin-bottom: 10px; display: block; }
          .customer-info p { margin: 5px 0; font-size: 16px; }
          .tour-item { background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 10px; }
          .tour-title { font-weight: bold; font-size: 18px; color: #264653; display: block; }
          .tour-details { font-size: 14px; color: #666; }
          .total-box { background: #264653; color: white; padding: 20px; border-radius: 8px; text-align: right; }
          .total-label { font-size: 14px; opacity: 0.8; }
          .total-value { font-size: 24px; font-weight: bold; display: block; }
          .footer { background: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #999; }
          .cta-button { display: inline-block; padding: 12px 24px; background-color: #2A9D8F; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
          .translation { font-style: italic; color: #666; font-size: 0.9em; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Tocorime Rio</h1>
            <p>${headerTitle}</p>
          </div>
          <div class="content">
            <p>Olá / Hello, <strong>${customerName}</strong>,</p>
            <p>
              ${isCustomerCopy 
                ? 'Temos o prazer de informar que sua reserva foi confirmada com sucesso! Estamos ansiosos para recebê-lo. <br> <span class="translation">We are pleased to inform you that your booking has been successfully confirmed! We look forward to welcoming you.</span>' 
                : 'Uma nova venda foi realizada através do site. <br> <span class="translation">A new sale has been completed through the website.</span>'}
            </p>
            
            <div class="section">
              <span class="section-title">Dados da Reserva / Booking Details</span>
              <div class="customer-info">
                <p><strong>Nome / Name:</strong> ${customerName}</p>
                <p><strong>E-mail:</strong> ${customerEmail}</p>
                <p><strong>WhatsApp:</strong> ${customerPhone || 'Não informado / Not provided'}</p>
                ${selectedPeriod ? `<p><strong>Período / Period:</strong> ${selectedPeriod}</p>` : ''}
                ${hasFootball ? '' : `<p><strong>Tipo / Type:</strong> ${isPrivate ? 'Privativo / Private' : 'Grupo Aberto / Open Group'}</p>`}
              </div>
            </div>

            <div class="section">
              <span class="section-title">Itens / Items</span>
              ${items.map((item: any) => `
                <div class="tour-item">
                  <span class="tour-title">${item.tour}</span>
                  <div class="tour-details">
                    <span>${item.quantity} pessoa(s) / person(s) • Data / Date: ${item.date}</span>
                  </div>
                </div>
              `).join('')}
            </div>

            <div class="total-box">
              <span class="total-label">Valor Pago / Total Paid</span>
              <span class="total-value">R$ ${total.toFixed(2)}</span>
            </div>

            ${isCustomerCopy ? `
              <div style="text-align: center;">
                <p>Dúvidas? Entre em contato pelo nosso WhatsApp. <br> <span class="translation">Questions? Contact us via WhatsApp.</span></p>
                <a href="https://wa.me/5521970702523" class="cta-button">Falar conosco / Contact us</a>
              </div>
            ` : ''}
          </div>
          <div class="footer">
            <p>Este é um e-mail automático enviado pelo sistema de reservas Tocorime Rio. <br> This is an automated email sent by the Tocorime Rio booking system.</p>
            <p>&copy; ${new Date().getFullYear()} Tocorime Rio. Todos os direitos reservados. / All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    // Handle multiple recipients if 'to' is a comma/semicolon-separated string.
    // Filter to keep only valid-looking email addresses.
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const rawList = Array.isArray(to)
      ? to
      : String(to).split(/[,;\n]/);
    const recipients = rawList
      .map((e: string) => String(e).trim())
      .filter((e: string) => emailRegex.test(e));

    if (recipients.length === 0) {
      console.error('No valid recipients after parsing:', to);
      return new Response(JSON.stringify({ error: 'No valid recipients', raw: to }), { status: 400, headers: corsHeaders });
    }

    console.log('Sending booking confirmation; customer copy:', isCustomerCopy);

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
        ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
      },
      body: JSON.stringify({
        from: 'Tocorime Rio <reservas@tocorimerio.com>',
        to: recipients,
        ...(replyTo ? { reply_to: replyTo } : {}),
        subject: subject,
        html: htmlContent
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Email error:', error)
      return new Response(JSON.stringify({ error }), { status: 500, headers: corsHeaders })
    }

    return new Response(JSON.stringify({ success: true }), { headers: corsHeaders })
  } catch (error: any) {
    console.error('Function error:', error)
    return new Response(JSON.stringify({ error: error?.message }), { status: 500, headers: corsHeaders })
  }
})