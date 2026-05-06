import { useEffect, useState } from "react";
import { Download, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";

// BeforeInstallPromptEvent is not in the standard lib
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "pwa-install-dismissed";

export function PwaInstallBanner() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Already installed or dismissed
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      sessionStorage.getItem(DISMISSED_KEY)
    ) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const ios =
      /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase()) && !("MSStream" in window);
    setIsIos(ios);

    if (ios) {
      // Show iOS instructions after a small delay
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }

    // Android/Desktop: capture beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
      setTimeout(() => setIsVisible(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === "accepted") {
      setIsVisible(false);
      setIsInstalled(true);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem(DISMISSED_KEY, "1");
  };

  if (isInstalled || !isVisible) return null;

  return (
    <div
      role="banner"
      aria-label="Instalar aplicación"
      className={cn(
        "fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm",
        "bg-card border border-border rounded-2xl shadow-2xl p-4",
        "animate-in slide-in-from-bottom-4 duration-300",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Smartphone className="w-5 h-5 text-primary" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-foreground">Instalar TockTockAlarm</p>
          {isIos ? (
            <p className="text-xs text-muted-foreground mt-0.5">
              Toca{" "}
              <span className="font-semibold text-foreground" aria-label="botón Compartir">
                Compartir
              </span>{" "}
              →{" "}
              <span className="font-semibold text-foreground">Agregar a pantalla de inicio</span>
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-0.5">
              Accede rápido desde tu pantalla de inicio sin abrir el navegador.
            </p>
          )}
        </div>
        <button
          onClick={handleDismiss}
          aria-label="Cerrar banner de instalación"
          className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {!isIos && promptEvent && (
        <Button
          onClick={handleInstall}
          size="sm"
          className="w-full mt-3 gap-2"
          aria-label="Instalar aplicación en pantalla de inicio"
        >
          <Download className="w-4 h-4" aria-hidden="true" />
          Instalar App
        </Button>
      )}
    </div>
  );
}
