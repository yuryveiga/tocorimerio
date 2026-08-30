import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LovableSale } from "@/integrations/lovable/client";
import { Phone, Mail, Calendar, Users, MapPin, Clock, DollarSign, X, Link2, Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SaleDetailDialogProps {
  sale: LovableSale | null;
  open: boolean;
  onClose: () => void;
}

const SaleDetailDialog = ({ sale, open, onClose }: SaleDetailDialogProps) => {
  const { toast } = useToast();
  if (!sale) return null;

  const copyPaymentLink = () => {
    if (!sale.payment_link) return;
    navigator.clipboard.writeText(sale.payment_link);
    toast({ title: "Link copiado!" });
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);

  const formatDate = (date: string) => {
    const parts = date.split("-");
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return date;
  };

  const whatsappNumber = sale.customer_phone
    ? sale.customer_phone.replace(/\D/g, "")
    : "";

  const whatsappUrl = whatsappNumber
    ? `https://wa.me/55${whatsappNumber.replace(/^55/, "")}?text=${encodeURIComponent("Hello")}`
    : "";

  const statusLabel = sale.is_cancelled
    ? "Cancelado"
    : sale.is_paid
    ? "Pago"
    : "Pendente";

  const statusClass = sale.is_cancelled
    ? "bg-red-100 text-red-700"
    : sale.is_paid
    ? "bg-green-100 text-green-700"
    : "bg-yellow-100 text-yellow-700";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-primary/5 border-b p-6 pb-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center justify-between">
              <span>Detalhes da Reserva</span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusClass}`}>
                {statusLabel}
              </span>
            </DialogTitle>
          </DialogHeader>
          <p className="text-lg font-semibold text-primary mt-2">{sale.tour_title || "Passeio"}</p>
        </div>

        <div className="p-6 space-y-5">
          {/* Cliente */}
          <div>
            <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-3">Cliente</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="font-semibold">{sale.customer_name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                <a href={`mailto:${sale.customer_email}`} className="text-primary hover:underline text-sm">
                  {sale.customer_email}
                </a>
              </div>
              {sale.customer_phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-sm">{sale.customer_phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Reserva */}
          <div>
            <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-3">Reserva</h4>
            <div className="grid grid-cols-2 gap-3">
              {sale.selected_date && (
                <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Data</p>
                    <p className="text-sm font-semibold">{formatDate(sale.selected_date)}</p>
                  </div>
                </div>
              )}
              {sale.selected_period && (
                <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Período</p>
                    <p className="text-sm font-semibold">{sale.selected_period}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3">
                <Users className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Pessoas</p>
                  <p className="text-sm font-semibold">{sale.quantity || 1}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3">
                <DollarSign className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Total</p>
                  <p className="text-sm font-bold text-primary">{formatPrice(sale.total_price || 0)}</p>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Tipo:</span>
              <span className="font-semibold">{sale.is_private ? "Privativo" : "Aberto"}</span>
            </div>
          </div>

          {/* Link de Pagamento (Stripe manual) */}
          {sale.payment_link && (
            <div>
              <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-3 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5" /> Link de Pagamento
              </h4>
              <div className="rounded-lg border bg-primary/5 border-primary/20 p-3 space-y-2">
                <p className="text-xs text-muted-foreground break-all">{sale.payment_link}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={copyPaymentLink}>
                    <Copy className="w-3.5 h-3.5 mr-1.5" /> Copiar
                  </Button>
                  <Button size="sm" className="flex-1" onClick={() => window.open(sale.payment_link!, "_blank")}>
                    <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Abrir
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Passageiros */}
          {sale.passengers_json && sale.passengers_json.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-3">Passageiros</h4>
              <div className="bg-primary/5 rounded-xl p-4 border border-primary/10 space-y-3">
                {sale.passengers_json.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm border-b border-primary/10 last:border-0 pb-2 last:pb-0">
                    <div className="flex items-center gap-2">
                       <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">{idx + 1}</span>
                       <span className="font-medium">{p.name}</span>
                    </div>
                    <span className="text-muted-foreground text-xs">{p.dob ? formatDate(p.dob) : ""}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-3 pt-2">
            {whatsappUrl && (
              <Button asChild className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <Phone className="w-4 h-4 mr-2" />
                  WhatsApp
                </a>
              </Button>
            )}
            <Button asChild variant="outline" className="flex-1">
              <a href={`mailto:${sale.customer_email}`}>
                <Mail className="w-4 h-4 mr-2" />
                Email
              </a>
            </Button>
          </div>

          {/* Meta */}
          <div className="text-[10px] text-muted-foreground text-center pt-2 border-t">
            ID: {sale.id} · Criado em: {new Date(sale.created_at).toLocaleString("pt-BR")}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SaleDetailDialog;
