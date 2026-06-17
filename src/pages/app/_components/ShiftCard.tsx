import { useState } from "react";
import { toast } from "sonner";
import {
  AlarmClock,
  Bell,
  BellOff,
  ChevronDown,
  ChevronUp,
  Edit2,
  Plus,
  Power,
  Trash2,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import { SHIFT_COLORS, DAY_LABELS } from "@/lib/shift-utils.ts";
import { cn } from "@/lib/utils.ts";
import AlarmFormDialog from "./AlarmFormDialog.tsx";
import { useAppState, type Alarm, type Shift } from "@/lib/app-state.tsx";

type Props = {
  shift: Shift;
  onEdit: (shift: Shift) => void;
};

function AlarmPowerSwitch({
  checked,
  onClick,
}: {
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex h-12 w-24 shrink-0 items-center rounded-full border-2 px-1 transition-all duration-300 sm:w-28",
        checked
          ? "justify-end border-orange-500 bg-orange-500 shadow-[0_0_18px_rgba(249,115,22,0.55)]"
          : "justify-start border-white/20 bg-slate-700"
      )}
      aria-label={checked ? "Desactivar alarma" : "Activar alarma"}
    >
      <span
        className={cn(
          "absolute text-sm font-black tracking-wide text-white",
          checked ? "left-5" : "right-5"
        )}
      >
        {checked ? "ON" : "OFF"}
      </span>

      <span className="z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-lg">
        <Power
          className={cn(
            "h-5 w-5",
            checked ? "text-orange-500" : "text-slate-500"
          )}
        />
      </span>
    </button>
  );
}

