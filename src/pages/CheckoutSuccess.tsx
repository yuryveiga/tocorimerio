import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Users, Calendar, ArrowRight, Loader2, PartyPopper } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLocale } from "@/contexts/LocaleContext";
import { toast } from "sonner";
import { LovableSale } from "@/integrations/lovable/client";
import { Helmet } from "react-helmet-async";
import { getCanonicalUrl } from "@/utils/seo";

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, formatPrice } = useLocale();
  const [sales, setSales] = useState<LovableSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [participants, setParticipants] = useState<Record<string, { name: string; dob: string }[]>>({});

  useEffect(() => {
    const loadSales = async () => {
      const saleIdsStr = searchParams.get("sale_ids");
      if (!saleIdsStr) {
        setLoading(false);
        return;
      }

      try {
        const saleIds = JSON.parse(saleIdsStr);

        // Trigger Stripe sync as a fallback in case the webhook didn't fire.
        // This guarantees the sale gets marked as paid + notifications sent.
        supabase.functions.invoke("sync-stripe", { body: { limit: 20 } }).catch((e) => {
          console.warn("sync-stripe invocation failed:", e);
        });

        const { data, error } = await supabase
          .from("sales")
          .select("*")
          .in("id", saleIds);

        if (error) throw error;
        
        if (data) {
          setSales(data as unknown as LovableSale[]);
          // Initialize participants state
          const initialParticipants: Record<string, { name: string; dob: string }[]> = {};
          data.forEach(sale => {
            initialParticipants[sale.id] = Array.from({ length: sale.quantity || 1 }, () => ({ name: "", dob: "" }));
          });
          setParticipants(initialParticipants);
        }
      } catch (error: unknown) {
        console.error("Error loading sales:", error);
        toast.error("Erro ao carregar dados da reserva");
      } finally {
        setLoading(false);
      }
    };

    loadSales();
  }, [searchParams]);

  const handleParticipantChange = (saleId: string, index: number, field: 'name' | 'dob', value: string) => {
    setParticipants(prev => {
      const saleParticipants = [...(prev[saleId] || [])];
      saleParticipants[index] = { ...saleParticipants[index], [field]: value };
      return { ...prev, [saleId]: saleParticipants };
    });
  };

  const handleSubmit = async () => {
    // Check if all names are filled (at least names)
    for (const saleId in participants) {
      const incomplete = participants[saleId].some(p => !p.name);
      if (incomplete) {
        toast.error("Por favor, preencha o nome de todos os participantes.");
        return;
      }
    }

    setSubmitting(true);
    try {
      for (const saleId in participants) {
        const { error } = await supabase
          .from("sales")
          .update({ passengers_json: participants[saleId] as any })
          .eq("id", saleId);

        if (error) throw error;
      }

      toast.success("Dados salvos com sucesso!");
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      console.error("Error saving participants:", error);
      toast.error("Erro ao salvar dados");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <CheckCircle2 className="w-20 h-20 text-green-500 mb-6" />
        <h1 className="text-3xl font-serif font-bold mb-4">Pagamento Confirmado!</h1>
        <p className="text-muted-foreground mb-8">Sua reserva foi processada com sucesso.</p>
        <Button onClick={() => navigate("/")}>Ir para a Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Helmet>
        <title>Reserva Confirmada | Tocorime Rio</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={getCanonicalUrl("/confirmacao")} />
      </Helmet>
      <Header />
      
      <main className="flex-1 max-w-4xl mx-auto px-4 py-24 w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6 animate-bounce">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-serif font-black text-foreground mb-2 flex items-center justify-center gap-3">
            <PartyPopper className="text-primary w-8 h-8" />
            Pagamento Confirmado!
          </h1>
          <p className="text-muted-foreground text-lg">
            Agora, para garantir seu seguro e reserva, preencha os dados dos passageiros abaixo.
          </p>
        </div>

        <div className="space-y-8">
          {sales.map((sale) => (
            <div key={sale.id} className="bg-card rounded-3xl border border-border/50 shadow-xl overflow-hidden group hover:border-primary/20 transition-all">
              <div className="p-6 bg-gradient-to-r from-primary/5 to-transparent border-b border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-foreground">{sale.tour_title}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-widest">
                      <Calendar className="w-3 h-3" />
                      {sale.selected_date} • {sale.quantity} pessoas
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-8">
                {participants[sale.id]?.map((participant, index) => (
                  <div key={index} className="space-y-4">
                    <div className="flex items-center gap-3 text-sm font-black text-primary/70 uppercase tracking-tighter">
                      <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px]">
                        {index + 1}
                      </span>
                      Passageiro {index + 1}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-muted-foreground ml-1">Nome Completo</Label>
                        <Input 
                          placeholder="Ex: João Silva" 
                          className="h-12 rounded-xl focus:ring-primary/20"
                          value={participant.name}
                          onChange={(e) => handleParticipantChange(sale.id, index, 'name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-muted-foreground ml-1">Data de Nascimento</Label>
                        <Input 
                          type="date"
                          className="h-12 rounded-xl focus:ring-primary/20"
                          value={participant.dob}
                          onChange={(e) => handleParticipantChange(sale.id, index, 'dob', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <Button 
            onClick={handleSubmit} 
            disabled={submitting}
            className="w-full h-16 rounded-2xl text-xl font-black shadow-2xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-[0.98] group"
          >
            {submitting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <div className="flex items-center gap-2">
                Concluir Cadastro
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </div>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground mt-8 px-8">
            Seus dados estão protegidos por criptografia de ponta a ponta e serão utilizados exclusivamente para fins de seguro e logística do passeio.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutSuccess;
