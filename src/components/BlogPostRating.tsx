import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLocale } from "@/contexts/LocaleContext";

const STORAGE_KEY = "blog_visitor_key";

function getVisitorKey(): string {
  try {
    let k = localStorage.getItem(STORAGE_KEY);
    if (!k) {
      k = (crypto.randomUUID?.() ?? `v-${Date.now()}-${Math.random().toString(36).slice(2)}`);
      localStorage.setItem(STORAGE_KEY, k);
    }
    return k;
  } catch {
    return `v-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

interface Props {
  postId: string;
}

const T = {
  pt: {
    title: "Avalie este artigo",
    subtitle: "Sua opinião ajuda outros viajantes.",
    placeholder: "Deixe um comentário (opcional)",
    submit: "Enviar avaliação",
    thanks: "Obrigado pela sua avaliação!",
    already: "Você já avaliou este artigo.",
    error: "Não foi possível enviar. Tente novamente.",
    pickStar: "Selecione uma nota primeiro.",
    avg: (n: number, count: number) => `${n.toFixed(1)} de 5 · ${count} avaliaç${count === 1 ? "ão" : "ões"}`,
    noneYet: "Seja o primeiro a avaliar",
  },
  en: {
    title: "Rate this article",
    subtitle: "Your feedback helps other travelers.",
    placeholder: "Leave a comment (optional)",
    submit: "Submit rating",
    thanks: "Thanks for your rating!",
    already: "You already rated this article.",
    error: "Could not submit. Please try again.",
    pickStar: "Please pick a rating first.",
    avg: (n: number, count: number) => `${n.toFixed(1)} of 5 · ${count} rating${count === 1 ? "" : "s"}`,
    noneYet: "Be the first to rate",
  },
  es: {
    title: "Califica este artículo",
    subtitle: "Tu opinión ayuda a otros viajeros.",
    placeholder: "Deja un comentario (opcional)",
    submit: "Enviar calificación",
    thanks: "¡Gracias por tu calificación!",
    already: "Ya calificaste este artículo.",
    error: "No se pudo enviar. Intenta de nuevo.",
    pickStar: "Selecciona una calificación primero.",
    avg: (n: number, count: number) => `${n.toFixed(1)} de 5 · ${count} calificación${count === 1 ? "" : "es"}`,
    noneYet: "Sé el primero en calificar",
  },
} as const;

export function BlogPostRating({ postId }: Props) {
  const { language } = useLocale();
  const lang = (T as any)[language] ? language : "en";
  const t = (T as any)[lang] as typeof T.en;

  const [avg, setAvg] = useState<number | null>(null);
  const [count, setCount] = useState(0);
  const [selected, setSelected] = useState(0);
  const [hover, setHover] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const visitorKey = getVisitorKey();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("blog_post_ratings")
        .select("stars, visitor_key")
        .eq("post_id", postId);
      if (cancelled || !data) return;
      if (data.length) {
        const sum = data.reduce((s, r: any) => s + r.stars, 0);
        setAvg(sum / data.length);
        setCount(data.length);
      } else {
        setAvg(null);
        setCount(0);
      }
      if (data.some((r: any) => r.visitor_key === visitorKey)) {
        setSubmitted(true);
      }
    })();
    return () => { cancelled = true; };
  }, [postId, visitorKey]);

  const submit = async (stars: number, withComment = false) => {
    if (!stars) {
      toast.error(t.pickStar);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("blog_post_ratings").insert({
      post_id: postId,
      stars,
      comment: withComment ? (comment.trim().slice(0, 1000) || null) : null,
      visitor_key: visitorKey,
      user_agent: navigator.userAgent.slice(0, 500),
    });
    setSubmitting(false);
    if (error) {
      if (error.code === "23505") {
        setSubmitted(true);
        toast.info(t.already);
      } else {
        toast.error(t.error);
      }
      return;
    }
    setSubmitted(true);
    setCount((c) => c + 1);
    setAvg((prev) => {
      const newCount = count + 1;
      const sum = (prev ?? 0) * count + stars;
      return sum / newCount;
    });
    toast.success(t.thanks);
  };


  const displayValue = hover || selected;

  return (
    <div className="mt-12 p-8 sm:p-10 rounded-2xl bg-muted/30 border border-border/50">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h4 className="font-serif text-2xl font-bold text-foreground">{t.title}</h4>
          <p className="text-sm text-muted-foreground mt-1">{t.subtitle}</p>
        </div>
        <div className="text-sm font-semibold text-muted-foreground shrink-0">
          {avg !== null ? t.avg(avg, count) : t.noneYet}
        </div>
      </div>

      {submitted ? (
        <div className="flex items-center gap-3 text-primary">
          <div className="flex" aria-label={`Your rating: ${selected || Math.round(avg || 0)} of 5`}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className={`w-6 h-6 ${n <= (selected || Math.round(avg || 0)) ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
              />
            ))}
          </div>
          <span className="text-sm font-medium">{t.thanks}</span>
        </div>
      ) : (
        <div
          className="flex gap-1 -ml-2"
          onMouseLeave={() => setHover(0)}
          role="radiogroup"
          aria-label={t.title}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              disabled={submitting}
              onMouseEnter={() => setHover(n)}
              onFocus={() => setHover(n)}
              onClick={() => { setSelected(n); submit(n); }}
              aria-label={`${n} star${n === 1 ? "" : "s"}`}
              aria-checked={selected === n}
              role="radio"
              className="p-2.5 min-w-[44px] min-h-[44px] transition-transform active:scale-95 hover:scale-110 disabled:opacity-60"
            >
              <Star
                className={`w-8 h-8 transition-colors ${n <= displayValue ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40"}`}
              />
            </button>
          ))}
        </div>
      )}

    </div>
  );
}

export default BlogPostRating;