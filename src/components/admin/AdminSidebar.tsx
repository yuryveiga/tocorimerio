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
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Menu
} from "lucide-react";

import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useSiteData } from "@/hooks/useSiteData";
import { OptimizedImage } from "@/components/OptimizedImage";
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
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const { signOut, user } = useAuth();
  const { images, siteSettings } = useSiteData();
  const navigate = useNavigate();

  const logoUrl = images["logo"] || "https://ogzasprtfgimjqrtcseg.supabase.co/storage/v1/object/public/site-images/images__1_-removebg-preview.png";

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50 group">
      <SidebarHeader className="h-16 flex items-center justify-between px-3 shrink-0 border-b border-border/40 bg-card/50 backdrop-blur-sm relative">
        <div className={cn("flex items-center gap-3 transition-all duration-300", collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto")}>
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0 overflow-hidden border border-border/50">
            <OptimizedImage 
              src={siteSettings?.logo_url || logoUrl} 
              alt="Tocorime Rio" 
              className="w-full h-full object-contain p-1" 
            />
          </div>
          <span className="font-serif font-black text-base tracking-tight whitespace-nowrap text-foreground">Tocorime Rio</span>
        </div>
        
        {/* Floating Toggle Handle */}
        <button 
          onClick={() => toggleSidebar()}
          className={cn(
            "absolute -right-3 top-1/2 -translate-y-1/2 z-50 h-6 w-6 rounded-full border bg-background shadow-md flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100",
            collapsed ? "-right-3" : "-right-3"
          )}
          title={collapsed ? "Expandir Menu" : "Recolher Menu"}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </SidebarHeader>
      
      <SidebarContent className="gap-0 py-4 overflow-x-hidden scrollbar-thin">
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
      <SidebarRail />
    </Sidebar>
  );
}

