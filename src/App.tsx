import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { initNative } from "./lib/native";
import { supabase } from "@/integrations/supabase/client";

const NativeBootstrap = () => {
  const navigate = useNavigate();
  useEffect(() => {
    initNative((path) => navigate(path));
  }, [navigate]);
  return null;
};

// OAuth landing route. The Supabase client parses the URL fragment before this
// mounts (detectSessionInUrl defaults to true), so the session is already in
// storage — we just return the user to the home screen instead of falling
// through to the 404 wildcard.
//
// When the flow was started from the native app (`?native=1`), this page runs in
// the system browser instead: hand the tokens back to the app through the
// doxazo:// deep link rather than signing in here.
const OAuthCallback = () => {
  const [message, setMessage] = useState("Completing sign in…");

  useEffect(() => {
    const complete = async () => {
      const search = window.location.search;
      const hash = window.location.hash;
      const params = new URLSearchParams(search);
      new URLSearchParams(hash.replace(/^#/, "")).forEach((v, k) => {
        if (!params.has(k)) params.set(k, v);
      });
      const authError = params.get("error_description") || params.get("error");
      if (authError) {
        console.warn("[oauth] Web callback failed", { reason: authError });
        window.location.replace(`/auth?error=${encodeURIComponent(authError)}`);
        return;
      }

      // Apple rejects Return URLs that carry a query string, so the native flow
      // is flagged through the state value instead of `?native=1`.
      const isNative = (params.get("state") ?? "").startsWith("dxnat-");
      if (isNative) {
        window.location.replace(`doxazo://oauth/callback${search}${hash}`);
        return;
      }

      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        console.warn("[oauth] Web callback completed without a session", {
          reason: error?.message ?? "missing_session",
        });
        setMessage("We could not complete sign in. Please return and try again.");
        window.setTimeout(() => window.location.replace("/auth?error=session"), 1200);
        return;
      }
      window.location.replace("/");
    };
    void complete();
  }, []);
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <p role="status" className="text-sm text-muted-foreground">{message}</p>
    </main>
  );
};


import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import About from "./pages/About";
import DailyDevotional from "./pages/DailyDevotional";
import Archive from "./pages/Archive";
import Categories from "./pages/Categories";
import CategoryDetail from "./pages/CategoryDetail";
import Search from "./pages/Search";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Admin from "./pages/Admin";
import Favorites from "./pages/Favorites";
import Settings from "./pages/Settings";
import SettingsStub from "./pages/SettingsStub";
import DeleteAccount from "./pages/DeleteAccount";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";
import Plans from "./pages/Plans";
import PlanDetail from "./pages/PlanDetail";
import Journal from "./pages/Journal";
import Highlights from "./pages/Highlights";
import Prayers from "./pages/Prayers";
import Downloads from "./pages/Downloads";
import Goals from "./pages/Goals";
import Scripture from "./pages/Scripture";
import Groups from "./pages/Groups";
import MobileNav from "./components/MobileNav";
import RouteAnalytics from "./components/RouteAnalytics";
import BrandIntro from "./components/BrandIntro";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <NativeBootstrap />
          <RouteAnalytics />
          <BrandIntro />
          <MobileNav />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/devotional" element={<DailyDevotional />} />
            <Route path="/devotional/:id" element={<DailyDevotional />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/:slug" element={<CategoryDetail />} />
            <Route path="/search" element={<Search />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/notifications" element={<SettingsStub />} />
            <Route path="/settings/bible-versions" element={<SettingsStub />} />
            <Route path="/delete-account" element={<DeleteAccount />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/plans/:slug" element={<PlanDetail />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/highlights" element={<Highlights />} />
            <Route path="/prayers" element={<Prayers />} />
            <Route path="/downloads" element={<Downloads />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/scripture" element={<Scripture />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/~/oauth/callback" element={<OAuthCallback />} />
            <Route path="/~oauth/callback" element={<OAuthCallback />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />
            <Route path="/support" element={<Support />} />
            <Route path="*" element={<NotFound />} />

          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
