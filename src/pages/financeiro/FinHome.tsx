import { Link } from "react-router-dom";
import { PlusCircle, Search } from "lucide-react";
import { mesRange, totais } from "@/lib/financeiro";
import { useVendas } from "./useFin";
import { FinCards } from "./FinCards";

export default function FinHome() {
  const d = new Date(); const { ini, fim } = mesRange(d.getFullYear(), d.getMonth() + 1);
  const { data = [], isLoading } = useVendas(ini, fim);
  const mes = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/financeiro/cadastrar" className="rounded-2xl bg-primary text-primary-foreground p-8 flex flex-col items-center gap-3 text-xl font-semibold"><PlusCircle className="w-10 h-10" />Cadastrar venda</Link>
        <Link to="/financeiro/consultar" className="rounded-2xl border-2 border-primary text-primary p-8 flex flex-col items-center gap-3 text-xl font-semibold"><Search className="w-10 h-10" />Consultar venda</Link>
      </div>
      <h2 className="text-sm text-muted-foreground capitalize">Resumo de {mes}</h2>
      {isLoading ? <p className="text-muted-foreground">Carregando...</p> : <FinCards t={totais(data)} compact />}
    </div>
  );
}
