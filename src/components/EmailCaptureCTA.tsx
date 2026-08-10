import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, Loader2, CheckCircle2, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useLocale } from "@/contexts/LocaleContext";

const schema = z.object({
  name: z.string().trim().max(120).optional(),
  email: z.string().trim().email().max(255),
});

const COPY = {
  pt: {
    tag: "Guia grátis + ofertas",
    title: "Receba o Guia do Rio (grátis) e ofertas exclusivas",
    text: "Dicas de bairros, segurança e roteiros prontos direto no seu e-mail — mais descontos em passeios privativos.",
    name: "Seu nome (opcional)",
    email: "Seu melhor e-mail",
    cta: "Quero receber",
    ok: "Pronto! Confira seu e-mail em instantes.",
    dup: "Você já está na nossa lista. Obrigado!",
    err: "Não foi possível cadastrar. Tente novamente.",
    invalid: "Digite um e-mail válido.",
    privacy: "Sem spam. Cancele quando quiser.",
  },
  es: {
    tag: "Guía gratis + ofertas",
    title: "Recibe la Guía de Río (gratis) y ofertas exclusivas",
    text: "Consejos de barrios, seguridad e itinerarios listos en tu correo — además de descuentos en tours privados.",
    name: "Tu nombre (opcional)",
    email: "Tu mejor correo",
    cta: "Quiero recibirla",
    ok: "¡Listo! Revisa tu correo en breve.",
    dup: "Ya estás en nuestra lista. ¡Gracias!",
    err: "No fue posible registrarte. Inténtalo de nuevo.",
    invalid: "Escribe un correo válido.",
    privacy: "Sin spam. Cancela cuando quieras.",
  },
  en: {
    tag: "Free guide + offers",
    title: "Get the free Rio Insider Guide & exclusive offers",
    text: "Neighborhood tips, safety advice and ready-made itineraries in your inbox — plus discounts on private tours.",
    name: "Your name (optional)",
    email: "Your best email",
    cta: "Send it to me",
    ok: "Done! Check your inbox shortly.",
    dup: "You're already on our list. Thank you!",
    err: "Could not subscribe. Please try again.",
    invalid: "Please enter a valid email.",
    privacy: "No spam. Unsubscribe anytime.",
  },
};

interface Props {
  sourceSlug?: string;
}

export const EmailCaptureCTA = ({ sourceSlug }: Props) => {
  const { language } = useLocale();
  const t = COPY[(language as keyof typeof COPY)] || COPY.en;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ name: name || undefined, email });
    if (!parsed.success) {
      toast.error(t.invalid);
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("email_leads").insert({
      email: parsed.data.email.toLowerCase(),
      name: parsed.data.name ?? null,
      language,
      source_slug: sourceSlug ?? null,
      source_url: typeof window !== "undefined" ? window.location.href : null,
    });
    setLoading(false);

    if (error) {
      if (error.code === "23505") {
        setDone(true);
        toast.success(t.dup);
        return;
      }
      toast.error(t.err);
      return;
    }
    setDone(true);
    toast.success(t.ok);
  };

  return (
    <section className="mt-16 p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-accent/10 via-primary/5 to-transparent border border-accent/20 relative overflow-hidden">
      <div className="absolute -top-16 -right-16 w-40 h-40 bg-accent/10 rounded-full" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <Gift className="w-4 h-4 text-accent" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">{t.tag}</span>
        </div>
        <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-3 text-foreground leading-tight">{t.title}</h3>
        <p className="text-muted-foreground mb-6 max-w-2xl">{t.text}</p>

        {done ? (
          <div className="flex items-center gap-3 text-primary font-semibold">
            <CheckCircle2 className="w-5 h-5" />
            <span>{t.ok}</span>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.name}
              maxLength={120}
              aria-label={t.name}
              className="h-12 rounded-full bg-background/80"
            />
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.email}
              maxLength={255}
              aria-label={t.email}
              className="h-12 rounded-full bg-background/80"
            />
            <Button type="submit" disabled={loading} size="lg" className="h-12 rounded-full px-8 font-bold uppercase tracking-wider shrink-0">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
              {!loading && t.cta}
            </Button>
          </form>
        )}
        <p className="text-xs text-muted-foreground mt-3">{t.privacy}</p>
      </div>
    </section>
  );
};
