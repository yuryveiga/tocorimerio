import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { LovableTour, insertLovable } from "@/integrations/lovable/client";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Copy, ExternalLink } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  tours: LovableTour[];
}

export default function StripeCheckoutDialog({ open, onClose, tours }: Props) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [tourId, setTourId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [pricePerPerson, setPricePerPerson] = useState(0);
  const [addFee, setAddFee] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState("");
  const { toast } = useToast();

  const selectedTour = useMemo(() => tours.find(t => t.id === tourId), [tours, tourId]);

  const subtotal = pricePerPerson * quantity;
  const fee = addFee ? subtotal * 0.05 : 0;
  const total = subtotal + fee;

  const handleTourChange = (id: string) => {
    setTourId(id);
    const tour = tours.find(t => t.id === id);
    if (tour) setPricePerPerson(tour.price || 0);
  };

  const handleGenerate = async () => {
    if (!customerName || !customerEmail || !tourId || !selectedDate) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setGeneratedUrl("");

    try {
      // Save sale as pending
      const savedSale = await insertLovable("sales", {
        tour_id: tourId,
        tour_title: selectedTour?.title || "",
        tour_slug: selectedTour?.slug || "",
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        quantity,
        total_price: total,
        selected_date: selectedDate,
        is_paid: false,
        is_private: true,
        provider: "tour",
      });

      const saleId = (savedSale as { id?: string })?.id;

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          items: [{
            title: selectedTour?.title || "Passeio",
            quantity,
            price: pricePerPerson,
            date: selectedDate,
            period: "",
          }],
          sale_ids: saleId ? [saleId] : [],
          apply_fee: addFee,
        },
      });

      if (error) throw error;
      if (data?.url) {
        // Shorten URL via TinyURL
        try {
          const shortRes = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(data.url)}`);
          if (shortRes.ok) {
            const shortUrl = await shortRes.text();
            setGeneratedUrl(shortUrl);
          } else {
            setGeneratedUrl(data.url);
          }
        } catch {
          setGeneratedUrl(data.url);
        }
        toast({ title: "Link gerado e reserva salva!" });
      } else {
        throw new Error("Nenhum link retornado");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      toast({ title: "Erro ao gerar link", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(generatedUrl);
    toast({ title: "Link copiado!" });
  };

  const reset = () => {
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setTourId("");
    setQuantity(1);
    setSelectedDate("");
    setPricePerPerson(0);
    setAddFee(false);
    setGeneratedUrl("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Criar Link do Stripe</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="checkout-customer-name">Nome do Cliente *</Label>
            <Input id="checkout-customer-name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nome completo" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkout-customer-phone">Telefone</Label>
              <Input id="checkout-customer-phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="(21) 99999-9999" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkout-customer-email">Email *</Label>
              <Input id="checkout-customer-email" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="email@exemplo.com" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="checkout-tour-select">Passeio *</Label>
            <select
              id="checkout-tour-select"
              value={tourId}
              onChange={(e) => handleTourChange(e.target.value)}
              className="w-full h-10 rounded-md border bg-background px-3 py-2"
            >
              <option value="">Selecione o passeio</option>
              {tours.map(tour => (
                <option key={tour.id} value={tour.id}>{tour.title}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkout-quantity">Pessoas *</Label>
              <Input id="checkout-quantity" type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkout-date">Data *</Label>
              <Input id="checkout-date" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkout-price">Valor/pessoa</Label>
              <Input id="checkout-price" type="number" min={0} step={0.01} value={pricePerPerson} onChange={(e) => setPricePerPerson(Number(e.target.value))} />
            </div>
          </div>

          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span className="font-medium">{formatCurrency(pricePerPerson * quantity)}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Checkbox id="add-fee" checked={addFee} onCheckedChange={(c) => setAddFee(c === true)} />
              <Label htmlFor="add-fee" className="text-sm cursor-pointer">Cobrar taxa de serviço (5%)</Label>
            </div>
            {addFee && (
              <div className="flex justify-between text-sm mt-2">
                <span>Taxa de Serviço (5%):</span>
                <span className="font-medium">{formatCurrency(fee)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-primary/20">
              <span>Total Final:</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>
          </div>

          {generatedUrl ? (
            <div className="space-y-3">
              <div className="p-3 rounded-lg border bg-green-50 border-green-200">
                <p className="text-xs text-green-700 font-medium mb-2">Link gerado com sucesso!</p>
                <p className="text-xs text-muted-foreground break-all">{generatedUrl}</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={copyLink} variant="outline" className="flex-1">
                  <Copy className="w-4 h-4 mr-2" /> Copiar Link
                </Button>
                <Button onClick={() => window.open(generatedUrl, "_blank")} className="flex-1">
                  <ExternalLink className="w-4 h-4 mr-2" /> Abrir
                </Button>
              </div>
              <Button variant="ghost" onClick={reset} className="w-full text-sm">
                Gerar outro link
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">Cancelar</Button>
              <Button onClick={handleGenerate} disabled={isLoading} className="flex-1">
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Gerar Link
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
