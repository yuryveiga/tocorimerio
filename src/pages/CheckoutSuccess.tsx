import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2, Users, Calendar, ArrowRight, Loader2,
  PartyPopper, Download, Share2, Globe,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLocale } from "@/contexts/LocaleContext";
import { toast } from "sonner";
import { LovableSale } from "@/integrations/lovable/client";
import { Helmet } from "react-helmet-async";
import { getCanonicalUrl } from "@/utils/seo";

// ─── Inline translations for the confirmation page ───────────────────────────
const i18n = {
  pt: {
    title: "Reserva Confirmada | Tocorime Rio",
    heading: "Pagamento Confirmado!",
    subheading: "Agora, para garantir seu seguro e reserva, preencha os dados dos passageiros abaixo.",
    fallback_heading: "Pagamento Confirmado!",
    fallback_sub: "Sua reserva foi processada com sucesso.",
    fallback_btn: "Ir para a Home",
    pax_label: (n: number) => `Passageiro ${n}`,
    name_label: "Nome Completo",
    name_placeholder: "Ex: João Silva",
    dob_label: "Data de Nascimento",
    submit: "Concluir Cadastro",
    submitting: "Salvando...",
    success: "Dados salvos com sucesso!",
    error_name: "Por favor, preencha o nome de todos os participantes.",
    error_save: "Erro ao salvar dados",
    error_load: "Erro ao carregar dados da reserva",
    privacy: "Seus dados estão protegidos por criptografia de ponta a ponta e serão utilizados exclusivamente para fins de seguro e logística do passeio.",
    download: "Baixar Comprovante",
    share_wa: "Compartilhar no WhatsApp",
    people: (n: number) => `${n} pessoa${n > 1 ? "s" : ""}`,
    tour_label: "Tour",
    date_label: "Data",
    booking_ref: "Referência",
    wa_text: (title: string, date: string, qty: number) =>
      `✅ *Reserva Confirmada!*\n\n🗺️ *Tour:* ${title}\n📅 *Data:* ${date}\n👥 *Pessoas:* ${qty}\n\nAgradecemos pela reserva! Entraremos em contato em breve. 🌟`,
  },
  en: {
    title: "Booking Confirmed | Tocorime Rio",
    heading: "Payment Confirmed!",
    subheading: "To secure your booking and insurance, please fill in the passenger details below.",
    fallback_heading: "Payment Confirmed!",
    fallback_sub: "Your booking was successfully processed.",
    fallback_btn: "Go to Home",
    pax_label: (n: number) => `Passenger ${n}`,
    name_label: "Full Name",
    name_placeholder: "Ex: John Smith",
    dob_label: "Date of Birth",
    submit: "Complete Registration",
    submitting: "Saving...",
    success: "Data saved successfully!",
    error_name: "Please fill in the name of all passengers.",
    error_save: "Error saving data",
    error_load: "Error loading booking data",
    privacy: "Your data is protected by end-to-end encryption and will be used solely for insurance and tour logistics purposes.",
    download: "Download Voucher",
    share_wa: "Share on WhatsApp",
    people: (n: number) => `${n} person${n > 1 ? "s" : ""}`,
    tour_label: "Tour",
    date_label: "Date",
    booking_ref: "Reference",
    wa_text: (title: string, date: string, qty: number) =>
      `✅ *Booking Confirmed!*\n\n🗺️ *Tour:* ${title}\n📅 *Date:* ${date}\n👥 *People:* ${qty}\n\nThank you for your booking! We will be in touch shortly. 🌟`,
  },
  es: {
    title: "Reserva Confirmada | Tocorime Rio",
    heading: "¡Pago Confirmado!",
    subheading: "Para garantizar tu seguro y reserva, completa los datos de los pasajeros a continuación.",
    fallback_heading: "¡Pago Confirmado!",
    fallback_sub: "Tu reserva fue procesada con éxito.",
    fallback_btn: "Ir al Inicio",
    pax_label: (n: number) => `Pasajero ${n}`,
    name_label: "Nombre Completo",
    name_placeholder: "Ej: Juan García",
    dob_label: "Fecha de Nacimiento",
    submit: "Completar Registro",
    submitting: "Guardando...",
    success: "¡Datos guardados con éxito!",
    error_name: "Por favor, completa el nombre de todos los pasajeros.",
    error_save: "Error al guardar los datos",
    error_load: "Error al cargar los datos de la reserva",
    privacy: "Tus datos están protegidos por cifrado de extremo a extremo y se utilizarán exclusivamente para fines de seguro y logística del tour.",
    download: "Descargar Comprobante",
    share_wa: "Compartir en WhatsApp",
    people: (n: number) => `${n} persona${n > 1 ? "s" : ""}`,
    tour_label: "Tour",
    date_label: "Fecha",
    booking_ref: "Referencia",
    wa_text: (title: string, date: string, qty: number) =>
      `✅ *¡Reserva Confirmada!*\n\n🗺️ *Tour:* ${title}\n📅 *Fecha:* ${date}\n👥 *Personas:* ${qty}\n\n¡Gracias por tu reserva! Nos pondremos en contacto pronto. 🌟`,
  },
} as const;

