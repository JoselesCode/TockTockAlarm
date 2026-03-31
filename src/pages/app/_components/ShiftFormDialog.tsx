import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { SHIFT_ICONS, SHIFT_COLORS, ICON_OPTIONS, COLOR_OPTIONS } from "@/lib/shift-utils.ts";
import { useAppState, type Shift } from "@/lib/app-state.tsx";

type Props = {
  open: boolean;
  onClose: () => void;
  editShift?: Shift | null;
};

export default function ShiftFormDialog({ open, onClose, editShift }: Props) {
  const { createShift, updateShift } = useAppState();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("sun");
  const [color, setColor] = useState("amber");
  const [startTime, setStartTime] = useState("06:00");
  const [endTime, setEndTime] = useState("14:00");

  useEffect(() => {
    if (editShift) {
      setName(editShift.name);
      setIcon(editShift.icon);
      setColor(editShift.color);
      setStartTime(editShift.startTime);
      setEndTime(editShift.endTime);
      return;
    }
    setName("");
    setIcon("sun");
    setColor("amber");
    setStartTime("06:00");
    setEndTime("14:00");
  }, [editShift, open]);

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Ingresa un nombre para el turno");
      return;
    }
    if (editShift) {
      updateShift(editShift._id, { name, icon, color, startTime, endTime });
      toast.success("Turno actualizado");
    } else {
      createShift({ name, icon, color, startTime, endTime });
      toast.success("Turno creado");
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editShift ? "Editar turno" : "Nuevo turno"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="shift-name" className="text-sm font-semibold">Nombre del turno</Label>
            <Input id="shift-name" placeholder="Ej: Turno Especial" value={name} onChange={(e) => setName(e.target.value)} className="text-base" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Hora inicio</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="text-base" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Hora fin</Label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="text-base" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Ícono</Label>
            <div className="flex gap-2 flex-wrap">
              {ICON_OPTIONS.map((k) => {
                const IconComp = SHIFT_ICONS[k];
                return (
                  <button key={k} type="button" onClick={() => setIcon(k)} className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all ${icon === k ? "border-primary bg-primary/10" : "border-border bg-muted hover:border-primary/40"}`} aria-label={k}>
                    <IconComp className={`w-6 h-6 ${icon === k ? "text-primary" : "text-muted-foreground"}`} />
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
                  <button key={k} type="button" onClick={() => setColor(k)} className={`w-10 h-10 rounded-full border-4 transition-all ${c.activeBg} ${color === k ? "border-foreground scale-110" : "border-transparent opacity-70"}`} aria-label={k} />
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} className="font-semibold">{editShift ? "Guardar cambios" : "Crear turno"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
