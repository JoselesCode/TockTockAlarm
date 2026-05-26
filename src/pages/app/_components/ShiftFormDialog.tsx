import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import {
  SHIFT_ICONS,
  SHIFT_COLORS,
  ICON_OPTIONS,
  COLOR_OPTIONS,
} from "@/lib/shift-utils.ts";
import { useAppState, type Shift } from "@/lib/app-state.tsx";

type Props = {
  open: boolean;
  onClose: () => void;
  editShift?: Shift | null;
};

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

function splitTime(time: string, fallbackHour = "06", fallbackMinute = "00") {
  const [h = fallbackHour, m = fallbackMinute] = time.split(":");

  return {
    hour: h.padStart(2, "0"),
    minute: m.padStart(2, "0"),
  };
}

export default function ShiftFormDialog({ open, onClose, editShift }: Props) {
  const { createShift, updateShift } = useAppState();

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("sun");
  const [color, setColor] = useState("amber");

  const [startHour, setStartHour] = useState("06");
  const [startMinute, setStartMinute] = useState("00");
  const [endHour, setEndHour] = useState("14");
  const [endMinute, setEndMinute] = useState("00");

  const startTime = useMemo(
    () => `${startHour}:${startMinute}`,
    [startHour, startMinute]
  );

  const endTime = useMemo(
    () => `${endHour}:${endMinute}`,
    [endHour, endMinute]
  );

  useEffect(() => {
    if (editShift) {
      const start = splitTime(editShift.startTime, "06", "00");
      const end = splitTime(editShift.endTime, "14", "00");

      setName(editShift.name);
      setIcon(editShift.icon);
      setColor(editShift.color);

      setStartHour(start.hour);
      setStartMinute(start.minute);
      setEndHour(end.hour);
      setEndMinute(end.minute);

      return;
    }

    setName("");
    setIcon("sun");
    setColor("amber");

    setStartHour("06");
    setStartMinute("00");
    setEndHour("14");
    setEndMinute("00");
  }, [editShift, open]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Ingresa un nombre para el turno");
      return;
    }

    if (editShift) {
      await updateShift(editShift._id, {
        name: name.trim(),
        icon,
        color,
        startTime,
        endTime,
      });

      toast.success("Turno actualizado");
    } else {
      await createShift({
        name: name.trim(),
        icon,
        color,
        startTime,
        endTime,
      });

      toast.success("Turno creado");
    }

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {editShift ? "Editar turno" : "Nuevo turno"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="shift-name" className="text-sm font-semibold">
              Nombre del turno
            </Label>

            <Input
              id="shift-name"
              placeholder="Ej: Turno Mañana, Turno Tarde..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Hora de inicio</Label>

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Hora</Label>
                <select
                  value={startHour}
                  onChange={(e) => setStartHour(e.target.value)}
                  className="w-full h-16 rounded-xl border bg-background text-center text-3xl font-black"
                >
                  {HOURS.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <span className="text-4xl font-black mt-5">:</span>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Minutos</Label>
                <select
                  value={startMinute}
                  onChange={(e) => setStartMinute(e.target.value)}
                  className="w-full h-16 rounded-xl border bg-background text-center text-3xl font-black"
                >
                  {MINUTES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Inicio seleccionado: <strong>{startTime}</strong>
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Hora de término</Label>

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Hora</Label>
                <select
                  value={endHour}
                  onChange={(e) => setEndHour(e.target.value)}
                  className="w-full h-16 rounded-xl border bg-background text-center text-3xl font-black"
                >
                  {HOURS.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <span className="text-4xl font-black mt-5">:</span>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Minutos</Label>
                <select
                  value={endMinute}
                  onChange={(e) => setEndMinute(e.target.value)}
                  className="w-full h-16 rounded-xl border bg-background text-center text-3xl font-black"
                >
                  {MINUTES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Término seleccionado: <strong>{endTime}</strong>
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Ícono</Label>

            <div className="flex gap-2 flex-wrap">
              {ICON_OPTIONS.map((k) => {
                const IconComp = SHIFT_ICONS[k];

                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setIcon(k)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all ${
                      icon === k
                        ? "border-primary bg-primary/10"
                        : "border-border bg-muted hover:border-primary/40"
                    }`}
                    aria-label={k}
                  >
                    <IconComp
                      className={`w-6 h-6 ${
                        icon === k
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Color</Label>

            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map((k) => {
                const c = SHIFT_COLORS[k];

                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setColor(k)}
                    className={`w-10 h-10 rounded-full border-4 transition-all ${
                      c.activeBg
                    } ${
                      color === k
                        ? "border-foreground scale-110"
                        : "border-transparent opacity-70"
                    }`}
                    aria-label={k}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>

          <Button onClick={handleSubmit} className="font-semibold">
            {editShift ? "Guardar cambios" : "Crear turno"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}