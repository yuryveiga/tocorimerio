import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy, CreditCard, QrCode } from "lucide-react";
import { toast } from "sonner";
import { fmtBRL, PIX_A_PARTIR } from "@/lib/financeiro";

export const stripeMethodFor = (modo: string): "pix" | "card" | null =>
  modo === "Pix" ? "pix" : modo === "Cartão de crédito" || modo === "Cartão de débito" || modo === "Stripe" ? "card" : null;

type Res = { type: "pix"; image: string; code: string; expires_at: number } | { type: "card"; url: string };

export function FinStripeButton({ modo, amount, tour, pax, onLink }: { modo: string; amount: number; tour: string; pax: string; onLink: (t: string) => void }) {
  const method = stripeMethodFor(modo); const [busy, setBusy] = useState(false); const [res, setRes] = useState<Res | null>(null);
  if (!method) return null;
  async function gerar() {
    if (!(amount >= 1)) return toast.error("Informe o valor cobrado (mínimo R$ 1,00).");
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("fin-stripe-charge", { body: { method, amount, description: tour, customer_name: pax } });
    setBusy(false);
    const msg = (data as { error?: string })?.error || (error && (await (error as { context?: Response }).context?.json?.().catch(() => null))?.error) || error?.message;
    if (error || !data || (data as { error?: string }).error) return toast.error("Não foi possível gerar: " + msg);
    setRes(data as Res);
    onLink(data.type === "pix" ? "Pix Stripe gerado" : `Link Stripe: ${data.url}`);
  }
  const copy = (t: string) => { navigator.clipboard.writeText(t); toast.success("Copiado!"); };
  return (
    <>
      <Button type="button" variant="secondary" className="h-12 w-full sm:w-auto" disabled={busy} onClick={gerar}>
        {method === "pix" ? <QrCode className="w-4 h-4 mr-2" /> : <CreditCard className="w-4 h-4 mr-2" />}
        {busy ? "Gerando..." : method === "pix" ? `Gerar QR Code Pix (${fmtBRL(amount)})` : `Gerar link de pagamento (${fmtBRL(amount)})`}
      </Button>
      {method === "pix" && <p className="text-xs text-muted-foreground">Pix {PIX_A_PARTIR}</p>}
      <Dialog open={!!res} onOpenChange={o => !o && setRes(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{res?.type === "pix" ? "QR Code Pix" : "Link de pagamento"} · {fmtBRL(amount)}</DialogTitle></DialogHeader>
          {res?.type === "pix" && <div className="space-y-3 text-center">
            <img src={res.image} alt="QR Code Pix" className="mx-auto w-64 h-64 bg-card" />
            <p className="text-xs text-muted-foreground">Válido até {new Date(res.expires_at * 1000).toLocaleString("pt-BR")}</p>
            <p className="text-xs text-muted-foreground">Pix {PIX_A_PARTIR}</p>
            <Button className="w-full h-12" onClick={() => copy(res.code)}><Copy className="w-4 h-4 mr-2" />Copiar Pix copia e cola</Button>
          </div>}
          {res?.type === "card" && <div className="space-y-3">
            <p className="break-all text-sm rounded-md border border-border p-3">{res.url}</p>
            <Button className="w-full h-12" onClick={() => copy(res.url)}><Copy className="w-4 h-4 mr-2" />Copiar link</Button>
            <Button variant="outline" className="w-full h-12" asChild><a href={`https://wa.me/?text=${encodeURIComponent(res.url)}`} target="_blank" rel="noreferrer">Enviar por WhatsApp</a></Button>
          </div>}
        </DialogContent>
      </Dialog>
    </>
  );
}
