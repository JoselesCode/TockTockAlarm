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
import { DAY_LABELS } from "@/lib/shift-utils.ts";
import { cn } from "@/lib/utils.ts";
import {
  type Alarm,
  type AlarmSoundMode,
  type AlarmVibrationMode,
  type AlarmToneMode,
  useAppState,
} from "@/lib/app-state.tsx";
import {
  playAlarmPreview,
  preloadAlarmTones,
} from "@/lib/alarm-preview";

type Props = {
  open: boolean;
  onClose: () => void;
  shiftId: string;
  editAlarm?: Alarm | null;
};

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

const SOUND_OPTIONS: {
  value: AlarmSoundMode;
  label: string;
  description: string;
}[] = [
  { value: "suave", label: "Suave", description: "Notificación discreta" },
  { value: "normal", label: "Normal", description: "Recordatorio estándar" },
  { value: "fuerte", label: "Fuerte", description: "Máxima prioridad" },
];

const VIBRATION_OPTIONS: {
  value: AlarmVibrationMode;
  label: string;
  description: string;
}[] = [
  { value: "suave", label: "Suave", description: "Vibración corta" },
  { value: "normal", label: "Normal", description: "Vibración estándar" },
  { value: "fuerte", label: "Fuerte", description: "Vibración intensa" },
];

const TONE_OPTIONS: {
  value: AlarmToneMode;
  label: string;
  description: string;
}[] = [
  { value: "alarma01", label: "Alarma 01", description: "Clásico" },
  { value: "alarma02", label: "Alarma 02", description: "Digital" },
  { value: "alarma03", label: "Alarma 03", description: "Intenso" },
];

export default function AlarmFormDialog({
  open,
  onClose,
  shiftId,
  editAlarm,
}: Props) {
  const { createAlarm, updateAlarm } = useAppState();

  const [label, setLabel] = useState("");
  const [hour, setHour] = useState("06");
  const [minute, setMinute] = useState("00");
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [soundMode, setSoundMode] = useState<AlarmSoundMode>("normal");
  const [vibrationMode, setVibrationMode] =
    useState<AlarmVibrationMode>("normal");
  const [toneMode, setToneMode] = useState<AlarmToneMode>("alarma01");

  const time = useMemo(() => `${hour}:${minute}`, [hour, minute]);

  useEffect(() => {
    if (!open) return;

    void preloadAlarmTones();

    if (editAlarm) {
      const [h = "06", m = "00"] = editAlarm.time.split(":");

      setLabel(editAlarm.label);
      setHour(h.padStart(2, "0"));
      setMinute(m.padStart(2, "0"));
      setDays(editAlarm.days);
      setSoundMode(editAlarm.soundMode ?? "normal");
      setVibrationMode(editAlarm.vibrationMode ?? "normal");
      setToneMode(editAlarm.toneMode ?? "alarma01");
      return;
    }

    setLabel("");
    setHour("06");
    setMinute("00");
    setDays([1, 2, 3, 4, 5]);
    setSoundMode("normal");
    setVibrationMode("normal");
    setToneMode("alarma01");
  }, [editAlarm, open]);

  const toggleDay = (d: number) => {
    setDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()
    );
  };

  const handleToneSelect = async (tone: AlarmToneMode) => {
    setToneMode(tone);
    await playAlarmPreview(tone);
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

    if (editAlarm) {
      await updateAlarm(editAlarm._id, {
        label: label.trim(),
        time,
        days,
        soundMode,
        vibrationMode,
        toneMode,
      });

      toast.success("Alarma actualizada");
    } else {
      await createAlarm({
        shiftId,
        label: label.trim(),
        time,
        days,
        soundMode,
        vibrationMode,
        toneMode,
      });

      toast.success("Alarma creada");
    }

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="z-[1200] max-w-md max-h-[82dvh] overflow-y-auto pb-24">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {editAlarm ? "Editar alarma" : "Nueva alarma"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Hora de alarma</Label>

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Hora</Label>
                <select
                  value={hour}
                  onChange={(e) => setHour(e.target.value)}
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
                  value={minute}
                  onChange={(e) => setMinute(e.target.value)}
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
              Hora seleccionada: <strong>{time}</strong>
            </p>
          </div>

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
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Sonido</Label>
            <div className="grid grid-cols-3 gap-2">
              {SOUND_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSoundMode(option.value)}
                  className={cn(
                    "rounded-xl border-2 p-3 text-left transition-all",
                    soundMode === option.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted border-border text-muted-foreground hover:border-primary/40"
                  )}
                >
                  <p className="font-black text-sm">{option.label}</p>
                  <p className="text-[10px] opacity-80">
                    {option.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Vibración</Label>
            <div className="grid grid-cols-3 gap-2">
              {VIBRATION_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setVibrationMode(option.value)}
                  className={cn(
                    "rounded-xl border-2 p-3 text-left transition-all",
                    vibrationMode === option.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted border-border text-muted-foreground hover:border-primary/40"
                  )}
                >
                  <p className="font-black text-sm">{option.label}</p>
                  <p className="text-[10px] opacity-80">
                    {option.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Tono de alarma</Label>

            <div className="grid grid-cols-3 gap-2">
              {TONE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleToneSelect(option.value)}
                  className={cn(
                    "rounded-2xl border-2 p-3 text-left transition-all relative overflow-hidden",
                    toneMode === option.value
                      ? "border-orange-500 bg-orange-500/15 shadow-[0_0_18px_rgba(249,115,22,0.35)]"
                      : "bg-muted border-border text-muted-foreground hover:border-orange-500/40"
                  )}
                >
                  <p
                    className={cn(
                      "font-black text-sm",
                      toneMode === option.value
                        ? "text-orange-400"
                        : "text-foreground"
                    )}
                  >
                    {option.label}
                  </p>

                  <p className="text-[10px] opacity-80">
                    {option.description}
                  </p>

                  {toneMode === option.value && (
                    <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
                  )}
                </button>
              ))}
            </div>

            <div className="rounded-xl bg-muted/40 border border-border p-3">
              <p className="text-xs text-muted-foreground">
                Tono seleccionado:
                <span className="ml-1 font-bold text-orange-400 uppercase">
                  {toneMode}
                </span>
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>

          <Button onClick={handleSubmit} className="font-semibold">
            {editAlarm ? "Guardar cambios" : "Crear alarma"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}