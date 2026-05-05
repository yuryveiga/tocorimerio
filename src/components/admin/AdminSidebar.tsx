import { 
  Map, 
  FileText, 
  Image, 
  Share2, 
  LayoutDashboard, 
  LogOut, 
  Images, 
  PenTool, 
  LayoutTemplate, 
  Palette, 
  Users, 
  MessageSquare, 
  DollarSign,
  Calculator,
  Layout,
  CalendarDays,
  Zap,
  BarChart3
} from "lucide-react";

import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

const menuGroups = [
  {
    label: "Dashboard",
    items: [
      { title: "Início", url: "/admin", icon: LayoutDashboard },
      { title: "Análises", url: "/admin/analytics", icon: BarChart3 },
    ]
  },
  {
    label: "Gestão Comercial",
    items: [
      { title: "Vendas", url: "/admin/sales", icon: DollarSign },
      { title: "Calendário", url: "/admin/calendar", icon: CalendarDays },
    ]
  },
  {
    label: "Ferramentas",
    items: [
      { title: "Simulador", url: "/admin/simulator", icon: Calculator },
    ]
  },

  {
    label: "Catálogo & Conteúdo",
    items: [
      { title: "Passeios", url: "/admin/tours", icon: Map },
      { title: "Blog", url: "/admin/blog", icon: PenTool },
      { title: "Galeria", url: "/admin/gallery", icon: Images },
    ]
  },
  {
    label: "Design & Estilo",
    items: [
      { title: "Estilo do Hero", url: "/admin/hero", icon: LayoutTemplate },
      { title: "Cores do Site", url: "/admin/theme", icon: Palette },
      { title: "Imagens do Site", url: "/admin/images", icon: Image },
      { title: "Redes Sociais", url: "/admin/social", icon: Share2 },
    ]
  },
  {
    label: "Configurações",
    items: [
      { title: "Usuários", url: "/admin/users", icon: Users },
    ]
  }
];


export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b h-14 flex items-center justify-between px-4 shrink-0">
        {!collapsed && <span className="font-serif font-bold text-sm tracking-tight">Eco Wanderlust</span>}
        <SidebarTrigger className={collapsed ? "mx-auto" : ""} />
      </SidebarHeader>
      <SidebarContent className="gap-0 py-2 overflow-x-hidden">
        {menuGroups.map((group) => (
          <SidebarGroup key={group.label} className="py-1">
            {!collapsed && (
              <SidebarGroupLabel className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground/60 h-auto py-1 px-4">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === "/admin"}
                        className="hover:bg-muted/50 transition-colors"
                        activeClassName="bg-muted text-primary font-medium"
                      >
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t p-2">
        {!collapsed && (
          <div className="mb-2 px-2">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Logado como</p>
            <p className="text-[11px] text-foreground font-medium truncate">
              {user?.email}
            </p>
          </div>
        )}
        <Button variant="outline" size="sm" onClick={handleSignOut} className="w-full h-8 justify-start border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive text-xs">
          <LogOut className="h-3 w-3 mr-2" />
          {!collapsed && <span className="font-semibold">Sair</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

