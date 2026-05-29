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
        "relative flex h-12 w-28 items-center rounded-full border-2 px-1 transition-all duration-300",
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

  const activeDays = alarm.days
    .slice()
    .sort()
    .map((d) => DAY_LABELS[d])
    .join(", ");

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-4 rounded-2xl p-4 border transition-all",
          isAlarmActive
            ? `${colors.bg} ${colors.border} border shadow-sm`
            : "bg-muted/40 border-border opacity-75"
        )}
      >
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
            isAlarmActive ? colors.activeBg : "bg-muted"
          )}
        >
          {isAlarmActive ? (
            <Bell className="w-5 h-5 text-white" />
          ) : (
            <BellOff className="w-5 h-5 text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-black text-2xl tabular-nums">
              {alarm.time}
            </span>

            {isAlarmActive ? (
              <span className="text-xs font-black px-2 py-1 rounded-full bg-orange-500 text-white">
                ACTIVA
              </span>
            ) : (
              <span className="text-xs font-black px-2 py-1 rounded-full bg-slate-600 text-white/70">
                INACTIVA
              </span>
            )}
          </div>

          <p className="text-base text-muted-foreground truncate">
            {alarm.label}
          </p>

          <p className="text-sm text-muted-foreground/70 mt-1">
            {activeDays}
          </p>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <AlarmPowerSwitch checked={alarm.enabled} onClick={toggleEnabled} />

          <button
            onClick={() => setEditOpen(true)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Editar alarma"
          >
            <Edit2 className="w-5 h-5" />
          </button>

          <button
            onClick={() => setDeleteOpen(true)}
            className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            aria-label="Eliminar alarma"
          >
            <Trash2 className="w-5 h-5" />
          </button>
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
  const { setShiftActive, removeShift, getAlarmsByShift, updateAlarm } = useAppState();
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
    await Promise.all(
      alarms.map((alarm) =>
        updateAlarm(alarm._id, { enabled: true })
      )
    );

    toast.success(`${shift.name} activado con todas sus alarmas`);
    setExpanded(true);
  } else {
    await Promise.all(
      alarms.map((alarm) =>
        updateAlarm(alarm._id, { enabled: false })
      )
    );

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
          "rounded-2xl border-2 overflow-hidden transition-all",
          shift.isActive
            ? `${colors.border} ${colors.bg} shadow-[0_0_22px_rgba(249,115,22,0.18)]`
            : "border-border bg-card shadow-sm"
        )}
      >
        <div className={cn("p-5", shift.isActive ? colors.bg : "bg-card")}>
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm",
                shift.isActive ? colors.activeBg : "bg-muted"
              )}
            >
              <AlarmClock
                className={cn(
                  "w-7 h-7",
                  shift.isActive ? "text-white" : "text-muted-foreground"
                )}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-lg leading-tight">
                  {shift.name}
                </h3>

                {shift.isActive && (
                  <span
                    className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded-full",
                      colors.badge
                    )}
                  >
                    ACTIVO
                  </span>
                )}

                {isFixedShift && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground inline-flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    FIJO
                  </span>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                {shift.startTime} — {shift.endTime}
              </p>

              <p className="text-xs text-muted-foreground mt-0.5">
                {totalAlarms === 0
                  ? "Sin alarmas"
                  : `${enabledAlarms} de ${totalAlarms} alarmas activas`}
              </p>

              {shift.isActive && (
                <p className="text-xs font-semibold mt-2 text-orange-500">
                  Turno actual según rotación semanal
                </p>
              )}
            </div>

            <button
              onClick={handleToggleActive}
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-all font-bold shadow-sm",
                shift.isActive
                  ? `${colors.activeBg} text-white shadow-md scale-105`
                  : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
              )}
              aria-label={shift.isActive ? "Desactivar turno" : "Activar turno"}
            >
              <Power className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(shift)}
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground px-2 py-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Editar
              </button>

              <button
                onClick={handleDeleteClick}
                className={cn(
                  "flex items-center gap-1.5 text-xs font-medium px-2 py-1.5 rounded-lg transition-colors",
                  isFixedShift
                    ? "text-muted-foreground hover:bg-muted"
                    : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                )}
              >
                {isFixedShift ? (
                  <Lock className="w-3.5 h-3.5" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                {isFixedShift ? "Fijo" : "Eliminar"}
              </button>
            </div>

            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground px-2 py-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <AlarmClock className="w-3.5 h-3.5" />
              {totalAlarms} alarmas
              {expanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
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
              <div className="p-4 space-y-3">
                {alarms.length === 0 ? (
                  <div className="text-center py-6">
                    <BellOff className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground font-medium">
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
                        key={alarm._id}
                        alarm={alarm}
                        shiftColor={shift.color}
                        shiftActive={shift.isActive}
                      />
                    ))
                )}

                <button
                  onClick={() => setAddAlarmOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/5 text-sm font-semibold text-muted-foreground hover:text-primary transition-all"
                >
                  <Plus className="w-4 h-4" />
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