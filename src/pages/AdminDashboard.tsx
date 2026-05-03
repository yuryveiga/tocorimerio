import { useEffect, useState } from "react";
import { Map, Globe, Sparkles, Loader2, DollarSign, Users, CalendarCheck, CalendarClock, Save, LayoutGrid, FileText, Image, Share2 } from "lucide-react";
import { ChangePassword } from "@/components/admin/ChangePassword";
import { BulkTranslateCard } from "@/components/admin/BulkTranslateCard";
import { fetchLovable, updateLovable, insertLovable, LovableSiteSetting, LovableSale, LovableTour } from "@/integrations/lovable/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { translateText } from "@/utils/translate";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Switch } from "@/components/ui/switch";

const AdminDashboard = () => {
  const [counts, setCounts] = useState({ tours: 0, peopleServed: 0, totalReservations: 0, futureReservations: 0, totalRevenue: 0, futureRevenue: 0 });
  const [settingsList, setSettingsList] = useState<LovableSiteSetting[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const { toast } = useToast();
  const { rates } = useCurrency();

  useEffect(() => {
    const fetchData = async () => {
      const [toursData, settingsData, salesData] = await Promise.all([
        fetchLovable<LovableTour>("tours"),
        fetchLovable<LovableSiteSetting>("site_settings"),
        fetchLovable<LovableSale>("sales"),
      ]);

      const archived = salesData.filter(s => s.is_archived);
      const peopleServed = archived.reduce((sum, s) => sum + (s.quantity || 0), 0);
      const totalReservations = salesData.length;
      const futurePaid = salesData.filter(s => s.is_paid && !s.is_archived && !s.is_cancelled);
      const totalRevenue = salesData.filter(s => s.is_paid).reduce((sum, s) => sum + (s.total_price || 0), 0);
      const futureRevenue = futurePaid.reduce((sum, s) => sum + (s.total_price || 0), 0);

      setCounts({
        tours: toursData.length,
        peopleServed,
        totalReservations,
        futureReservations: futurePaid.length,
        totalRevenue,
        futureRevenue,
      });

      setSettingsList(settingsData);
      const settingsMap: Record<string, string> = {};
      settingsData.forEach((item) => { settingsMap[item.key] = item.value; });
      setSettings(settingsMap);
    };
    fetchData();
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const keys = ['home_tours_columns', 'home_tours_count', 'home_matches_count', 'home_category_1', 'home_category_1_label', 'home_category_1_label_en', 'home_category_1_label_es', 'home_category_2', 'home_category_2_label', 'home_category_2_label_en', 'home_category_2_label_es', 'home_category_3', 'home_category_3_label', 'home_category_3_label_en', 'home_category_3_label_es'];
      for (const key of keys) {
        if (settings[key] !== undefined) {
          const settingRecord = settingsList.find(s => s.key === key);
          if (settingRecord?.id) {
            await updateLovable("site_settings", settingRecord.id, { value: settings[key] || "" });
          } else if (settings[key]) {
            await insertLovable("site_settings", { key, value: settings[key] });
          }
        }
      }
      toast({ title: "Configurações da Home salvas!" });
      const settingsData = await fetchLovable<LovableSiteSetting>("site_settings");
      setSettingsList(settingsData);
    } catch (err) {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveGeneral = async () => {
    setIsSavingGeneral(true);
    try {
      const keys = ['site_title', 'site_description', 'site_title_en', 'site_title_es', 'site_description_en', 'site_description_es'];
      for (const key of keys) {
        if (settings[key]) {
          const settingRecord = settingsList.find(s => s.key === key);
          if (settingRecord?.id) {
            await updateLovable("site_settings", settingRecord.id, { value: settings[key] || "" });
          } else {
            await insertLovable("site_settings", { key, value: settings[key] || "" });
          }
        }
      }
      toast({ title: "Configurações Gerais salvas!" });
      // Reload settings to get IDs
      const settingsData = await fetchLovable<LovableSiteSetting>("site_settings");
      setSettingsList(settingsData);
    } catch (err) {
      console.error("Error saving settings:", err);
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setIsSavingGeneral(false);
    }
  };

  const handleToggleHidePrices = async (checked: boolean) => {
    const newValue = checked ? "true" : "false";
    setSettings({ ...settings, hide_prices: newValue });
    try {
      const settingRecord = settingsList.find(s => s.key === 'hide_prices');
      if (settingRecord?.id) {
        await updateLovable("site_settings", settingRecord.id, { value: newValue });
      } else {
        const newRecord = await insertLovable<LovableSiteSetting>("site_settings", { key: 'hide_prices', value: newValue });
        setSettingsList([...settingsList, newRecord]);
      }
      toast({ title: checked ? "Modo Orçamento ativado!" : "Modo Orçamento desativado!" });
    } catch (err) {
      toast({ title: "Erro ao atualizar modo", variant: "destructive" });
    }
  };

  const handleToggleUrgency = async (checked: boolean) => {
    const newValue = checked ? "true" : "false";
    setSettings({ ...settings, hide_urgency: newValue });
    try {
      const settingRecord = settingsList.find(s => s.key === 'hide_urgency');
      if (settingRecord?.id) {
        await updateLovable("site_settings", settingRecord.id, { value: newValue });
      } else {
        const newRecord = await insertLovable<LovableSiteSetting>("site_settings", { key: 'hide_urgency', value: newValue });
        setSettingsList([...settingsList, newRecord]);
      }
      toast({ title: checked ? "Mensagens de urgência ocultadas!" : "Mensagens de urgência ativadas!" });
    } catch (err) {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    }
  };

  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const cards = [
    { label: "Passeios", value: counts.tours.toString(), icon: Map, color: "bg-primary/10 text-primary" },
    { label: "Pessoas Atendidas", value: counts.peopleServed.toString(), icon: Users, color: "bg-secondary/20 text-secondary" },
    { label: "Reservas Feitas", value: counts.totalReservations.toString(), icon: CalendarCheck, color: "bg-accent/20 text-accent-foreground" },
    { label: "Reservas Futuras", value: counts.futureReservations.toString(), icon: CalendarClock, color: "bg-destructive/10 text-destructive" },
    { label: "Total Faturado", value: formatCurrency(counts.totalRevenue), icon: DollarSign, color: "bg-green-100 text-green-600" },
    { label: "A Faturar", value: formatCurrency(counts.futureRevenue), icon: DollarSign, color: "bg-green-500/10 text-green-600" },
    { label: "Dólar Hoje", value: `R$ ${(1 / (rates.USD || 0.18)).toFixed(2)}`, icon: Globe, color: "bg-blue-100 text-blue-600" },
    { label: "Euro Hoje", value: `R$ ${(1 / (rates.EUR || 0.16)).toFixed(2)}`, icon: Globe, color: "bg-indigo-100 text-indigo-600" },
  ];

  return (
    <div className="space-y-8 pb-12 font-sans">
      <h1 className="font-serif text-3xl font-bold text-foreground">Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground font-sans">{card.value}</p>
                <p className="text-sm text-muted-foreground font-sans">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* General Settings */}
        <div className="bg-card border rounded-3xl p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="w-7 h-7 text-primary" />
            <h2 className="text-2xl font-bold font-serif">Configurações Gerais</h2>
          </div>
            <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Título do Site (Aba do Navegador)</Label>
              <Input 
                value={settings['site_title'] || "Eco-Wanderlust | Passeios Inesquecíveis no Rio de Janeiro"} 
                onChange={(e) => setSettings({ ...settings, site_title: e.target.value })} 
                placeholder="Ex: Eco-Wanderlust | Passeios no Rio"
                className="h-12 rounded-xl"
              />
              <p className="text-[10px] text-muted-foreground italic">Este texto aparecerá no topo do navegador quando os clientes acessarem a home.</p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Descrição do Site (SEO)</Label>
              <Textarea 
                value={settings['site_description'] || ""} 
                onChange={(e) => setSettings({ ...settings, site_description: e.target.value })} 
                placeholder="Ex: Descubra os melhores passeios no Rio de Janeiro com a Eco-Wanderlust."
                className="h-24 rounded-xl resize-none"
              />
              <p className="text-[10px] text-muted-foreground italic">Esta descrição aparece nos resultados de busca do Google.</p>
            </div>
            <Button onClick={handleSaveGeneral} disabled={isSavingGeneral} className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20">
              {isSavingGeneral ? "Salvando..." : <><Save className="w-4 h-4 mr-2" /> Salvar Configurações</>}
            </Button>
            <Button 
              variant="outline" 
              onClick={async () => {
                const title = settings['site_title'];
                const desc = settings['site_description'];
                if (!title && !desc) {
                  toast({ title: "Preencha o título ou descrição primeiro", variant: "destructive" });
                  return;
                }
                setIsTranslating(true);
                try {
                  const results = await Promise.all([
                    title ? translateText(title, "en") : null,
                    title ? translateText(title, "es") : null,
                    desc ? translateText(desc, "en") : null,
                    desc ? translateText(desc, "es") : null,
                  ]);
                  const newSettings = { ...settings };
                  if (results[0]) newSettings['site_title_en'] = results[0];
                  if (results[1]) newSettings['site_title_es'] = results[1];
                  if (results[2]) newSettings['site_description_en'] = results[2];
                  if (results[3]) newSettings['site_description_es'] = results[3];
                  setSettings(newSettings);
                  toast({ title: "Tradução concluída! Salve as alterações." });
                } catch (e) {
                  toast({ title: "Erro ao traduzir", variant: "destructive" });
                } finally {
                  setIsTranslating(false);
                }
              }}
              disabled={isTranslating}
              className="w-full h-12 rounded-xl"
            >
              {isTranslating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Traduzir Título e Descrição
            </Button>
          </div>
        </div>

        {/* Grid settings for Home */}
        <div className="bg-card border rounded-3xl p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <LayoutGrid className="w-7 h-7 text-[#2A9D8F]" />
            <h2 className="text-2xl font-bold font-serif">Aparência da Grade</h2>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Colunas no Desktop (1 a 4)</Label>
              <Input 
                type="number" min={1} max={4} 
                value={settings['home_tours_columns'] || "3"} 
                onChange={(e) => setSettings({ ...settings, home_tours_columns: e.target.value })} 
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Máximo de Passeios (Grade Principal)</Label>
              <Input 
                type="number" min={1} 
                value={settings['home_tours_count'] || "6"} 
                onChange={(e) => setSettings({ ...settings, home_tours_count: e.target.value })} 
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-[#E63946]">Jogos no Maracanã (Destaque Home)</Label>
              <Input 
                type="number" min={0} 
                value={settings['home_matches_count'] || "0"} 
                onChange={(e) => setSettings({ ...settings, home_matches_count: e.target.value })} 
                placeholder="Quantidade de jogos a mostrar..."
                className="h-12 rounded-xl border-[#E63946]/30"
              />
              <p className="text-[10px] text-muted-foreground italic">Define quantos jogos do calendário aparecerão automaticamente no topo da lista.</p>
            </div>
            <Button onClick={handleSaveSettings} disabled={isSaving} variant="outline" className="w-full h-10 rounded-xl font-bold border-2 border-[#2A9D8F]/20 text-[#2A9D8F] hover:bg-[#2A9D8F]/5">
              {isSaving ? "Salvando..." : <><Save className="w-4 h-4 mr-2" /> Salvar Alterações</>}
            </Button>
          </div>
        </div>

        {/* Price Visibility Settings */}
        <div className="bg-card border-2 border-primary/20 rounded-3xl p-8 shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-7 h-7 text-primary" />
              <h2 className="text-2xl font-bold font-serif">Modo Orçamento</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <div className="space-y-0.5">
                  <Label className="text-base font-bold text-foreground">Ocultar Preços</Label>
                  <p className="text-sm text-muted-foreground">Oculta todos os valores do site e substitui o botão de reserva por contato via WhatsApp.</p>
                </div>
                <Switch 
                  checked={settings['hide_prices'] === 'true'} 
                  onCheckedChange={handleToggleHidePrices}
                />
              </div>
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 italic">Dica: Use esta opção se os preços estiverem em atualização ou se preferir atendimento direto.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Urgency Messages Settings */}
        <div className="bg-card border-2 border-orange-200 rounded-3xl p-8 shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-7 h-7 text-orange-500" />
              <h2 className="text-2xl font-bold font-serif">Mensagens de Urgência</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-2xl border border-orange-100">
                <div className="space-y-0.5">
                  <Label className="text-base font-bold text-foreground">Ocultar Urgência</Label>
                  <p className="text-sm text-muted-foreground">Oculta os badges de "esgota rápido", "X pessoas vendo agora" e notificações de reservas recentes.</p>
                </div>
                <Switch 
                  checked={settings['hide_urgency'] === 'true'} 
                  onCheckedChange={handleToggleUrgency}
                />
              </div>
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex gap-3">
                <Sparkles className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <p className="text-xs text-orange-800 italic">Dica: Desative se quiser uma aparência mais clean, sem elementos de escassez e prova social nos passeios.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Management */}
        <div className="bg-card border rounded-3xl p-8 shadow-sm space-y-6 md:col-span-2">
          <div className="flex items-center gap-3 mb-2">
            <LayoutGrid className="w-7 h-7 text-primary" />
            <h2 className="text-2xl font-bold font-serif">Categorias dos Botões (Home)</h2>
          </div>
          <p className="text-sm text-muted-foreground">Configure as categorias que aparecem como botões de filtro na seção de passeios da home. A 3ª categoria só aparecerá se estiver preenchida.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((num) => (
              <div key={num} className={`space-y-4 p-6 rounded-2xl border-2 ${num === 3 && !settings[`home_category_${num}`] ? 'border-dashed border-muted-foreground/30 opacity-60' : 'border-primary/20 bg-primary/5'}`}>
                <h3 className="font-black text-sm uppercase tracking-widest text-primary">Botão {num} {num === 3 && '(Opcional)'}</h3>
                
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Categoria (valor interno)</Label>
                  <Input 
                    value={settings[`home_category_${num}`] || (num === 1 ? 'CITY TOUR' : num === 2 ? 'TRILHA' : '')} 
                    onChange={(e) => setSettings({ ...settings, [`home_category_${num}`]: e.target.value.toUpperCase() })} 
                    placeholder="Ex: PRAIA, BARCO..."
                    className="h-10 rounded-xl font-bold uppercase"
                  />
                  <p className="text-[10px] text-muted-foreground">Deve corresponder à categoria dos passeios.</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Texto do Botão (PT)</Label>
                  <Input 
                    value={settings[`home_category_${num}_label`] || (num === 1 ? 'City Tours' : num === 2 ? 'Trilhas' : '')} 
                    onChange={(e) => setSettings({ ...settings, [`home_category_${num}_label`]: e.target.value })} 
                    placeholder="Nome do botão..."
                    className="h-10 rounded-xl"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">EN</Label>
                    <Input 
                      value={settings[`home_category_${num}_label_en`] || ''} 
                      onChange={(e) => setSettings({ ...settings, [`home_category_${num}_label_en`]: e.target.value })} 
                      placeholder="English..."
                      className="h-8 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">ES</Label>
                    <Input 
                      value={settings[`home_category_${num}_label_es`] || ''} 
                      onChange={(e) => setSettings({ ...settings, [`home_category_${num}_label_es`]: e.target.value })} 
                      placeholder="Español..."
                      className="h-8 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <Button onClick={handleSaveSettings} variant="outline" disabled={isSaving} className="w-full h-12 rounded-xl font-bold border-2">
            {isSaving ? "Salvando..." : <><Save className="w-4 h-4 mr-2" /> Salvar Layout e Categorias</>}
          </Button>
        </div>

        <BulkTranslateCard />

        <div className="md:col-span-2">
          <ChangePassword />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
