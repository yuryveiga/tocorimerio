import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { hojeRio } from "@/lib/finOperacionais";
import { fmtData } from "@/lib/financeiro";

export function FinAvisos() {
  const hoje = hojeRio();
  const { data = [] } = useQuery({ queryKey: ["fin_operacionais", "avisos", hoje], refetchInterval: 60_000, queryFn: async () => {
    const { data, error } = await supabase.from("fin_despesas_operacionais").select("id,descricao,vencimento").is("data_pagamento", null).lte("vencimento", hoje).order("vencimento");
    if (error) throw error; return data;
  } });
  if (!data.length) return null;
  return <div role="alert" className="mb-5 border-l-4 border-destructive bg-muted p-3 text-sm"><Link to="/financeiro/despesas-operacionais" className="font-semibold underline">Despesas pendentes ({data.length})</Link><ul>{data.map(d => <li key={d.id} className="break-words">{d.descricao} — {d.vencimento === hoje ? "vence hoje" : `vencida em ${fmtData(d.vencimento)}`}</li>)}</ul></div>;
}