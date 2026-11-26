import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { hojeRio, limiteAlertaDespesas } from "@/lib/finOperacionais";
import { fmtData } from "@/lib/financeiro";

export function FinAvisos() {
  const hoje = hojeRio();
  const { pathname } = useLocation();
  const inicio = pathname.replace(/\/$/, "") === "/financeiro";
  const limite = limiteAlertaDespesas(hoje);
  const { data = [] } = useQuery({ queryKey: ["fin_operacionais", "avisos", hoje, inicio], refetchInterval: 60_000, queryFn: async () => {
    const query = supabase.from("fin_despesas_operacionais").select("id,descricao,vencimento").is("data_pagamento", null);
    const { data, error } = await (inicio ? query.lt("vencimento", limite) : query.lte("vencimento", hoje)).order("vencimento");
    if (error) throw error; return data;
  } });
  if (!data.length) return null;
  return <div role="alert" className="mb-5 border-l-4 border-destructive bg-muted p-3 text-sm"><Link to="/financeiro/despesas-operacionais" className="font-semibold underline">Despesas pendentes ({data.length})</Link><ul>{data.map(d => <li key={d.id} className="break-words">{d.descricao} — {d.vencimento === hoje ? "vence hoje" : d.vencimento < hoje ? `vencida em ${fmtData(d.vencimento)}` : `vence em ${fmtData(d.vencimento)}`}</li>)}</ul></div>;
}