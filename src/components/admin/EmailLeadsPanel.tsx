import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Trash2, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Lead {
  id: string;
  email: string;
  name: string | null;
  language: string | null;
  source_slug: string | null;
  created_at: string;
}

export const EmailLeadsPanel = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("email_leads")
      .select("id, email, name, language, source_slug, created_at")
      .order("created_at", { ascending: false });
    if (error) toast.error("Erro ao carregar leads");
    setLeads((data as Lead[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    const { error } = await supabase.from("email_leads").delete().eq("id", id);
    if (error) return toast.error("Erro ao excluir");
    setLeads((p) => p.filter((l) => l.id !== id));
    toast.success("Lead removido");
  };

  const exportCsv = () => {
    const rows = [["email", "nome", "idioma", "origem", "data"], ...leads.map((l) => [
      l.email, l.name || "", l.language || "", l.source_slug || "", l.created_at,
    ])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-4 h-4" /> Leads de e-mail ({leads.length})
        </CardTitle>
        <Button variant="outline" size="sm" onClick={exportCsv} disabled={!leads.length}>
          <Download className="w-4 h-4 mr-2" /> Exportar CSV
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin" /></div>
        ) : leads.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Nenhum lead capturado ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Idioma</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.email}</TableCell>
                    <TableCell>{l.name || "-"}</TableCell>
                    <TableCell className="uppercase text-xs">{l.language || "-"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[220px] truncate">{l.source_slug || "-"}</TableCell>
                    <TableCell className="text-xs">{format(new Date(l.created_at), "dd/MM/yyyy HH:mm")}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => remove(l.id)} aria-label="Excluir lead">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
