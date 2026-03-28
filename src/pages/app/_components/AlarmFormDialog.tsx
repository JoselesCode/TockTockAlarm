import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { DAY_LABELS } from "@/lib/shift-utils.ts";
import { cn } from "@/lib/utils.ts";
import type { Id } from "@/convex/_generated/dataModel.d.ts";

type Props = {
  open: boolean;
  onClose: () => void;
  shiftId: Id<"shifts">;
  editAlarm?: {
    _id: Id<"alarms">;
    label: string;
    time: string;
    days: number[];
  } | null;
};

export default function AlarmFormDialog({ open, onClose, shiftId, editAlarm }: Props) {
  const createAlarm = useMutation(api.alarms.create);
  const updateAlarm = useMutation(api.alarms.update);

  const [label, setLabel] = useState(editAlarm?.label ?? "");
  const [time, setTime] = useState(editAlarm?.time ?? "06:00");
  const [days, setDays] = useState<number[]>(editAlarm?.days ?? [1, 2, 3, 4, 5]);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setLabel("");
    setTime("06:00");
    setDays([1, 2, 3, 4, 5]);
  };

  const toggleDay = (d: number) => {
    setDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()
    );
  };

  const handleSubmit = async () => {
    if (!label.trim()) {
      toast.error("Ingresa una etiqueta para la alarma");
      return;
    }
    if (days.length === 0) {
      toast.error("Selecciona al menos un día");
      return;
    }
    setLoading(true);
    try {
      if (editAlarm) {
        await updateAlarm({ id: editAlarm._id, label, time, days });
        toast.success("Alarma actualizada");
      } else {
        await createAlarm({ shiftId, label, time, days });
        toast.success("Alarma creada");
      }
      reset();
      onClose();
    } catch {
      toast.error("Error al guardar la alarma");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onClose(); } }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {editAlarm ? "Editar alarma" : "Nueva alarma"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Time - big and accessible */}
          <div className="space-y-1.5">
            <Label htmlFor="alarm-time" className="text-sm font-semibold">
              Hora de alarma
            </Label>
            <Input
              id="alarm-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="text-3xl font-black h-16 text-center tracking-widest"
            />
          </div>

          {/* Label */}
          <div className="space-y-1.5">
            <Label htmlFor="alarm-label" className="text-sm font-semibold">
              Etiqueta
            </Label>
            <Input
              id="alarm-label"
              placeholder="Ej: Despertar, Prepararse, Salir..."
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="text-base"
            />
          </div>

          {/* Days */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Días activos</Label>
            <div className="flex gap-2 flex-wrap">
              {DAY_LABELS.map((d, i) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDay(i)}
                  className={cn(
                    "w-11 h-11 rounded-xl text-sm font-bold border-2 transition-all",
                    days.includes(i)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border hover:border-primary/40"
                  )}
                  aria-label={d}
                  aria-pressed={days.includes(i)}
                >
                  {d}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {days.length === 7
                ? "Todos los días"
                : days.length === 0
                ? "Ningún día seleccionado"
                : `${days.length} días seleccionados`}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => { reset(); onClose(); }} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="font-semibold">
            {loading ? "Guardando..." : editAlarm ? "Guardar cambios" : "Crear alarma"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
