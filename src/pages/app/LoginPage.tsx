import { useEffect } from "react";
import { AlarmClock, ArrowLeft } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { SignInButton } from "@/components/ui/signin.tsx";
import { useAuth } from "@/hooks/use-auth.ts";

export default function LoginPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === "rrhh") {
        navigate("/app/dashboard", { replace: true });
      } else {
        navigate("/app/home", { replace: true });
      }
    }
  }, [user, isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center shadow-xl">
              <AlarmClock
                className="w-10 h-10 text-primary-foreground"
                strokeWidth={2.5}
              />
            </div>

            <div>
              <h1 className="font-black text-3xl tracking-tight">
                TockTock<span className="text-primary">Alarm</span>
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Ingresa con Google para usar la app
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <SignInButton
              className="w-full"
              signInText="Ingresar con Google"
              signOutText="Cerrar sesión"
            />
          </div>

          <Link to="/">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (user?.role === "rrhh") {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <Navigate to="/app/home" replace />;
}