import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { DAY_LABELS } from "@/lib/shift-utils.ts";
import { cn } from "@/lib/utils.ts";
import { type Alarm, useAppState } from "@/lib/app-state.tsx";

type Props = {
  open: boolean;
  onClose: () => void;
  shiftId: string;
  editAlarm?: Alarm | null;
};

export default function AlarmFormDialog({ open, onClose, shiftId, editAlarm }: Props) {
  const { createAlarm, updateAlarm } = useAppState();
  const [label, setLabel] = useState("");
  const [time, setTime] = useState("06:00");
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5]);

  useEffect(() => {
    if (editAlarm) {
      setLabel(editAlarm.label);
      setTime(editAlarm.time);
      setDays(editAlarm.days);
      return;
    }
    setLabel("");
    setTime("06:00");
    setDays([1, 2, 3, 4, 5]);
  }, [editAlarm, open]);

  const toggleDay = (d: number) => {
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()));
  };

  const handleSubmit = () => {
    if (!label.trim()) {
      toast.error("Ingresa una etiqueta para la alarma");
      return;
    }
    if (days.length === 0) {
      toast.error("Selecciona al menos un día");
      return;
    }

    if (editAlarm) {
      updateAlarm(editAlarm._id, { label, time, days });
      toast.success("Alarma actualizada");
    } else {
      createAlarm({ shiftId, label, time, days });
      toast.success("Alarma creada");
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{editAlarm ? "Editar alarma" : "Nueva alarma"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="alarm-time" className="text-sm font-semibold">Hora de alarma</Label>
            <Input id="alarm-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} className="text-3xl font-black h-16 text-center tracking-widest" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="alarm-label" className="text-sm font-semibold">Etiqueta</Label>
            <Input id="alarm-label" placeholder="Ej: Despertar, Prepararse, Salir..." value={label} onChange={(e) => setLabel(e.target.value)} className="text-base" />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Días activos</Label>
            <div className="flex gap-2 flex-wrap">
              {DAY_LABELS.map((d, i) => (
                <button key={d} type="button" onClick={() => toggleDay(i)} className={cn("w-11 h-11 rounded-xl text-sm font-bold border-2 transition-all", days.includes(i) ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border hover:border-primary/40")} aria-label={d} aria-pressed={days.includes(i)}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} className="font-semibold">{editAlarm ? "Guardar cambios" : "Crear alarma"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
