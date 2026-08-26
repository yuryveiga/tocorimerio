import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchLovable, LovableSale, LovableTour } from "@/integrations/lovable/client";
import { ChevronLeft, ChevronRight, CalendarDays, Users, CreditCard } from "lucide-react";
import SaleDetailDialog from "@/components/admin/SaleDetailDialog";
import StripeCheckoutDialog from "@/components/admin/StripeCheckoutDialog";
import { toast } from "sonner";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const GOOGLE_CALENDAR_EMBED_ID = "marius.e.dobbin@gmail.com";

const AdminCalendar = () => {
  const [sales, setSales] = useState<LovableSale[]>([]);
  const [tours, setTours] = useState<LovableTour[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewingSale, setViewingSale] = useState<LovableSale | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [stripeOpen, setStripeOpen] = useState(false);

  useEffect(() => {
    fetchLovable<LovableSale>("sales").then(setSales);
    fetchLovable<LovableTour>("tours").then(setTours);

    // Buscar data da última atualização de um jogo
    import("@/integrations/supabase/client").then(({ supabase }) => {
      supabase
        .from('matches')
        .select('updated_at')
        .order('updated_at', { ascending: false })
        .limit(1)
        .then(({ data }) => {
          if (data && data[0]) setLastSync(data[0].updated_at);
        });
    });
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const paidSales = useMemo(() => sales.filter(s => s.is_paid && !s.is_cancelled && !s.is_archived), [sales]);

  const salesByDate = useMemo(() => {
    const map: Record<string, LovableSale[]> = {};
    paidSales.forEach(sale => {
      if (sale.selected_date) {
        const key = sale.selected_date;
        if (!map[key]) map[key] = [];
        map[key].push(sale);
      }
    });
    return map;
  }, [paidSales]);

  const pendingSales = useMemo(() => sales.filter(s => !s.is_paid && !s.is_cancelled && !s.is_archived), [sales]);

  const pendingByDate = useMemo(() => {
    const map: Record<string, LovableSale[]> = {};
    pendingSales.forEach(sale => {
      if (sale.selected_date) {
        const key = sale.selected_date;
        if (!map[key]) map[key] = [];
        map[key].push(sale);
      }
    });
    return map;
  }, [pendingSales]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const todayStr = new Date().toISOString().split("T")[0];

  const formatDateKey = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const selectedSales = selectedDate
    ? [...(salesByDate[selectedDate] || []), ...(pendingByDate[selectedDate] || [])]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold text-foreground">Calendário</h1>
        {lastSync && (
          <span className="text-[10px] text-muted-foreground font-medium bg-muted/50 px-3 py-1 rounded-full border">
            Dados sincronizados em: {new Date(lastSync).toLocaleString('pt-BR')}
          </span>
        )}
      </div>

      {/* Reservas do Site */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              Reservas do Site
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={goToday} className="font-semibold min-w-[180px]">
                {MONTHS[month]} {year}
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex gap-4 mt-2 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> Pago
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" /> Pendente
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS.map(day => (
              <div key={day} className="text-center text-xs font-bold text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-20" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateKey = formatDateKey(day);
              const confirmed = salesByDate[dateKey] || [];
              const pending = pendingByDate[dateKey] || [];
              const isToday = dateKey === todayStr;
              const isSelected = dateKey === selectedDate;
              const totalPeople = confirmed.reduce((sum, s) => sum + (s.quantity || 1), 0);

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(dateKey === selectedDate ? null : dateKey)}
                  className={`h-20 rounded-lg border text-left p-1.5 transition-all hover:border-primary/50 relative
                    ${isToday ? "border-primary bg-primary/5 font-bold" : "border-border"}
                    ${isSelected ? "ring-2 ring-primary border-primary" : ""}
                    ${confirmed.length > 0 || pending.length > 0 ? "bg-muted/30" : ""}
                  `}
                >
                  <span className={`text-xs ${isToday ? "text-primary" : "text-foreground"}`}>
                    {day}
                  </span>
                  <div className="mt-0.5 space-y-0.5">
                    {confirmed.length > 0 && (
                      <div className="flex items-center gap-0.5">
                        <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                        <span className="text-[10px] text-green-700 font-semibold truncate">
                          {confirmed.length} reserva{confirmed.length > 1 ? "s" : ""} · {totalPeople}p
                        </span>
                      </div>
                    )}
                    {pending.length > 0 && (
                      <div className="flex items-center gap-0.5">
                        <span className="w-2 h-2 rounded-full bg-yellow-500 shrink-0" />
                        <span className="text-[10px] text-yellow-700 font-semibold truncate">
                          {pending.length} pendente{pending.length > 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected date details */}
          {selectedDate && selectedSales.length > 0 && (
            <div className="mt-4 border-t pt-4">
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Reservas em {selectedDate.split("-").reverse().join("/")}
              </h3>
              <div className="space-y-2">
                {selectedSales.map(sale => (
                  <div
                    key={sale.id}
                    onClick={() => setViewingSale(sale)}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
                      sale.is_paid ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"
                    }`}
                  >
                    <div>
                      <span className="font-semibold text-sm">{sale.customer_name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {sale.tour_title} · {sale.quantity}p · {sale.selected_period || "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">
                        R$ {sale.total_price?.toFixed(2)}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        sale.is_paid ? "bg-green-200 text-green-800" : "bg-yellow-200 text-yellow-800"
                      }`}>
                        {sale.is_paid ? "PAGO" : "PENDENTE"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {selectedDate && selectedSales.length === 0 && (
            <div className="mt-4 border-t pt-4 text-center text-sm text-muted-foreground py-4">
              Nenhuma reserva para esta data.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Google Calendar Embed */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            Google Agenda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg overflow-hidden border">
            <iframe
              src="https://calendar.google.com/calendar/embed?src=marius.e.dobbin%40gmail.com&ctz=America%2FSao_Paulo&showTitle=0&showNav=1&showPrint=0&showTabs=1&showCalendars=0&mode=MONTH"
              style={{ border: 0 }}
              width="100%"
              height="600"
              frameBorder="0"
              scrolling="no"
              title="Google Calendar"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            * Para o Google Agenda aparecer, o calendário precisa ser público ou compartilhado.
          </p>
        </CardContent>
      </Card>

      <SaleDetailDialog
        sale={viewingSale}
        open={!!viewingSale}
        onClose={() => setViewingSale(null)}
      />
    </div>
  );
};

export default AdminCalendar;
