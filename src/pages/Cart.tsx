import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { useLocale } from "@/contexts/LocaleContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useSiteData } from "@/hooks/useSiteData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Calendar, Clock, ArrowRight, ShoppingBag, CreditCard, ShieldCheck, Users, Plus, Minus, Check, Compass } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR, enUS, es } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { OptimizedImage } from "@/components/OptimizedImage";
import { PaymentLogos } from "@/components/PaymentLogos";
import { Helmet } from "react-helmet-async";
import { getCanonicalUrl } from "@/utils/seo";

const Cart = () => {
  const { items, removeFromCart, total, clearCart, updateQuantity } = useCart();
  const { t, language, formatPrice, currency } = useLocale();
  const { rates } = useCurrency();
  const dateLocale = language === 'pt' ? ptBR : language === 'es' ? es : enUS;
  const { siteSettings } = useSiteData();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [customerInfo, setCustomerInfo] = useState({ name: "", whatsapp: "", email: "" });
    const feeEnabled = siteSettings?.['service_fee_enabled'] === 'true';
    const serviceFee = feeEnabled ? total * 0.05 : 0;
    const finalTotal = total + serviceFee;

    const handleCheckout = async () => {
    if (items.length === 0) return;
    
    if (!customerInfo.name || !customerInfo.whatsapp || !customerInfo.email) {
      alert(language === 'pt' ? "Preencha seu nome, WhatsApp e e-mail" : "Fill in your name, WhatsApp and email");
      return;
    }
    
    setIsProcessing(true);
    const currentCurrency = currency.toLowerCase();
    const rate = rates[currency] || 1;

    try {
      const saleIds: string[] = [];
      
      // Save sale to database and collect IDs
      for (const item of items) {
        // Calculate rounded price for the DB
        // Agora rate é multiplicador (ex: 0.20 para USD)
        const convertedPrice = Math.round((item.price * rate) * 100) / 100;
        const itemTotal = convertedPrice * item.quantity;
        const itemFee = feeEnabled ? Math.round((itemTotal * 0.05) * 100) / 100 : 0;
        const totalWithFee = Math.round((itemTotal + itemFee) * 100) / 100;

        console.log(`Inserting sale for ${item.title}:`, {
          tour_id: item.id,
          total_price: totalWithFee,
          quantity: item.quantity
        });

        const { data, error } = await supabase.from("sales").insert({
          tour_id: item.id,
          tour_title: item.title,
          tour_slug: item.slug,
          customer_name: customerInfo.name,
          customer_email: customerInfo.email,
          customer_phone: customerInfo.whatsapp,
          quantity: item.quantity,
          total_price: totalWithFee,
          selected_date: item.date,
          selected_period: item.period,
          is_private: item.isPrivate,
          is_paid: false,
          currency: currency, // Savando a moeda original (BRL, USD, EUR)
          provider: "tour",
        }).select("id").single();

        if (error) {
          console.error("Supabase insert error:", error);
          throw new Error(`Erro ao salvar no banco: ${error.message || JSON.stringify(error)}`);
        }
        
        if (data) {
          saleIds.push(data.id);
        }
      }

      console.log("Sales created successfully, IDs:", saleIds);

      // Now call the Stripe checkout function
      const { data: functionData, error: functionError } = await supabase.functions.invoke("create-checkout", {
        body: {
          items: items.map(item => ({
            id: item.id,
            title: item.title,
            price: Math.round((item.price * rate) * 100) / 100, // Pass unit price in selected currency
            price_brl: item.price,
            quantity: item.quantity,
            date: item.date,
            period: item.period
          })),
          sale_ids: saleIds,
          customer: customerInfo,
          currency: currentCurrency,
          apply_fee: feeEnabled,
        }
      });

      if (functionError) throw functionError;
      if (functionData?.url) {
        window.location.href = functionData.url;
      }
    } catch (error: unknown) {
      console.error("Checkout error details:", error);
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      alert("Houve um erro ao processar seu pagamento:\n" + message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col pt-20 bg-muted/20">
      <Helmet>
        <title>{t("meu_carrinho")} | Tocorime Rio</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={getCanonicalUrl("/carrinho")} />
      </Helmet>
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Items List */}
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <ShoppingBag className="w-8 h-8 text-primary" />
              <h1 className="font-serif text-3xl font-bold">{t("meu_carrinho")}</h1>
            </div>

            {items.length === 0 ? (
              <div className="bg-card rounded-3xl p-12 text-center border border-border/50 shadow-sm">
                <p className="text-muted-foreground font-sans text-lg mb-8">{t("carrinho_vazio")}</p>
                <Link to="/#tours">
                  <Button className="font-sans px-8 h-12 rounded-full">
                    {t("explorar_passeios")}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm flex flex-col sm:flex-row gap-6 group hover:shadow-md transition-all">
                    <div className="w-full sm:w-40 h-40 rounded-xl overflow-hidden flex-shrink-0 relative bg-muted">
                      <OptimizedImage 
                        src={item.image_url} 
                        alt={item.title} 
                        width={400}
                        containerClassName="w-full h-full"
                        className="w-full h-full object-cover" 
                        loading="lazy"
                      />
                      <div className="absolute top-2 right-2 bg-primary text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg">
                        {item.quantity}x
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <Link to={`/passeio/${item.slug || item.id}`} className="font-serif text-xl font-bold mb-1 group-hover:text-primary transition-colors block">
                        {item.title}
                      </Link>
                      {item.selected_option && (
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-widest border border-primary/20">
                            {item.selected_option.title}
                          </span>
                        </div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm text-muted-foreground font-sans">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary/70" />
                          <span className="font-medium">{format(new Date(item.date + 'T00:00:00'), "dd/MM/yyyy", { locale: dateLocale })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary/70" />
                          <span className="capitalize font-medium">{item.period === 'morning' ? t('amanha') : item.period === 'afternoon' ? t('tarde') : t('noite')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-primary/70" />
                          <span className="font-medium">{t("grupo_privado")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary/70" />
                            <div className="relative flex items-center gap-2">
                              <button 
                                onClick={() => updateQuantity(item.id, item.date, item.period, Math.max(1, item.quantity - 1))}
                                className="w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80"
                                disabled={item.quantity <= 1}
                                aria-label={language === 'pt' ? "Diminuir quantidade" : "Decrease quantity"}
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-medium w-8 text-center">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.id, item.date, item.period, item.quantity + 1)}
                                className={`w-6 h-6 rounded-full bg-muted flex items-center justify-center transition-all ${item.max_group_size && item.quantity >= item.max_group_size ? 'opacity-30 cursor-not-allowed' : 'hover:bg-muted/80'}`}
                                disabled={item.max_group_size ? item.quantity >= item.max_group_size : false}
                                aria-label={language === 'pt' ? "Aumentar quantidade" : "Increase quantity"}
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                              {item.max_group_size && item.quantity >= item.max_group_size && (
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full whitespace-nowrap animate-bounce shadow-lg">
                                  {language === 'pt' ? 'LIMITE ATINGIDO' : 'LIMIT REACHED'}
                                </span>
                              )}
                            </div>
                          <span className="text-muted-foreground text-xs">{item.quantity > 1 ? (language === 'pt' ? 'pessoas' : 'people') : (language === 'pt' ? 'pessoa' : 'person')}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                         <span className="text-xs text-muted-foreground uppercase font-black tracking-widest">{t("subtotal")}:</span>
                         <span className="text-lg font-black text-primary">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    </div>

                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start pt-4 sm:pt-0">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-full h-12 w-12"
                        onClick={() => removeFromCart(item.id, item.date, item.period)}
                        aria-label={language === 'pt' ? "Remover item" : "Remove item"}
                      >
                        <Trash2 className="w-6 h-6" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-start">
                   <Button variant="link" onClick={clearCart} className="text-muted-foreground text-xs hover:text-red-500 p-0 font-bold uppercase tracking-tighter">
                    {t("limpar_carrinho")}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Summary Sidebar */}
          {items.length > 0 && (
            <div className="w-full lg:w-96">
              <div className="bg-card rounded-3xl p-8 border border-border/50 shadow-2xl sticky top-24 bg-gradient-to-b from-card to-muted/10">
                <h2 className="font-serif text-2xl font-bold mb-8 border-b pb-4 flex items-center gap-2">
                   <CreditCard className="w-6 h-6 text-primary" />
                   {t("resumo_reserva")}
                </h2>
                
                <div className="space-y-6 mb-10">
                  {/* Customer Info */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">{language === 'pt' ? 'Seus Dados' : 'Your Details'}</h3>
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="cust-name" className="text-xs font-medium text-muted-foreground">{language === 'pt' ? 'Nome completo' : 'Full name'}</Label>
                      <Input 
                        id="cust-name"
                        placeholder={language === 'pt' ? 'Ex: João Silva' : 'Ex: John Doe'} 
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                        className="h-11 rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="cust-whatsapp" className="text-xs font-medium text-muted-foreground">{language === 'pt' ? 'WhatsApp (com DDD)' : 'WhatsApp (with area code)'}</Label>
                      <Input 
                        id="cust-whatsapp"
                        placeholder="+55 21 99999-9999" 
                        value={customerInfo.whatsapp}
                        onChange={(e) => setCustomerInfo({...customerInfo, whatsapp: e.target.value})}
                        className="h-11 rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="cust-email" className="text-xs font-medium text-muted-foreground">{language === 'pt' ? 'E-mail' : 'Email'}</Label>
                      <Input 
                        id="cust-email"
                        type="email"
                        placeholder="email@exemplo.com" 
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                        className="h-11 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between font-sans text-muted-foreground">
                    <span className="font-medium">{t("subtotal")}</span>
                    <span className="font-bold">{formatPrice(total)}</span>
                  </div>
                  {feeEnabled && (
                    <div className="flex justify-between font-sans text-muted-foreground">
                      <span className="font-medium">{t("taxas")} (5%)</span>
                      <span className="font-bold">{formatPrice(serviceFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-sans text-2xl font-black text-foreground border-t border-dashed pt-6">
                    <span>{t("total")}</span>
                    <span className="text-primary">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                <Button onClick={handleCheckout} disabled={isProcessing} className="w-full h-18 py-4 rounded-2xl text-lg font-black shadow-xl shadow-primary/20 flex flex-col items-center justify-center gap-0 bg-primary hover:bg-primary/90 transition-all active:scale-95 group">
                  <div className="flex items-center gap-2">
                    {isProcessing ? (language === 'pt' ? "Processando..." : "Processing...") : t("pagar_agora")}
                    {!isProcessing && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                  </div>
                  <span className="text-[10px] opacity-80 font-normal uppercase tracking-[0.2em] mt-1">{t("pagamento_seguro")}</span>
                </Button>

                <div className="mt-8 space-y-4">
                  <div className="flex flex-col gap-6 bg-background/50 p-6 rounded-2xl border border-dashed border-border shadow-inner">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-foreground mb-1">{language === 'pt' ? 'Pagamento 100% Seguro' : '100% Secure Payment'}</p>
                          <p className="text-[10px] text-muted-foreground leading-relaxed">{t("seguranca_stripe")}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 pt-4 border-t border-border/50">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground mb-1">{language === 'pt' ? 'Cancelamento Flexível' : 'Flexible Cancellation'}</p>
                          <p className="text-[10px] text-muted-foreground leading-relaxed">
                            {language === 'pt' ? 'Cancele com até 72h de antecedência para reembolso total.' : 'Cancel up to 72h in advance for a full refund.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 pt-4 border-t border-border/50">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Compass className="w-3 h-3 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground mb-1">{language === 'pt' ? 'Suporte Especializado' : 'Expert Support'}</p>
                          <p className="text-[10px] text-muted-foreground leading-relaxed">
                            {language === 'pt' ? 'Estamos à disposição via WhatsApp para qualquer dúvida.' : 'We are available via WhatsApp for any questions.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border/50">
                      <p className="text-[10px] font-black uppercase text-muted-foreground/60 mb-3 tracking-widest text-center">{language === 'pt' ? 'Métodos Aceitos' : 'Accepted Methods'}</p>
                      <PaymentLogos />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
