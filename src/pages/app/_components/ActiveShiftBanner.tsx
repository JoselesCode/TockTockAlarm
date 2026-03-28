import { motion } from "motion/react";
import { AlarmClock, CheckCircle, Clock, PowerOff } from "lucide-react";
import type { Doc } from "@/convex/_generated/dataModel.d.ts";
import { SHIFT_ICONS, SHIFT_COLORS } from "@/lib/shift-utils.ts";
import { cn } from "@/lib/utils.ts";

type Props = {
  activeShift?: Doc<"shifts"> | null;
  totalShifts: number;
  activeAlarms: number;
};

export default function ActiveShiftBanner({ activeShift, totalShifts, activeAlarms }: Props) {
  if (!activeShift) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-muted/50 border border-border rounded-2xl p-5 flex items-center gap-4"
      >
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center flex-shrink-0">
          <PowerOff className="w-7 h-7 text-muted-foreground" />
        </div>
        <div>
          <p className="font-black text-lg text-muted-foreground">Sin turno activo</p>
          <p className="text-sm text-muted-foreground/70">
            Activa el turno que te corresponde hoy usando el boton de encendido en cada tarjeta.
          </p>
        </div>
      </motion.div>
    );
  }

  const IconComp = SHIFT_ICONS[activeShift.icon] ?? AlarmClock;
  const colors = SHIFT_COLORS[activeShift.color] ?? SHIFT_COLORS["amber"];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl p-5 border-2 relative overflow-hidden",
        colors.bg,
        colors.border
      )}
    >
      {/* Glow decoration */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20 blur-2xl pointer-events-none"
        style={{ background: "var(--color-primary)" }} />

      <div className="flex items-center gap-4 relative">
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className={cn("w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg", colors.activeBg)}
        >
          <IconComp className="w-8 h-8 text-white" strokeWidth={2} />
        </motion.div>

        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("text-xs font-black px-2 py-1 rounded-full", colors.badge)}>
              TURNO ACTIVO
            </span>
          </div>
          <p className="font-black text-2xl mt-1 leading-tight">{activeShift.name}</p>
          <p className={cn("text-sm font-semibold mt-0.5", colors.text)}>
            {activeShift.startTime} — {activeShift.endTime}
          </p>
        </div>

        <div className="text-right flex-shrink-0">
          <div className="flex items-center gap-1 justify-end">
            <CheckCircle className={cn("w-4 h-4", colors.text)} />
            <span className={cn("font-black text-2xl", colors.text)}>{activeAlarms}</span>
          </div>
          <p className="text-xs text-muted-foreground">alarmas activas</p>
        </div>
      </div>
    </motion.div>
  );
}
