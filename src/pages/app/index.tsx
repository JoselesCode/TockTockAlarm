import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { AlarmClock, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { SignInButton } from "@/components/ui/signin.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import AppPage from "./page.tsx";

export default function App() {
  return (
    <>
      <AuthLoading>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-full max-w-md p-8 space-y-4">
            <Skeleton className="h-12 w-3/4 mx-auto rounded-xl" />
            <Skeleton className="h-6 w-1/2 mx-auto rounded-lg" />
            <div className="space-y-3 pt-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-36 w-full rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </AuthLoading>

      <Unauthenticated>
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="w-full max-w-sm text-center space-y-6">
            {/* Logo */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center shadow-xl">
                <AlarmClock className="w-10 h-10 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="font-black text-3xl tracking-tight">
                  TockTock<span className="text-primary">Alarm</span>
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Alarmas inclusivas para turnos rotativos
                </p>
              </div>
            </div>

            {/* Shift preview */}
            <div className="bg-card border border-border rounded-2xl p-4 text-left space-y-2">
              {[
                { label: "Turno Mañana", time: "05:00 — 13:00", color: "bg-amber-500" },
                { label: "Turno Tarde", time: "13:00 — 21:00", color: "bg-orange-500" },
                { label: "Turno Noche", time: "21:00 — 05:00", color: "bg-indigo-600" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${s.color} flex-shrink-0`} />
                  <span className="font-semibold text-sm">{s.label}</span>
                  <span className="text-xs text-muted-foreground ml-auto font-mono">{s.time}</span>
                </div>
              ))}
            </div>

            {/* Sign in */}
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Inicia sesion para guardar tus turnos y alarmas personales.
              </p>
              <SignInButton className="w-full" />
            </div>

            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                <ArrowLeft className="w-4 h-4" />
                Volver al inicio
              </Button>
            </Link>
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        <AppPage />
      </Authenticated>
    </>
  );
}
