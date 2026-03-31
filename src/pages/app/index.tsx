import { AlarmClock, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { SignInButton } from "@/components/ui/signin.tsx";
import AppPage from "./page.tsx";
import { useAuth } from "@/hooks/use-auth.ts";

export default function App() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center shadow-xl">
              <AlarmClock className="w-10 h-10 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-black text-3xl tracking-tight">
                TockTock<span className="text-primary">Alarm</span>
              </h1>
              <p className="text-muted-foreground text-sm mt-1">Accede al modo demo para usar la app</p>
            </div>
          </div>

          <div className="space-y-3">
            <SignInButton className="w-full" signInText="Entrar al modo demo" signOutText="Salir" />
          </div>

          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <AppPage />;
}
