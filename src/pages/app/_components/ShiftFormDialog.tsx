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
import { SHIFT_ICONS, SHIFT_COLORS, ICON_OPTIONS, COLOR_OPTIONS } from "@/lib/shift-utils.ts";
import type { Id } from "@/convex/_generated/dataModel.d.ts";

type Props = {
  open: boolean;
  onClose: () => void;
  editShift?: {
    _id: Id<"shifts">;
    name: string;
    icon: string;
    color: string;
    startTime: string;
    endTime: string;
  } | null;
};

export default function ShiftFormDialog({ open, onClose, editShift }: Props) {
  const createShift = useMutation(api.shifts.create);
  const updateShift = useMutation(api.shifts.update);

  const [name, setName] = useState(editShift?.name ?? "");
  const [icon, setIcon] = useState(editShift?.icon ?? "sun");
  const [color, setColor] = useState(editShift?.color ?? "amber");
  const [startTime, setStartTime] = useState(editShift?.startTime ?? "06:00");
  const [endTime, setEndTime] = useState(editShift?.endTime ?? "14:00");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setName("");
    setIcon("sun");
    setColor("amber");
    setStartTime("06:00");
    setEndTime("14:00");
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Ingresa un nombre para el turno");
      return;
    }
    setLoading(true);
    try {
      if (editShift) {
        await updateShift({ id: editShift._id, name, icon, color, startTime, endTime });
        toast.success("Turno actualizado");
      } else {
        await createShift({ name, icon, color, startTime, endTime });
        toast.success("Turno creado");
      }
      reset();
      onClose();
    } catch {
      toast.error("Error al guardar el turno");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onClose(); } }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editShift ? "Editar turno" : "Nuevo turno"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="shift-name" className="text-sm font-semibold">
              Nombre del turno
            </Label>
            <Input
              id="shift-name"
              placeholder="Ej: Turno Especial"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-base"
            />
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Hora inicio</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="text-base"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Hora fin</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="text-base"
              />
            </div>
          </div>

          {/* Icon */}
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
                    <IconComp className={`w-6 h-6 ${icon === k ? "text-primary" : "text-muted-foreground"}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color */}
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
                    className={`w-10 h-10 rounded-full border-4 transition-all ${c.activeBg} ${
                      color === k ? "border-foreground scale-110" : "border-transparent opacity-70"
                    }`}
                    aria-label={k}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => { reset(); onClose(); }} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="font-semibold">
            {loading ? "Guardando..." : editShift ? "Guardar cambios" : "Crear turno"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
