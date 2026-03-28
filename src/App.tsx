import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DefaultProviders } from "./components/providers/default.tsx";
import AuthCallback from "./pages/auth/Callback.tsx";
import Index from "./pages/Index.tsx";
import AppIndex from "./pages/app/index.tsx";
import NotFound from "./pages/NotFound.tsx";
import { useServiceWorker } from "@/hooks/use-service-worker.ts";
import { PwaInstallBanner } from "@/components/pwa-install-banner.tsx";
import { OfflineIndicator } from "@/components/offline-indicator.tsx";

function AppContent() {
  useServiceWorker();
  return (
    <>
      <OfflineIndicator />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/app" element={<AppIndex />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <PwaInstallBanner />
    </>
  );
}

export default function App() {
  return (
    <DefaultProviders>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </DefaultProviders>
  );
}
