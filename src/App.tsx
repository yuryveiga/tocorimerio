// Force clean build after dependency cleanup
import { lazy, Suspense, useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { StaticRouter } from "react-router-dom/server";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { CartProvider } from "@/contexts/CartContext";
import { FloatingButtons } from "./components/FloatingButtons";
import { ThemeApplier } from "./components/ThemeApplier";
import { useAnalytics } from "./hooks/useAnalytics";
import { BUILD_ID } from "./version";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ScrollToHash } from "./components/ScrollToHash";
import { MobileStickyCTA } from "./components/MobileStickyCTA";

import Index from "./pages/Index";
import PasseioDetalhe from "./pages/PasseioDetalhe";
import BlogPost from "./pages/BlogPost";
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminResetPassword = lazy(() => import("./pages/AdminResetPassword"));
const AdminLayout = lazy(() => import("./pages/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminTours = lazy(() => import("./pages/AdminTours"));
const AdminPages = lazy(() => import("./pages/AdminPages"));
const AdminImages = lazy(() => import("./pages/AdminImages"));
const AdminSocial = lazy(() => import("./pages/AdminSocial"));
const AdminGallery = lazy(() => import("./pages/AdminGallery"));
const AdminBlog = lazy(() => import("./pages/AdminBlog"));
const AdminHero = lazy(() => import("./pages/AdminHero"));
const AdminTheme = lazy(() => import("./pages/AdminTheme"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminSales = lazy(() => import("./pages/AdminSales"));
const AdminSimulator = lazy(() => import("./pages/AdminSimulator"));
const AdminCalendar = lazy(() => import("./pages/AdminCalendar"));
const AdminAnalytics = lazy(() => import("./pages/AdminAnalytics"));

const Blog = lazy(() => import("./pages/Blog"));
const Cart = lazy(() => import("./pages/Cart"));
const MaracanaCalendar = lazy(() => import("./pages/MaracanaCalendar"));
const GenericPage = lazy(() => import("./pages/GenericPage"));
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess"));
const MatchDetail = lazy(() => import("./pages/MatchDetail"));
const FlamengoVascoMaracana = lazy(() => import("./pages/FlamengoVascoMaracana"));
const FluminenseBolivarLibertadores = lazy(() => import("./pages/FluminenseBolivarLibertadores"));
const PasseiosIndex = lazy(() => import("./pages/PasseiosIndex"));
const BrasilPanamaMaracana = lazy(() => import("./pages/BrasilPanamaMaracana"));
const JogoLanding = lazy(() => import("./pages/JogoLanding"));
const PasseiosCategoria = lazy(() => import("./pages/PasseiosCategoria"));

const PageLoader = () => <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

const AnalyticsTracker = () => {
  useAnalytics();
  return null;
};

const App = ({ queryClient: externalQueryClient }: { queryClient?: QueryClient }) => {
  const [queryClient] = useState(() => externalQueryClient || new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <ThemeApplier />
            <ScrollToHash />
            <CurrencyProvider>
              <LocaleProvider>
                <CartProvider>
                  <AnalyticsTracker />
                  <Suspense fallback={<PageLoader />}>
                    <MobileStickyCTA />
                    <FloatingButtons />
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/blog" element={<Blog />} />
                      <Route path="/blog/:slug" element={<BlogPost />} />
                      <Route path="/carrinho" element={<Cart />} />
                      <Route path="/confirmacao" element={<CheckoutSuccess />} />
                      <Route path="/maracana-calendario" element={<MaracanaCalendar />} />
                      <Route path="/maracanã-calendário" element={<Navigate to="/maracana-calendario" replace />} />
                      <Route path="/maracanacalendar" element={<Navigate to="/maracana-calendario" replace />} />
                      
                      {/* Redirecionamentos para slugs corrompidos (Match) */}
                      <Route path="/match/fluminense-vs-operrio-ferrovirio-2026-05-12" element={<Navigate to="/match/fluminense-vs-operario-ferroviario-2026-05-12" replace />} />
                      <Route path="/match/fluminense-vs-so-paulo-2026-05-16" element={<Navigate to="/match/fluminense-vs-sao-paulo-2026-05-16" replace />} />
                      <Route path="/match/vitria-vs-fluminense-2026-06-01" element={<Navigate to="/match/vitoria-vs-fluminense-2026-06-01" replace />} />

                      <Route path="/passeio" element={<PasseiosIndex />} />
                      <Route path="/passeios" element={<Navigate to="/passeio" replace />} />
                      <Route path="/passeios/:categoria" element={<PasseiosCategoria />} />
                      <Route path="/passeio/:id" element={<PasseioDetalhe />} />
                      <Route path="/match/:id" element={<MatchDetail />} />
                      <Route path="/jogo/:id" element={<JogoLanding />} />
                      <Route path="/flamengo-x-vasco-maracana" element={<FlamengoVascoMaracana />} />
                      <Route path="/fluminense-bolivar-libertadores" element={<FluminenseBolivarLibertadores />} />
                      <Route path="/brasil-x-panama-maio-maracana" element={<BrasilPanamaMaracana />} />
                      <Route path="/:slug" element={<GenericPage />} />
                      <Route path="/admin/login" element={<AdminLogin />} />
                      <Route path="/admin/reset-password" element={<AdminResetPassword />} />
                      <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<AdminDashboard />} />
                        <Route path="blog" element={<AdminBlog />} />
                        <Route path="hero" element={<AdminHero />} />
                        <Route path="theme" element={<AdminTheme />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="tours" element={<AdminTours />} />
                        <Route path="images" element={<AdminImages />} />
                        <Route path="social" element={<AdminSocial />} />
                        <Route path="gallery" element={<AdminGallery />} />
                        <Route path="sales" element={<AdminSales />} />
                        <Route path="simulator" element={<AdminSimulator />} />
                        <Route path="calendar" element={<AdminCalendar />} />
                        <Route path="pages" element={<AdminPages />} />
                        <Route path="analytics" element={<AdminAnalytics />} />

                      </Route>
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Suspense>
                </CartProvider>
              </LocaleProvider>
            </CurrencyProvider>

          </TooltipProvider>
        </AuthProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
};

export default App;
