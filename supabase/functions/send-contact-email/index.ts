import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { to, senderName, senderEmail, senderPhone, tourInterest, message } = await req.json();

    if (!to) {
      throw new Error("E-mail de destino não fornecido");
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY não configurada");
    }

    const subject = `Novo Contato do Site: ${senderName}`;
    const EXTRA_ADMIN = "veiga.yury@gmail.com";
    const adminRecipients = Array.from(
      new Set([String(to).trim().toLowerCase(), EXTRA_ADMIN]),
    );
    const adminHtmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
          .header { background: #2A9D8F; color: white; padding: 10px 20px; border-radius: 10px 10px 0 0; }
          .content { padding: 20px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #2A9D8F; }
          .message { background: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Novo Contato - Tocorime Rio</h1>
          </div>
          <div class="content">
            <div class="field">
              <span class="label">Nome:</span> ${senderName}
            </div>
            <div class="field">
              <span class="label">E-mail:</span> ${senderEmail}
            </div>
            <div class="field">
              <span class="label">Telefone:</span> ${senderPhone || "Não informado"}
            </div>
            <div class="field">
              <span class="label">Passeio de Interesse:</span> ${tourInterest || "Não selecionado"}
            </div>
            <div class="field">
              <span class="label">Mensagem:</span>
              <div class="message">${message.replace(/\n/g, "<br>")}</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const customerHtmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; text-align: center; }
          .header { background: #2A9D8F; color: white; padding: 20px; border-radius: 10px 10px 0 0; }
          .content { padding: 30px; }
          .footer { margin-top: 30px; font-size: 12px; color: #999; }
          .btn { display: inline-block; padding: 12px 24px; background: #2A9D8F; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Recebemos sua mensagem!</h2>
          </div>
          <div class="content">
            <p>Olá, <strong>${senderName}</strong>,</p>
            <p>Obrigado por entrar em contato com a <strong>Tocorime Rio</strong>!</p>
            <p>Recebemos sua mensagem e nossa equipe responderá o mais rápido possível para ajudar você com sua aventura no Rio de Janeiro.</p>
            <p>Enquanto isso, que tal explorar nossos passeios e experiências incríveis?</p>
            <a href="https://tocorimerio.lovable.app/#tours" class="btn">Ver Todos os Passeios</a>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Tocorime Rio. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send to Admin
    const adminResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Tocorime Rio <contato@tocorimerio.com>",
        to: adminRecipients,
        reply_to: senderEmail,
        subject: subject,
        html: adminHtmlContent,
      }),
    });

    // Send to Customer (Auto-reply)
    const customerResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Tocorime Rio <contato@tocorimerio.com>",
        to: [senderEmail],
        subject: "Recebemos sua mensagem! - Tocorime Rio",
        html: customerHtmlContent,
      }),
    });

    if (!adminResponse.ok) {
      const errorData = await adminResponse.text();
      console.error("Resend Admin error:", errorData);
      throw new Error("Erro ao enviar e-mail para o administrador");
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Function error:", error?.message);
    return new Response(JSON.stringify({ error: error?.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
