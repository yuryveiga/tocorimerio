// Force clean build after dependency cleanup
import { lazy, Suspense, useState, useEffect, type ReactNode } from "react";
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
import { SchemaGuard } from "./components/SchemaGuard";
import { ThemeApplier } from "./components/ThemeApplier";
import { useAnalytics } from "./hooks/useAnalytics";
import { usePerfMetrics } from "./hooks/usePerfMetrics";
import { BUILD_ID } from "./version";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ScrollToHash } from "./components/ScrollToHash";
import { RouteFader } from "./components/RouteFader";
import { useSiteData } from "./hooks/useSiteData";

// ─── Eagerly loaded (home page only) ─────────────────────────────────────────
import Index from "./pages/Index";

// ─── Lazy UI shell (loads after first paint to reduce TBT/TTI) ───────────────
const FloatingButtons = lazy(() => import("./components/FloatingButtons").then(m => ({ default: m.FloatingButtons })));
const MagneticCursor  = lazy(() => import("./components/MagneticCursor").then(m => ({ default: m.MagneticCursor })));

// ─── Lazily loaded pages (split from main bundle) ─────────────────────────────
const PasseioDetalhe         = lazy(() => import("./pages/PasseioDetalhe"));
const BlogPost               = lazy(() => import("./pages/BlogPost"));
const NotFound               = lazy(() => import("./pages/NotFound"));
const AdminLogin             = lazy(() => import("./pages/AdminLogin"));
const OAuthConsent           = lazy(() => import("./pages/OAuthConsent"));
const AdminResetPassword     = lazy(() => import("./pages/AdminResetPassword"));
const AdminLayout            = lazy(() => import("./pages/AdminLayout"));
const AdminDashboard         = lazy(() => import("./pages/AdminDashboard"));
const AdminTours             = lazy(() => import("./pages/AdminTours"));
const AdminPages             = lazy(() => import("./pages/AdminPages"));
const AdminImages            = lazy(() => import("./pages/AdminImages"));
const AdminSocial            = lazy(() => import("./pages/AdminSocial"));
const AdminGallery           = lazy(() => import("./pages/AdminGallery"));
const AdminGuides            = lazy(() => import("./pages/AdminGuides"));
const AdminBlog              = lazy(() => import("./pages/AdminBlog"));
const AdminHero              = lazy(() => import("./pages/AdminHero"));
const AdminTheme             = lazy(() => import("./pages/AdminTheme"));
const AdminUsers             = lazy(() => import("./pages/AdminUsers"));
const AdminSales             = lazy(() => import("./pages/AdminSales"));
const AdminSimulator         = lazy(() => import("./pages/AdminSimulator"));
const AdminCalendar          = lazy(() => import("./pages/AdminCalendar"));
const AdminAnalytics         = lazy(() => import("./pages/AdminAnalytics"));
const Blog                   = lazy(() => import("./pages/Blog"));
const Contact                = lazy(() => import("./pages/Contact"));
const AboutUs                = lazy(() => import("./pages/AboutUs"));
const Cart                   = lazy(() => import("./pages/Cart"));
const MaracanaCalendar       = lazy(() => import("./pages/MaracanaCalendar"));
const GenericPage            = lazy(() => import("./pages/GenericPage"));
const CheckoutSuccess        = lazy(() => import("./pages/CheckoutSuccess"));
const MatchDetail            = lazy(() => import("./pages/MatchDetail"));
const FlamengoVascoMaracana  = lazy(() => import("./pages/FlamengoVascoMaracana"));
const FluminenseBolivarLibertadores = lazy(() => import("./pages/FluminenseBolivarLibertadores"));
const FluminenseDeportivoGuairaLibertadores = lazy(() => import("./pages/FluminenseDeportivoGuairaLibertadores"));
const FlamengoCoritibaMaracana = lazy(() => import("./pages/FlamengoCoritibaMaracana"));
const FluminenseIndependienteRivadaviaLibertadores = lazy(() => import("./pages/FluminenseIndependienteRivadaviaLibertadores"));
const FlamengoMirassolMaracana = lazy(() => import("./pages/FlamengoMirassolMaracana"));
const FluminensePlatenseLibertadores = lazy(() => import("./pages/FluminensePlatenseLibertadores"));
const PasseiosIndex          = lazy(() => import("./pages/PasseiosIndex"));
// BrasilPanamaMaracana removida — redirecionada para /#tours
const JogoLanding            = lazy(() => import("./pages/JogoLanding"));
const Sitemap                = lazy(() => import("./pages/Sitemap"));
const PasseiosCategoria      = lazy(() => import("./pages/PasseiosCategoria"));
const Experiences            = lazy(() => import("./pages/Experiences"));
const ShortLinkRedirect      = lazy(() => import("./pages/ShortLinkRedirect"));
const PrivateGuideRio        = lazy(() => import("./pages/PrivateGuideRio"));
const ThingsToDoInRio        = lazy(() => import("./pages/ThingsToDoInRio"));

