import { useState } from "react";
import { toast } from "sonner";
import {
  AlarmClock, Bell, BellOff, ChevronDown, ChevronUp, Edit2, Plus, Power, Trash2,
} from "lucide-react";
import { Switch } from "@/components/ui/switch.tsx";
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

function AlarmRow({ alarm, shiftColor, shiftActive }: { alarm: Alarm; shiftColor: string; shiftActive: boolean }) {
  const { updateAlarm, removeAlarm } = useAppState();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const colors = SHIFT_COLORS[shiftColor] ?? SHIFT_COLORS["amber"];

  const toggleEnabled = () => {
    updateAlarm(alarm._id, { enabled: !alarm.enabled });
  };

  const handleDelete = () => {
    removeAlarm(alarm._id);
    toast.success("Alarma eliminada");
  };

  const activeDays = alarm.days.sort().map((d) => DAY_LABELS[d]).join(", ");

  return (
    <>
      <div className={cn("flex items-center gap-3 rounded-xl p-3 border transition-all", alarm.enabled && shiftActive ? `${colors.bg} ${colors.border} border` : "bg-muted/40 border-border")}>
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", alarm.enabled && shiftActive ? colors.activeBg : "bg-muted")}>
          {alarm.enabled && shiftActive ? <Bell className="w-4 h-4 text-white" /> : <BellOff className="w-4 h-4 text-muted-foreground" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-black text-lg tabular-nums">{alarm.time}</span>
            {alarm.enabled && shiftActive && <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", colors.badge)}>ACTIVA</span>}
          </div>
          <p className="text-sm text-muted-foreground truncate">{alarm.label}</p>
          <p className="text-xs text-muted-foreground/70 mt-0.5">{activeDays}</p>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Switch checked={alarm.enabled} onCheckedChange={toggleEnabled} aria-label={`${alarm.enabled ? "Desactivar" : "Activar"} alarma ${alarm.label}`} />
          <button onClick={() => setEditOpen(true)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" aria-label="Editar alarma">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setDeleteOpen(true)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" aria-label="Eliminar alarma">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <AlarmFormDialog open={editOpen} onClose={() => setEditOpen(false)} shiftId={alarm.shiftId} editAlarm={alarm} />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar alarma</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Eliminar la alarma de las <strong>{alarm.time}</strong> — {alarm.label}? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Eliminar</AlertDialogAction>
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

  const handleToggleActive = () => {
    setShiftActive(shift._id, !shift.isActive);
    if (!shift.isActive) {
      toast.success(`${shift.name} activado`);
      setExpanded(true);
    } else {
      toast(`${shift.name} desactivado`);
    }
  };

  const handleDelete = () => {
    removeShift(shift._id);
    toast.success("Turno eliminado");
  };

  return (
    <>
      <div className={cn("rounded-2xl border-2 overflow-hidden transition-all", shift.isActive ? `${colors.border} shadow-lg` : "border-border shadow-sm")}>
        <div className={cn("p-5", shift.isActive ? `${colors.bg}` : "bg-card")}>
          <div className="flex items-center gap-4">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm", shift.isActive ? colors.activeBg : "bg-muted")}>
              <AlarmClock className={cn("w-7 h-7", shift.isActive ? "text-white" : "text-muted-foreground")} strokeWidth={2} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-lg leading-tight">{shift.name}</h3>
                {shift.isActive && <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", colors.badge)}>ACTIVO</span>}
              </div>
              <p className="text-sm text-muted-foreground">{shift.startTime} — {shift.endTime}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{totalAlarms === 0 ? "Sin alarmas" : `${enabledAlarms} de ${totalAlarms} alarmas activas`}</p>
            </div>

            <div className="flex-shrink-0">
              <button onClick={handleToggleActive} className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-all font-bold shadow-sm", shift.isActive ? `${colors.activeBg} text-white shadow-md scale-105` : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary")} aria-label={shift.isActive ? "Desactivar turno" : "Activar turno"}>
                <Power className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
            <div className="flex items-center gap-1">
              <button onClick={() => onEdit(shift)} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground px-2 py-1.5 rounded-lg hover:bg-muted transition-colors"><Edit2 className="w-3.5 h-3.5" />Editar</button>
              <button onClick={() => setDeleteOpen(true)} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-destructive px-2 py-1.5 rounded-lg hover:bg-destructive/10 transition-colors"><Trash2 className="w-3.5 h-3.5" />Eliminar</button>
            </div>
            <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground px-2 py-1.5 rounded-lg hover:bg-muted transition-colors"><AlarmClock className="w-3.5 h-3.5" />{totalAlarms} alarmas{expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}</button>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden bg-card">
              <div className="p-4 space-y-2.5">
                {alarms.length === 0 ? (
                  <div className="text-center py-6">
                    <BellOff className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground font-medium">Sin alarmas</p>
                    <p className="text-xs text-muted-foreground/70">Agrega alarmas para este turno</p>
                  </div>
                ) : (
                  alarms.slice().sort((a, b) => a.time.localeCompare(b.time)).map((alarm) => (
                    <AlarmRow key={alarm._id} alarm={alarm} shiftColor={shift.color} shiftActive={shift.isActive} />
                  ))
                )}

                <button onClick={() => setAddAlarmOpen(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/5 text-sm font-semibold text-muted-foreground hover:text-primary transition-all">
                  <Plus className="w-4 h-4" />
                  Agregar alarma
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AlarmFormDialog open={addAlarmOpen} onClose={() => setAddAlarmOpen(false)} shiftId={shift._id} />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar turno</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Eliminar el turno <strong>{shift.name}</strong>? Se eliminarán todas sus alarmas. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Eliminar turno</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
