import { isPrivilegedCaller } from "../_shared/privilegedCaller.ts";

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const processMetrics = (visits: any[], sales: any[]) => {
  const totalVisits = visits?.length || 0;
  const uniqueVisitors = new Set(visits?.map(v => v.session_id)).size;
  const totalSales = sales?.length || 0;
  const conversionRate = uniqueVisitors > 0 ? (totalSales / uniqueVisitors * 100) : 0;

  const pagesMap: Record<string, number> = {};
  visits?.forEach(v => {
    try {
      const path = new URL(v.page_url).pathname;
      pagesMap[path] = (pagesMap[path] || 0) + 1;
    } catch (e) { pagesMap[v.page_url] = (pagesMap[v.page_url] || 0) + 1; }
  });
  const topPages = Object.entries(pagesMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const countriesMap: Record<string, number> = {};
  visits?.forEach(v => {
    const c = v.country || "Unknown";
    countriesMap[c] = (countriesMap[c] || 0) + 1;
  });
  const topCountries = Object.entries(countriesMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return { totalVisits, uniqueVisitors, totalSales, conversionRate, topPages, topCountries };
};

const escHtml = (v: unknown) => String(v ?? "").slice(0, 300).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const resendApiKey = Deno.env.get("RESEND_API_KEY") ?? "";
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    if (!(await isPrivilegedCaller(req, supabase))) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const now = new Date();
    const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const firstDayPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const periodCurrent = { start: firstDayCurrentMonth.toISOString(), end: lastDayCurrentMonth.toISOString() };
    const periodPrev = { start: firstDayPrevMonth.toISOString(), end: lastDayPrevMonth.toISOString() };

    const body = await req.json().catch(() => ({}));
    const isTest = body?.test === true;

    let metricsCurrent: ReturnType<typeof processMetrics>;
    let metricsPrev: ReturnType<typeof processMetrics>;
    let adminEmails: string[] = [];

    if (isTest) {
      console.log("Running in TEST mode with dummy data");
      metricsCurrent = {
        totalVisits: 1250,
        uniqueVisitors: 850,
        totalSales: 42,
        conversionRate: 4.94,
        topPages: [["/", 500], ["/passeio-rio", 300], ["/blog", 200], ["/contato", 150], ["/galeria", 100]],
        topCountries: [["Brasil", 800], ["EUA", 250], ["Argentina", 100], ["Chile", 60], ["Portugal", 40]]
      };
      metricsPrev = {
        totalVisits: 1000,
        uniqueVisitors: 700,
        totalSales: 30,
        conversionRate: 4.28,
        topPages: [],
        topCountries: []
      };

      const { data: admins } = await supabase.from("profiles").select("email").eq("role", "admin");
      adminEmails = admins?.map(a => a.email) || [];
    } else {
      const [
        { data: visitsCurrent },
        { data: visitsPrev },
        { data: salesCurrent },
        { data: salesPrev },
        { data: admins }
      ] = await Promise.all([
        supabase.from("site_visits").select("*").gte("created_at", periodCurrent.start).lte("created_at", periodCurrent.end),
        supabase.from("site_visits").select("*").gte("created_at", periodPrev.start).lte("created_at", periodPrev.end),
        supabase.from("sales").select("*").gte("created_at", periodCurrent.start).lte("created_at", periodCurrent.end),
        supabase.from("sales").select("*").gte("created_at", periodPrev.start).lte("created_at", periodPrev.end),
        supabase.from("profiles").select("email").eq("role", "admin")
      ]);

      adminEmails = (admins || []).map(a => a.email);
      metricsCurrent = processMetrics(visitsCurrent || [], salesCurrent || []);
      metricsPrev = processMetrics(visitsPrev || [], salesPrev || []);
    }

    if (adminEmails.length === 0) {
      return new Response(JSON.stringify({ error: "Nenhum administrador encontrado para receber o relatório." }), { status: 404, headers: corsHeaders });
    }

    const calcTrend = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? "+100%" : "0%";
      const diff = ((curr - prev) / prev) * 100;
      return (diff >= 0 ? "+" : "") + diff.toFixed(1) + "%";
    };

    const monthName = now.toLocaleString('pt-BR', { month: 'long' });
    const year = now.getFullYear();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: sans-serif; color: #333; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
          <div style="background: #2A9D8F; color: white; padding: 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 20px;">Relatório Mensal de Analytics</h1>
            <p style="margin: 4px 0 0; opacity: 0.8;">${monthName} ${year}</p>
          </div>
          <div style="padding: 24px;">
            <h2 style="font-size: 16px; border-bottom: 2px solid #2A9D8F; padding-bottom: 8px;">Resumo de Performance</h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
              <tr>
                <td style="padding: 8px 0;"><strong>Métrica</strong></td>
                <td style="padding: 8px 0; text-align: center;"><strong>Este Mês</strong></td>
                <td style="padding: 8px 0; text-align: right;"><strong>Tendência</strong></td>
              </tr>
              <tr style="border-top: 1px solid #eee;">
                <td style="padding: 8px 0;">Visitas Totais</td>
                <td style="padding: 8px 0; text-align: center;">${metricsCurrent.totalVisits}</td>
                <td style="padding: 8px 0; text-align: right; color: ${metricsCurrent.totalVisits >= metricsPrev.totalVisits ? '#2A9D8F' : '#e76f51'}">${calcTrend(metricsCurrent.totalVisits, metricsPrev.totalVisits)}</td>
              </tr>
              <tr style="border-top: 1px solid #eee;">
                <td style="padding: 8px 0;">Usuários Únicos</td>
                <td style="padding: 8px 0; text-align: center;">${metricsCurrent.uniqueVisitors}</td>
                <td style="padding: 8px 0; text-align: right; color: ${metricsCurrent.uniqueVisitors >= metricsPrev.uniqueVisitors ? '#2A9D8F' : '#e76f51'}">${calcTrend(metricsCurrent.uniqueVisitors, metricsPrev.uniqueVisitors)}</td>
              </tr>
              <tr style="border-top: 1px solid #eee;">
                <td style="padding: 8px 0;">Total de Vendas</td>
                <td style="padding: 8px 0; text-align: center;">${metricsCurrent.totalSales}</td>
                <td style="padding: 8px 0; text-align: right; color: ${metricsCurrent.totalSales >= metricsPrev.totalSales ? '#2A9D8F' : '#e76f51'}">${calcTrend(metricsCurrent.totalSales, metricsPrev.totalSales)}</td>
              </tr>
              <tr style="border-top: 1px solid #eee; background: #f9f9f9;">
                <td style="padding: 8px;"><strong>Taxa de Conversão</strong></td>
                <td style="padding: 8px; text-align: center;"><strong>${metricsCurrent.conversionRate.toFixed(2)}%</strong></td>
                <td style="padding: 8px; text-align: right; color: ${metricsCurrent.conversionRate >= metricsPrev.conversionRate ? '#2A9D8F' : '#e76f51'}">${calcTrend(metricsCurrent.conversionRate, metricsPrev.conversionRate)}</td>
              </tr>
            </table>

            <div style="margin-top: 32px; display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
              <div>
                <h3 style="font-size: 14px; margin-bottom: 8px;">Top 5 Páginas</h3>
                <ul style="padding-left: 16px; margin: 0; font-size: 13px;">
                  ${metricsCurrent.topPages.map(([p, v]) => `<li>${escHtml(p)} (${v})</li>`).join('')}
                </ul>
              </div>
              <div>
                <h3 style="font-size: 14px; margin-bottom: 8px;">Top 5 Países</h3>
                <ul style="padding-left: 16px; margin: 0; font-size: 13px;">
                  ${metricsCurrent.topCountries.map(([c, v]) => `<li>${escHtml(c)} (${v})</li>`).join('')}
                </ul>
              </div>
            </div>

            <div style="margin-top: 40px; text-align: center;">
              <a href="${Deno.env.get("PUBLIC_SITE_URL") || '#'}/admin/analytics" style="background: #2A9D8F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Ver Dashboard Completo</a>
            </div>
          </div>
          <div style="background: #f4f4f4; padding: 16px; text-align: center; font-size: 11px; color: #888;">
            Este é um relatório automático do Eco Wanderlust.
          </div>
        </div>
      </body>
      </html>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Eco Wanderlust Analytics <reports@' + (Deno.env.get("MAIL_DOMAIN") || 'mg.tocorimerio.com') + '>',
        to: adminEmails,
        subject: `📊 Relatório Mensal de Analytics - ${monthName} ${year}`,
        html: htmlContent
      })
    });

    if (!response.ok) throw new Error(await response.text());

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error generating monthly report:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
