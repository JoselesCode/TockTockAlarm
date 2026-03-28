import { AlarmClock, Home, LogOut, Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { useAuth } from "@/hooks/use-auth.ts";
import type { Doc } from "@/convex/_generated/dataModel.d.ts";
import { SHIFT_ICONS, SHIFT_COLORS } from "@/lib/shift-utils.ts";
import { cn } from "@/lib/utils.ts";

type Props = {
  activeShift?: Doc<"shifts"> | null;
};

export default function AppHeader({ activeShift }: Props) {
  const { user, removeUser } = useAuth();

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

  const ActiveIcon = activeShift ? (SHIFT_ICONS[activeShift.icon] ?? AlarmClock) : null;
  const activeColors = activeShift ? (SHIFT_COLORS[activeShift.color] ?? SHIFT_COLORS["amber"]) : null;

  return (
    <header className="bg-card border-b border-border sticky top-0 z-30">
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
              <AlarmClock className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-black text-base leading-tight">
                TockTock<span className="text-primary">Alarm</span>
              </p>
              {user && (
                <p className="text-xs text-muted-foreground leading-tight truncate max-w-[120px]">
                  {user.profile.name ?? user.profile.email ?? "Trabajador"}
                </p>
              )}
            </div>
          </div>

          {/* Active shift pill */}
          {activeShift && ActiveIcon && activeColors && (
            <div
              className={cn(
                "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold",
                activeColors.badge
              )}
            >
              <ActiveIcon className="w-3.5 h-3.5" />
              {activeShift.name}
            </div>
          )}

          {/* Clock + actions */}
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="font-black text-lg tabular-nums leading-tight">{timeStr}</p>
              <p className="text-xs text-muted-foreground capitalize">{dateStr}</p>
            </div>
            <Link to="/">
              <Button variant="ghost" size="icon" className="w-8 h-8" aria-label="Ir al inicio">
                <Home className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8"
              onClick={() => removeUser()}
              aria-label="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Active shift pill mobile */}
        {activeShift && ActiveIcon && activeColors && (
          <div className="sm:hidden mt-2 flex items-center justify-center">
            <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold", activeColors.badge)}>
              <ActiveIcon className="w-3.5 h-3.5" />
              {activeShift.name} — ACTIVO
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