function AlarmRow({
  alarm,
  shiftColor,
  shiftActive,
}: {
  alarm: Alarm;
  shiftColor: string;
  shiftActive: boolean;
}) {
  const { updateAlarm, removeAlarm } = useAppState();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const colors = SHIFT_COLORS[shiftColor] ?? SHIFT_COLORS["amber"];
  const isAlarmActive = alarm.enabled && shiftActive;

  const activeDays =
    alarm.days.length > 0
      ? alarm.days
          .slice()
          .sort()
          .map((d) => DAY_LABELS[d])
          .join(", ")
      : "Sin días seleccionados";

  const toggleEnabled = async () => {
    await updateAlarm(alarm._id, { enabled: !alarm.enabled });

    if (alarm.enabled) {
      toast("Alarma desactivada");
    } else {
      toast.success("Alarma activada");
    }
  };

  const handleDelete = async () => {
    await removeAlarm(alarm._id);
    toast.success("Alarma eliminada");
  };

  return (
    <>
      <div
        className={cn(
          "grid gap-3 rounded-2xl border p-4 transition-all sm:grid-cols-[auto_1fr_auto]",
          isAlarmActive
            ? `${colors.bg} ${colors.border} shadow-sm`
            : "border-border bg-muted/40 opacity-75"
        )}
      >
        <div className="flex items-start gap-3 sm:items-center">
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
              isAlarmActive ? colors.activeBg : "bg-muted"
            )}
          >
            {isAlarmActive ? (
              <Bell className="h-5 w-5 text-white" />
            ) : (
              <BellOff className="h-5 w-5 text-muted-foreground" />
            )}
          </div>

          <div className="min-w-0 sm:hidden">
            <div className="flex flex-wrap items-center gap-2">
              <span className="tabular-nums text-2xl font-black leading-none">
                {alarm.time}
              </span>

              <span
                className={cn(
                  "rounded-full px-2 py-1 text-[11px] font-black",
                  isAlarmActive
                    ? "bg-orange-500 text-white"
                    : "bg-slate-600 text-white/80"
                )}
              >
                {isAlarmActive ? "ACTIVA" : "INACTIVA"}
              </span>
            </div>

            <p className="mt-1 break-words text-sm font-semibold text-foreground">
              {alarm.label}
            </p>
          </div>
        </div>

        <div className="min-w-0 hidden sm:block">
          <div className="flex flex-wrap items-center gap-2">
            <span className="tabular-nums text-2xl font-black leading-none">
              {alarm.time}
            </span>

            <span
              className={cn(
                "rounded-full px-2 py-1 text-[11px] font-black",
                isAlarmActive
                  ? "bg-orange-500 text-white"
                  : "bg-slate-600 text-white/80"
              )}
            >
              {isAlarmActive ? "ACTIVA" : "INACTIVA"}
            </span>
          </div>

          <p className="mt-1 break-words text-base text-muted-foreground">
            {alarm.label}
          </p>

          <p className="mt-1 break-words text-sm text-muted-foreground/70">
            {activeDays}
          </p>
        </div>

        <div className="min-w-0 sm:hidden">
          <p className="break-words text-sm text-muted-foreground/80">
            {activeDays}
          </p>
        </div>

        <div className="flex w-full flex-wrap items-center justify-between gap-2 sm:w-auto sm:justify-end">
          <AlarmPowerSwitch checked={alarm.enabled} onClick={toggleEnabled} />

          <div className="flex items-center gap-1">
            <button
              onClick={() => setEditOpen(true)}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Editar alarma"
            >
              <Edit2 className="h-5 w-5" />
            </button>

            <button
              onClick={() => setDeleteOpen(true)}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              aria-label="Eliminar alarma"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <AlarmFormDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        shiftId={alarm.shiftId}
        editAlarm={alarm}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar alarma</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Eliminar la alarma de las <strong>{alarm.time}</strong> —{" "}
              {alarm.label}? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function ShiftCard({ shift, onEdit }: Props) {
  const { setShiftActive, removeShift, getAlarmsByShift } = useAppState();

  const alarms = getAlarmsByShift(shift._id);
  const [expanded, setExpanded] = useState(shift.isActive);
  const [addAlarmOpen, setAddAlarmOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const colors = SHIFT_COLORS[shift.color] ?? SHIFT_COLORS["amber"];
  const enabledAlarms = alarms.filter((a) => a.enabled).length;
  const totalAlarms = alarms.length;
  const isFixedShift = shift.isDefault || shift.canDelete === false;

  const handleToggleActive = async () => {
    const nextActive = !shift.isActive;

    await setShiftActive(shift._id, nextActive);

    if (nextActive) {
      toast.success(`${shift.name} activado con todas sus alarmas`);
      setExpanded(true);
    } else {
      toast(`${shift.name} desactivado y alarmas apagadas`);
    }
  };

  const handleDeleteClick = () => {
    if (isFixedShift) {
      toast.error("Acción no permitida: este turno fijo no se puede eliminar");
      return;
    }

    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    try {
      if (isFixedShift) {
        toast.error("Acción no permitida: este turno fijo no se puede eliminar");
        return;
      }

      await removeShift(shift._id);
      toast.success("Turno eliminado");
    } catch {
      toast.error("Acción no permitida: este turno fijo no se puede eliminar");
    }
  };

  return (
    <>
      <div
        className={cn(
          "overflow-hidden rounded-2xl border-2 transition-all",
          shift.isActive
            ? `${colors.border} ${colors.bg} shadow-[0_0_22px_rgba(249,115,22,0.18)]`
            : "border-border bg-card shadow-sm"
        )}
      >
        <div className={cn("p-5", shift.isActive ? colors.bg : "bg-card")}>
          <div className="flex flex-wrap items-center gap-4">
            <div
              className={cn(
                "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-sm",
                shift.isActive ? colors.activeBg : "bg-muted"
              )}
            >
              <AlarmClock
                className={cn(
                  "h-7 w-7",
                  shift.isActive ? "text-white" : "text-muted-foreground"
                )}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="break-words text-lg font-black leading-tight">
                  {shift.name}
                </h3>

                {shift.isActive && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-bold",
                      colors.badge
                    )}
                  >
                    ACTIVO
                  </span>
                )}

                {isFixedShift && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    FIJO
                  </span>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                {shift.startTime} — {shift.endTime}
              </p>

              <p className="mt-0.5 text-xs text-muted-foreground">
                {totalAlarms === 0
                  ? "Sin alarmas"
                  : `${enabledAlarms} de ${totalAlarms} alarmas activas`}
              </p>

              {shift.isActive && (
                <p className="mt-2 text-xs font-semibold text-orange-500">
                  Turno activo actualmente
                </p>
              )}
            </div>

            <button
              onClick={handleToggleActive}
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold shadow-sm transition-all",
                shift.isActive
                  ? `${colors.activeBg} scale-105 text-white shadow-md`
                  : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
              )}
              aria-label={shift.isActive ? "Desactivar turno" : "Activar turno"}
            >
              <Power className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-3">
            <div className="flex flex-wrap items-center gap-1">
              <button
                onClick={() => onEdit(shift)}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Editar
              </button>

              <button
                onClick={handleDeleteClick}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors",
                  isFixedShift
                    ? "text-muted-foreground hover:bg-muted"
                    : "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                )}
              >
                {isFixedShift ? (
                  <Lock className="h-3.5 w-3.5" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                {isFixedShift ? "Fijo" : "Eliminar"}
              </button>
            </div>

            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <AlarmClock className="h-3.5 w-3.5" />
              {totalAlarms} alarmas
              {expanded ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "overflow-hidden",
                shift.isActive ? colors.bg : "bg-card"
              )}
            >
              <div className="space-y-3 p-4">
                {alarms.length === 0 ? (
                  <div className="py-6 text-center">
                    <BellOff className="mx-auto mb-2 h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm font-medium text-muted-foreground">
                      Sin alarmas
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      Agrega alarmas para este turno
                    </p>
                  </div>
                ) : (
                  alarms
                    .slice()
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((alarm) => (
                      <AlarmRow
                        key={`${alarm._id}-${alarm.time}`}
                        alarm={alarm}
                        shiftColor={shift.color}
                        shiftActive={shift.isActive}
                      />
                    ))
                )}

                <button
                  onClick={() => setAddAlarmOpen(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-3 text-sm font-semibold text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                >
                  <Plus className="h-4 w-4" />
                  Agregar alarma
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AlarmFormDialog
        open={addAlarmOpen}
        onClose={() => setAddAlarmOpen(false)}
        shiftId={shift._id}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar turno</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Eliminar el turno <strong>{shift.name}</strong>? Se eliminarán
              todas sus alarmas. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar turno
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}