type Lang = keyof typeof i18n;

// ─── Component ────────────────────────────────────────────────────────────────
const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language } = useLocale();

  // Derive initial lang from global locale (only pt/en/es supported here)
  const initialLang: Lang = (["pt", "en", "es"].includes(language) ? language : "en") as Lang;
  const [lang, setLang] = useState<Lang>(initialLang);
  const tr = i18n[lang];

  const [sales, setSales] = useState<LovableSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [participants, setParticipants] = useState<Record<string, { name: string; dob: string }[]>>({});
  const voucherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadSales = async () => {
      const saleIdsStr = searchParams.get("sale_ids");

      // ── Preview mode: inject mock data when no sale_ids in URL ──
      if (!saleIdsStr) {
        const mockSale = {
          id: "mock-preview-001",
          tour_title: "City Tour Expresso",
          selected_date: new Date().toISOString().slice(0, 10),
          selected_period: "morning",
          quantity: 3,
          total_price: 2100,
          is_paid: true,
          is_archived: false,
          customer_name: "João Silva",
          customer_email: "joao@example.com",
        } as unknown as LovableSale;
        setSales([mockSale]);
        setParticipants({
          "mock-preview-001": [
            { name: "", dob: "" },
            { name: "", dob: "" },
            { name: "", dob: "" },
          ],
        });
        setLoading(false);
        return;
      }

      try {
        const saleIds = JSON.parse(saleIdsStr);
        supabase.functions.invoke("sync-stripe", { body: { limit: 20, saleIds } }).catch(() => {});
        const { data, error } = await supabase.rpc("get_sales_by_ids", { _ids: saleIds });
        if (error) throw error;
        if (data) {
          setSales(data as unknown as LovableSale[]);
          const init: Record<string, { name: string; dob: string }[]> = {};
          data.forEach(s => {
            init[s.id] = Array.from({ length: s.quantity || 1 }, () => ({ name: "", dob: "" }));
          });
          setParticipants(init);
        }
      } catch {
        toast.error(tr.error_load);
      } finally {
        setLoading(false);
      }
    };
    loadSales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleParticipantChange = (saleId: string, idx: number, field: "name" | "dob", value: string) => {
    setParticipants(prev => {
      const arr = [...(prev[saleId] || [])];
      arr[idx] = { ...arr[idx], [field]: value };
      return { ...prev, [saleId]: arr };
    });
  };

  const handleSubmit = async () => {
    for (const saleId in participants) {
      if (participants[saleId].some(p => !p.name)) {
        toast.error(tr.error_name);
        return;
      }
    }
    setSubmitting(true);
    try {
      for (const saleId in participants) {
        const { error } = await supabase.rpc("set_sale_passengers", {
          _id: saleId,
          _passengers: participants[saleId] as any,
        });
        if (error) throw error;
      }
      toast.success(tr.success);
      setSubmitted(true);
    } catch {
      toast.error(tr.error_save);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Download voucher via browser print ──
  const handleDownload = () => {
    const printContent = document.getElementById("voucher-print-area");
    if (!printContent) return;
    const w = window.open("", "_blank", "width=800,height=600");
    if (!w) return;
    w.document.write(`
      <html>
        <head>
          <title>Voucher – Tocorime Rio</title>
          <meta charset="utf-8" />
          <style>
            body { font-family: Georgia, serif; padding: 40px; color: #111; }
            h1 { font-size: 28px; margin-bottom: 4px; }
            .sub { color: #555; font-size: 14px; margin-bottom: 32px; }
            .card { border: 1px solid #ddd; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
            .label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 2px; }
            .value { font-size: 16px; font-weight: bold; }
            .row { display: flex; gap: 32px; margin-bottom: 12px; }
            .logo { font-size: 22px; font-weight: bold; color: #16a34a; margin-bottom: 8px; }
            .seal { margin-top: 32px; padding: 12px 0; border-top: 1px solid #eee; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>${printContent.innerHTML}</body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 400);
  };

  // ── Share via WhatsApp ──
  const handleWhatsApp = () => {
    if (sales.length === 0) return;
    const first = sales[0];
    const text = tr.wa_text(
      first.tour_title || "",
      first.selected_date || "",
      first.quantity || 1
    );
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  // ─── Fallback (no sales) ───────────────────────────────────────────────────
  if (sales.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <CheckCircle2 className="w-20 h-20 text-green-500 mb-6" />
        <h1 className="text-3xl font-serif font-bold mb-4">{tr.fallback_heading}</h1>
        <p className="text-muted-foreground mb-8">{tr.fallback_sub}</p>
        <Button onClick={() => navigate("/")}>{tr.fallback_btn}</Button>
      </div>
    );
  }

  // ─── Lang flags ──
  const langs: { code: Lang; flag: string; label: string }[] = [
    { code: "pt", flag: "🇧🇷", label: "PT" },
    { code: "en", flag: "🇬🇧", label: "EN" },
    { code: "es", flag: "🇪🇸", label: "ES" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Helmet>
        <title>{tr.title}</title>
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href={getCanonicalUrl("/confirmacao")} />
      </Helmet>
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-24 w-full">

        {/* ── Language switcher ── */}
        <div className="flex justify-end mb-6 gap-2">
          <Globe className="w-4 h-4 text-muted-foreground mt-0.5" />
          {langs.map(l => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border transition-all
                ${lang === l.code
                  ? "bg-primary text-white border-primary shadow"
                  : "bg-background border-border text-muted-foreground hover:border-primary/50"}`}
            >
              <span>{l.flag}</span> {l.label}
            </button>
          ))}
        </div>

        {/* ── Hero ── */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6 animate-bounce">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-serif font-black text-foreground mb-2 flex items-center justify-center gap-3">
            <PartyPopper className="text-primary w-8 h-8" />
            {tr.heading}
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">{tr.subheading}</p>
        </div>

        {/* ── Action buttons (download + WhatsApp) ── */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <Button
            variant="outline"
            className="gap-2 rounded-xl border-border hover:border-primary/40"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4" />
            {tr.download}
          </Button>
          <Button
            variant="outline"
            className="gap-2 rounded-xl border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400"
            onClick={handleWhatsApp}
          >
            <Share2 className="w-4 h-4" />
            {tr.share_wa}
          </Button>
        </div>

        {/* ── Voucher (also used as print area) ── */}
        <div id="voucher-print-area" ref={voucherRef}>
          {/* Print-only header */}
          <div className="hidden print:block mb-6">
            <div className="text-2xl font-bold text-green-600">Tocorime Rio</div>
            <div className="text-sm text-gray-500">tocorime.com.br</div>
          </div>

          <div className="space-y-8">
            {sales.map(sale => (
              <div key={sale.id} className="bg-card rounded-3xl border border-border/50 shadow-xl overflow-hidden group hover:border-primary/20 transition-all">
                {/* Card header */}
                <div className="p-6 bg-gradient-to-r from-primary/5 to-transparent border-b border-border/50 flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-bold text-foreground">{sale.tour_title}</h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {sale.selected_date}
                        </span>
                        <span>•</span>
                        <span>{tr.people(sale.quantity || 1)}</span>
                      </div>
                    </div>
                  </div>
                  {/* Booking ref */}
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{tr.booking_ref}</div>
                    <div className="font-mono text-xs font-bold text-foreground">{sale.id?.slice(0, 8).toUpperCase()}</div>
                  </div>
                </div>

                {/* Passengers form */}
                {!submitted && (
                  <div className="p-8 space-y-8">
                    {participants[sale.id]?.map((participant, idx) => (
                      <div key={idx} className="space-y-4">
                        <div className="flex items-center gap-3 text-sm font-black text-primary/70 uppercase tracking-tighter">
                          <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          {tr.pax_label(idx + 1)}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground ml-1">{tr.name_label}</Label>
                            <Input
                              placeholder={tr.name_placeholder}
                              className="h-12 rounded-xl focus:ring-primary/20"
                              value={participant.name}
                              onChange={e => handleParticipantChange(sale.id, idx, "name", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground ml-1">{tr.dob_label}</Label>
                            <Input
                              type="date"
                              className="h-12 rounded-xl focus:ring-primary/20"
                              value={participant.dob}
                              onChange={e => handleParticipantChange(sale.id, idx, "dob", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Submitted state: show saved passengers */}
                {submitted && participants[sale.id]?.length > 0 && (
                  <div className="p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {participants[sale.id].map((p, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-3">
                          <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="font-semibold text-sm">{p.name}</div>
                            {p.dob && <div className="text-xs text-muted-foreground">{p.dob}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Submit / Navigate ── */}
        {!submitted ? (
          <>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full h-16 rounded-2xl text-xl font-black shadow-2xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-[0.98] group mt-8"
            >
              {submitting ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                  {tr.submit}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </div>
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-6 px-8">{tr.privacy}</p>
          </>
        ) : (
          <Button
            onClick={() => navigate("/")}
            className="w-full h-14 rounded-2xl text-lg font-bold mt-8 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            {tr.fallback_btn}
          </Button>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutSuccess;
