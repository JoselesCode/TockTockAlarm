import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DefaultProviders } from "./components/providers/default.tsx";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import LoginPage from "./pages/app/LoginPage.tsx";
import HomePage from "./pages/app/HomePage.tsx";
import DashboardPage from "./pages/app/DashboardPage.tsx";
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
        <Route path="/app" element={<LoginPage />} />
        <Route path="/app/home" element={<HomePage />} />
        <Route path="/app/dashboard" element={<DashboardPage />} />
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
