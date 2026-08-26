import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function ShortLinkRedirect() {
  const { code } = useParams<{ code: string }>();
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const resolve = async () => {
      if (!code) {
        setNotFound(true);
        return;
      }

      const { data, error } = await supabase
        .from("short_links")
        .select("target_url")
        .eq("code", code)
        .maybeSingle();

      if (cancelled) return;

      if (error || !data?.target_url) {
        setNotFound(true);
        return;
      }

      window.location.replace(data.target_url);
    };

    resolve();
    return () => {
      cancelled = true;
    };
  }, [code]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
      <meta name="robots" content="noindex, nofollow" />
      {notFound ? (
        <>
          <h1 className="text-2xl font-semibold">Link inválido ou expirado</h1>
          <p className="text-muted-foreground">
            Este link de pagamento não existe mais. Fale conosco para receber um novo.
          </p>
          <a href="/" className="underline text-primary">
            Voltar ao site
          </a>
        </>
      ) : (
        <>
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Redirecionando para o pagamento seguro...</p>
        </>
      )}
    </div>
  );
}
