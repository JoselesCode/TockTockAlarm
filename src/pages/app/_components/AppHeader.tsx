import { useState } from "react";
import { Accessibility, AlarmClock, Home, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { useAuth } from "@/hooks/use-auth.ts";
import type { Shift } from "@/lib/app-state.tsx";
import { SHIFT_ICONS, SHIFT_COLORS } from "@/lib/shift-utils.ts";
import { cn } from "@/lib/utils.ts";
import AccessibilityDialog from "./AccessibilityDialog.tsx";

type Props = {
  activeShift?: Shift | null;
  activeAccessibilityCount?: number;
};

export default function AppHeader({
  activeShift,
  activeAccessibilityCount = 0,
}: Props) {
  const { user, removeUser } = useAuth();
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);

  const now = new Date();

  const timeStr = now.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const dateStr = now.toLocaleDateString("es-CL", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  const ActiveIcon = activeShift
    ? SHIFT_ICONS[activeShift.icon] ?? AlarmClock
    : null;

  const activeColors = activeShift
    ? SHIFT_COLORS[activeShift.color] ?? SHIFT_COLORS["amber"]
    : null;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 pt-[env(safe-area-inset-top)] shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="tt-page py-2 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary shadow-sm">
                <AlarmClock
                  className="h-6 w-6 text-primary-foreground"
                  strokeWidth={2.5}
                />
              </div>

              <div className="min-w-0">
                <p className="text-lg font-black leading-tight whitespace-nowrap">
                  TockTock<span className="text-primary">Alarm</span>
                </p>

                {user && (
                  <p className="max-w-[230px] truncate text-xs text-muted-foreground sm:max-w-[320px]">
                    {user.profile.name ?? user.profile.email ?? "Trabajador/a"}
                  </p>
                )}
              </div>
            </div>

            <div className="shrink-0 text-right">
              <p className="tabular-nums text-lg font-black leading-tight">
                {timeStr}
              </p>
              <p className="text-xs capitalize text-muted-foreground">
                {dateStr}
              </p>
            </div>
          </div>

          <div className="grid w-full grid-cols-3 gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "w-full min-w-0 gap-2 border-primary/20 font-bold shadow-sm hover:border-primary/40 hover:bg-primary/10",
                activeAccessibilityCount > 0 &&
                  "border-primary/30 bg-primary/10 text-primary"
              )}
              onClick={() => setAccessibilityOpen(true)}
              aria-label="Abrir ajustes de accesibilidad"
            >
              <Accessibility className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Accesibilidad</span>

              {activeAccessibilityCount > 0 && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-black text-primary-foreground">
                  {activeAccessibilityCount}
                </span>
              )}
            </Button>

            <Link to="/" className="w-full">
              <Button
                variant="outline"
                size="sm"
                className="w-full min-w-0 gap-2 border-primary/20 font-bold shadow-sm hover:border-primary/40 hover:bg-primary/10"
                aria-label="Ir al inicio"
              >
                <Home className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Inicio</span>
              </Button>
            </Link>

            <Button
              variant="outline"
              size="sm"
              className="w-full min-w-0 gap-2 border-red-200 font-bold text-red-500 shadow-sm hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-950/30"
              onClick={() => removeUser()}
              aria-label="Cerrar sesión"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>

          {activeShift && ActiveIcon && activeColors && (
            <div
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold",
                activeColors.badge
              )}
            >
              <ActiveIcon className="h-4 w-4 shrink-0" />
              <span className="truncate">{activeShift.name} — ACTIVO</span>
            </div>
          )}
        </div>
      </header>

      <AccessibilityDialog
        open={accessibilityOpen}
        onClose={() => setAccessibilityOpen(false)}
      />
    </>
  );
}