const PageLoader = () => <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

// Redireciona para a home com hash, usando window.location para garantir o scroll ao anchor
const RedirectToHash = ({ hash }: { hash: string }) => {
  useEffect(() => {
    window.location.replace(`/${hash}`);
  }, [hash]);
  return <PageLoader />;
};

// Deferred analytics — runs after first paint to avoid blocking main thread
const AnalyticsTracker = () => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    // Defer analytics ~3.5s after mount to stay off the critical path.
    // Uses requestIdleCallback when available, with a setTimeout fallback.
    const w = window as any;
    let idleId: number | undefined;
    let timeoutId: number | undefined;
    const schedule = () => {
      if (typeof w.requestIdleCallback === "function") {
        idleId = w.requestIdleCallback(() => setReady(true), { timeout: 5000 });
      } else {
        timeoutId = window.setTimeout(() => setReady(true), 3500);
      }
    };
    timeoutId = window.setTimeout(schedule, 3500);
    return () => {
      if (idleId && typeof w.cancelIdleCallback === "function") w.cancelIdleCallback(idleId);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, []);
  // Only call the analytics hook once we're ready — keeps the
  // Supabase auth.getSession() + edge function fetch out of the
  // initial paint critical path.
  if (ready) {
    return <AnalyticsRunner />;
  }
  return null;
};

const AnalyticsRunner = () => {
  useAnalytics();
  return null;
};

// Coleta LCP/CLS/TTFB/fontSwaps e loga em console + dispara
// `lov:perfmetrics` para acompanhar o impacto dos preloads por rota.
const PerfMetricsTracker = () => {
  usePerfMetrics();
  return null;
};

// Mounts children after first paint + idle, so the UI shell (cursor,
// floating WhatsApp, sticky CTA) stays off the critical path.
const DeferUntilIdle = ({ children, delay = 1200 }: { children: ReactNode; delay?: number }) => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const w = window as any;
    let idleId: number | undefined;
    let timeoutId: number | undefined;
    const schedule = () => {
      if (typeof w.requestIdleCallback === "function") {
        idleId = w.requestIdleCallback(() => setReady(true), { timeout: 3000 });
      } else {
        timeoutId = window.setTimeout(() => setReady(true), delay);
      }
    };
    timeoutId = window.setTimeout(schedule, delay);
    return () => {
      if (idleId && typeof w.cancelIdleCallback === "function") w.cancelIdleCallback(idleId);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [delay]);
  return ready ? <>{children}</> : null;
};

const SiteDataReadyNotifier = () => {
  const { isLoading } = useSiteData();
  useEffect(() => {
    if (!isLoading) {
      document.body.setAttribute('data-site-data-ready', 'true');
    }
  }, [isLoading]);
  return null;
};

