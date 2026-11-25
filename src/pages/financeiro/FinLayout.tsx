import { NavLink, Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Home, PlusCircle, Search, FileText, Moon, Sun, Users } from "lucide-react";

const NAV = [
  { to: "/financeiro", label: "Início", icon: Home, end: true },
  { to: "/financeiro/cadastrar", label: "Cadastrar", icon: PlusCircle },
  { to: "/financeiro/consultar", label: "Consultar", icon: Search },
  { to: "/financeiro/relatorios", label: "Relatórios", icon: FileText },
];

export default function FinLayout() {
  const { user, isAdmin, loading } = useAuth();
  const [dark, setDark] = useState(() => localStorage.getItem("fin-dark") === "1");
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("fin-dark", dark ? "1" : "0");
    return () => document.documentElement.classList.remove("dark");
  }, [dark]);
  useEffect(() => {
    const l = document.createElement("link"); l.rel = "manifest"; l.href = "/financeiro.webmanifest";
    document.head.appendChild(l); document.title = "Financeiro · Tocorime Rio";
    return () => l.remove();
  }, []);
  if (loading) return <div className="min-h-screen grid place-items-center text-muted-foreground">Carregando...</div>;
  if (!user || !isAdmin) return <Navigate to="/admin/login" state={{ from: "/financeiro" }} replace />;
  const cls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium ${isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"}`;
  return (
    <div className="min-h-screen bg-background text-foreground font-sans md:flex">
      <aside className="hidden md:flex w-60 flex-col border-r border-border p-4 gap-1 sticky top-0 h-screen">
        <p className="font-bold text-lg mb-4 px-3">Financeiro<span className="block text-xs font-normal text-muted-foreground">Tocorime Rio</span></p>
        {NAV.map(n => <NavLink key={n.to} to={n.to} end={n.end} className={cls}><n.icon className="w-5 h-5" />{n.label}</NavLink>)}
        <div className="mt-auto space-y-1">
          <a href="/admin/users" className={cls({ isActive: false })}><Users className="w-5 h-5" />Administradores</a>
          <button onClick={() => setDark(!dark)} className={cls({ isActive: false }) + " w-full"}>{dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}Modo {dark ? "claro" : "escuro"}</button>
        </div>
      </aside>
      <div className="flex-1 min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 h-14 border-b border-border">
          <span className="font-bold">Financeiro</span>
          <button aria-label="Alternar modo escuro" onClick={() => setDark(!dark)} className="p-2">{dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
        </header>
        <main className="p-4 md:p-8 pb-24 md:pb-8 max-w-5xl mx-auto"><Outlet /></main>
      </div>
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-background border-t border-border grid grid-cols-4 z-50">
        {NAV.map(n => (
          <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `flex flex-col items-center py-2 text-xs gap-1 ${isActive ? "text-primary font-semibold" : "text-muted-foreground"}`}>
            <n.icon className="w-6 h-6" />{n.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
