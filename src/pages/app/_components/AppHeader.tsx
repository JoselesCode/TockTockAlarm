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
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const ActiveIcon = activeShift
    ? SHIFT_ICONS[activeShift.icon] ?? AlarmClock
    : null;

  const activeColors = activeShift
    ? SHIFT_COLORS[activeShift.color] ?? SHIFT_COLORS["amber"]
    : null;

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-card">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-sm">
                <AlarmClock
                  className="h-5 w-5 text-primary-foreground"
                  strokeWidth={2.5}
                />
              </div>

              <div className="min-w-0">
                <p className="text-base font-black leading-tight">
                  TockTock<span className="text-primary">Alarm</span>
                </p>

                {user && (
                  <p className="max-w-[150px] truncate text-xs text-muted-foreground">
                    {user.profile.name ?? user.profile.email ?? "Trabajador/a"}
                  </p>
                )}
              </div>
            </div>

            {activeShift && ActiveIcon && activeColors && (
              <div
                className={cn(
                  "hidden items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold sm:flex",
                  activeColors.badge
                )}
              >
                <ActiveIcon className="h-3.5 w-3.5" />
                Turno {activeShift.name}
              </div>
            )}

            <div className="flex items-center gap-2">
              <div className="hidden text-right sm:block">
                <p className="tabular-nums text-lg font-black leading-tight">
                  {timeStr}
                </p>
                <p className="text-xs capitalize text-muted-foreground">
                  {dateStr}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="gap-2 font-bold shadow-sm"
                onClick={() => setAccessibilityOpen(true)}
              >
                <Accessibility className="h-4 w-4 text-primary" />
                <span className="hidden sm:inline">
                  Accesibilidad
                  {activeAccessibilityCount > 0 &&
                    ` (${activeAccessibilityCount})`}
                </span>
              </Button>

              <Link to="/">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 font-bold shadow-sm"
                >
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">Inicio</span>
                </Button>
              </Link>

              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-red-200 font-bold shadow-sm hover:border-red-300"
                onClick={() => removeUser()}
              >
                <LogOut className="h-4 w-4 text-red-500" />
                <span className="hidden text-red-500 sm:inline">Salir</span>
              </Button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 sm:hidden">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 font-bold"
              onClick={() => setAccessibilityOpen(true)}
            >
              <Accessibility className="h-4 w-4 text-primary" />
              {activeAccessibilityCount > 0 && (
                <span className="text-xs font-black text-primary">
                  {activeAccessibilityCount}
                </span>
              )}
            </Button>

            <Link to="/">
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 font-bold"
              >
                <Home className="h-4 w-4" />
              </Button>
            </Link>

            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-red-200 font-bold"
              onClick={() => removeUser()}
            >
              <LogOut className="h-4 w-4 text-red-500" />
            </Button>
          </div>

          {activeShift && ActiveIcon && activeColors && (
            <div className="mt-3 flex justify-center sm:hidden">
              <div
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold",
                  activeColors.badge
                )}
              >
                <ActiveIcon className="h-3.5 w-3.5" />
                {activeShift.name} — ACTIVO
              </div>
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