const App = ({ queryClient: externalQueryClient }: { queryClient?: QueryClient }) => {
  const [queryClient] = useState(() => externalQueryClient || new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 60, // 60 minutes
        gcTime: 1000 * 60 * 60 * 2, // 2 hours
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
            <SiteDataReadyNotifier />
            <CurrencyProvider>
              <LocaleProvider>
                <CartProvider>
                  <AnalyticsTracker />
                  <SchemaGuard />
                  <PerfMetricsTracker />
                  {/* UI shell: no fallback to avoid layout shift */}
                  <Suspense fallback={null}>
                    <DeferUntilIdle>
                      <FloatingButtons />
                      {/* Cursor custom só existe em ponteiro fino: não baixar o chunk no mobile. */}
                      {typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches && <MagneticCursor />}
                    </DeferUntilIdle>
                  </Suspense>
                  {/* Page content: show spinner while lazy chunk loads */}
                  <Suspense fallback={<PageLoader />}>
                    <RouteFader>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/r/:code" element={<ShortLinkRedirect />} />
                      <Route path="/blog" element={<Blog />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/about-us" element={<AboutUs />} />
                      <Route path="/blog/:slug" element={<BlogPost />} />
                      <Route path="/carrinho" element={<Cart />} />
                      <Route path="/confirmacao" element={<CheckoutSuccess />} />
                      <Route path="/maracana-calendario" element={<MaracanaCalendar />} />
                      <Route path="/maracanã-calendário" element={<Navigate to="/maracana-calendario" replace />} />
                      <Route path="/maracanacalendar" element={<Navigate to="/maracana-calendario" replace />} />
                      <Route path="/maracana-games-schedule" element={<Navigate to="/maracana-calendario" replace />} />
                      
                      {/* Redirecionamentos para slugs corrompidos (Match) - De Limpo para Sujo conforme pedido */}
                      <Route path="/match/fluminense-vs-operario-ferroviario-2026-05-12" element={<Navigate to="/match/fluminense-vs-operrio-ferrovirio-2026-05-12" replace />} />
                      <Route path="/match/fluminense-vs-sao-paulo-2026-05-16" element={<Navigate to="/match/fluminense-vs-so-paulo-2026-05-16" replace />} />
                      <Route path="/match/vitoria-vs-fluminense-2026-06-01" element={<Navigate to="/match/vitria-vs-fluminense-2026-06-01" replace />} />

                      <Route path="/passeio" element={<PasseiosIndex />} />
                      <Route path="/our-tours" element={<PasseiosIndex />} />
                      {/* Fix: /our-tours/index.html discovered by Google (old static URL) → canonical /passeio */}
                      <Route path="/our-tours/index.html" element={<Navigate to="/passeio" replace />} />
                      <Route path="/passeios" element={<Navigate to="/passeio" replace />} />
                      <Route path="/passeios/:categoria" element={<PasseiosCategoria />} />
                      <Route path="/city-tour" element={<PasseiosCategoria categoriaOverride="city-tour" pathOverride="/city-tour" />} />
                      <Route path="/hiking" element={<PasseiosCategoria categoriaOverride="trilha" pathOverride="/hiking" />} />
                      <Route path="/one-day" element={<PasseiosCategoria categoriaOverride="um-dia" pathOverride="/one-day" />} />
                      <Route path="/experiences" element={<Experiences />} />
                      <Route path="/your-private-guide-in-rio" element={<PrivateGuideRio />} />
                      <Route path="/things-to-do-in-rio-de-janeiro" element={<ThingsToDoInRio />} />
                      <Route path="/passeio/:id" element={<PasseioDetalhe />} />
                      {/* Fix: accented/corrupted tour slugs that Google indexed without canonical */}
                      <Route path="/passeio/maracanã-matchday" element={<Navigate to="/passeio/maracana-matchday" replace />} />
                      <Route path="/passeio/um-dia-em-niter-i" element={<Navigate to="/passeio/um-dia-em-niteroi" replace />} />
                      <Route path="/match/:id" element={<MatchDetail />} />

                      {/* Fix: blog slug that was indexed by Google but doesn't exist in DB */}
                      <Route path="/blog/is-rio-de-janeiro-safe-for-foreign-tourists" element={<Navigate to="/blog/rio-safety-guide-for-us-european-travelers" replace />} />

                      <Route path="/jogo/:id" element={<JogoLanding />} />
                      <Route path="/flamengo-x-vasco-maracana" element={<FlamengoVascoMaracana />} />
                      <Route path="/fluminense-bolivar-libertadores" element={<FluminenseBolivarLibertadores />} />
                      <Route path="/fluminense-x-deportivo-guaira-libertadores" element={<FluminenseDeportivoGuairaLibertadores />} />
                      <Route path="/flamengo-x-coritiba-maracana" element={<FlamengoCoritibaMaracana />} />
                      <Route path="/fluminense-indenpediente-rivadavia-libertadores-maracana" element={<FluminenseIndependienteRivadaviaLibertadores />} />
                      <Route path="/flamengo-x-mirassol-maracana-tickets-02-09" element={<FlamengoMirassolMaracana />} />
                      <Route path="/Fluminense-x-patense-libertadores-maracana-tickets" element={<FluminensePlatenseLibertadores />} />
                      <Route path="/fluminense-x-patense-libertadores-maracana-tickets" element={<FluminensePlatenseLibertadores />} />
                      <Route path="/brasil-x-panama-maio-maracana" element={<RedirectToHash hash="#tours" />} />

                      <Route path="/sitemap" element={<Sitemap />} />
                      <Route path="/:slug" element={<GenericPage />} />
                      <Route path="/admin/login" element={<AdminLogin />} />
                      <Route path="/admin/reset-password" element={<AdminResetPassword />} />
                      <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
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
                        <Route path="guides" element={<AdminGuides />} />
                        <Route path="sales" element={<AdminSales />} />
                        <Route path="simulator" element={<AdminSimulator />} />
                        <Route path="calendar" element={<AdminCalendar />} />
                        <Route path="pages" element={<AdminPages />} />
                        <Route path="analytics" element={<AdminAnalytics />} />

                      </Route>
                      <Route path="/404" element={<NotFound />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                    </RouteFader>
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
