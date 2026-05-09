import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLocale } from "@/contexts/LocaleContext";
import { useSiteData } from "@/hooks/useSiteData";
import { supabase } from "@/integrations/supabase/client";

export function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { t, language } = useLocale();
  const { socialMedia, tours } = useSiteData();

  const emailSocial = socialMedia.find(s => s.platform.toLowerCase() === 'email');
  const whatsappSocial = socialMedia.find(s => s.platform.toLowerCase().includes('whatsapp'));
  
  const contactEmail = emailSocial?.url || "";
  const contactPhone = whatsappSocial?.url || "";
  const cleanPhone = contactPhone.replace(/[^\d+]/g, "");
  const message = encodeURIComponent("Olá, vim pelo site");
  const waLink = contactPhone.startsWith('http') 
    ? `${contactPhone}${contactPhone.includes('?') ? '&' : '?'}text=${message}`
    : `https://wa.me/${cleanPhone.replace('+', '')}?text=${message}`;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!contactEmail) {
      toast({ 
        title: "Erro", 
        description: language === 'pt' ? "E-mail de contato não configurado nas redes sociais." : "Contact email not configured in social media.", 
        variant: "destructive" 
      });
      return;
    }

    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      to: contactEmail,
      senderName: formData.get("name") as string,
      senderEmail: formData.get("email") as string,
      senderPhone: formData.get("phone") as string,
      tourInterest: formData.get("tour_interest") as string,
      message: formData.get("message") as string,
    };

    try {
      const { error } = await supabase.functions.invoke("send-contact-email", {
        body: data
      });

      if (error) throw error;

      toast({ title: t("msg_enviada"), description: t("contato_breve") });
      (e.target as HTMLFormElement).reset();
    } catch (error: unknown) {
      console.error("Error sending contact email:", error);
      toast({ 
        title: "Erro ao enviar", 
        description: language === 'pt' ? "Houve um problema ao enviar sua mensagem. Tente novamente." : "There was a problem sending your message. Please try again.",
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 lg:py-28 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 lg:mb-16">
          <p className="text-primary font-medium mb-3 font-sans">{t("entre_contato")}</p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
            {t("pronto_aventura")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-sans">
            {t("contato_desc")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <div>
            <h3 className="font-serif text-2xl font-semibold text-foreground mb-6">{t("info_contato")}</h3>
            <div className="space-y-6 mb-8">
              {contactEmail && (
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1 font-sans">{t("email")}</h4>
                    <a href={`mailto:${contactEmail}`} className="text-muted-foreground hover:text-primary transition-colors font-sans">{contactEmail}</a>
                  </div>
                </div>
              )}
              {contactPhone && (
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1 font-sans">WhatsApp</h4>
                    <a href={waLink} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors font-sans">{contactPhone.replace(/https?:\/\//, '')}</a>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1 font-sans">{t("rio_janeiro")}</h4>
                  <p className="text-muted-foreground font-sans">Rio de Janeiro, Brasil</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border/50">
              <h4 className="font-semibold text-foreground mb-2 font-sans">{t("horario_atenda")}</h4>
              <p className="text-muted-foreground text-sm font-sans">{t("set_dom")}</p>
              <p className="text-muted-foreground text-sm font-sans">{t("wa_24h")}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-8 shadow-lg border border-border/50 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-sans">{t("nome")}</Label>
                <Input id="name" name="name" required placeholder={t("seu_nome")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="font-sans">WhatsApp / {t("telefone")}</Label>
                <Input id="phone" name="phone" required placeholder="+55 21 99999-9999" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="font-sans">{t("email")} <span className="text-muted-foreground text-[10px] font-normal">({t("opcional") || "Opcional"})</span></Label>
              <Input id="email" name="email" type="email" placeholder={t("seu_email")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="font-sans">{t("mensagem")}</Label>
              <Textarea id="message" name="message" required placeholder={t("conte_planos")} rows={4} />
            </div>
            <Button type="submit" size="lg" className="w-full font-sans font-bold py-6 text-lg rounded-xl" disabled={isSubmitting}>
              <Send className="w-5 h-5 mr-2" />
              {isSubmitting ? t("enviando") : t("enviar_mensagem")}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
