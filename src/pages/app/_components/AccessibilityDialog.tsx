import { useEffect, useState } from "react";
import {
  Accessibility,
  Brain,
  Ear,
  Eye,
  Hand,
  Palette,
  Type,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { useAppState } from "@/lib/app-state.tsx";
import type { AccessibilitySettings } from "@/lib/firebase/users";

type Props = {
  open: boolean;
  onClose: () => void;
};

const options = [
  {
    key: "lowVision",
    Icon: Eye,
    title: "Baja visión",
    desc: "Aumenta contraste y mejora lectura.",
  },
  {
    key: "colorBlind",
    Icon: Palette,
    title: "Daltonismo",
    desc: "Usa colores seguros por turno.",
  },
  {
    key: "hearing",
    Icon: Ear,
    title: "Audición reducida",
    desc: "Activa vibración y alerta visual.",
  },
  {
    key: "reducedMotion",
    Icon: Hand,
    title: "Motricidad reducida",
    desc: "Botones grandes y menos pasos.",
  },
  {
    key: "simpleMode",
    Icon: Brain,
    title: "Modo simple",
    desc: "Interfaz más clara y guiada.",
  },
] as const;

export default function AccessibilityDialog({ open, onClose }: Props) {
  const { accessibilitySettings, saveAccessibilitySettings } = useAppState();
  const [draft, setDraft] =
    useState<AccessibilitySettings>(accessibilitySettings);

  useEffect(() => {
    setDraft(accessibilitySettings);
  }, [accessibilitySettings, open]);

  if (!open) return null;

  const toggle = (key: keyof AccessibilitySettings) => {
    setDraft((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const save = async () => {
    await saveAccessibilitySettings(draft);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-lg rounded-3xl bg-background p-5 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <Accessibility className="h-6 w-6 text-primary" />
            </div>

            <div>
              <h2 className="text-xl font-black">Accesibilidad</h2>
              <p className="text-sm text-muted-foreground">
                Ajustes guardados para cada trabajador/a.
              </p>
            </div>
          </div>

          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="mb-5 rounded-2xl border border-border p-4">
          <div className="mb-3 flex items-center gap-2">
            <Type className="h-5 w-5 text-primary" />
            <h3 className="font-black">Tamaño de letra</h3>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={draft.fontSize === "normal" ? "default" : "outline"}
              className="font-bold"
              onClick={() =>
                setDraft((prev) => ({ ...prev, fontSize: "normal" }))
              }
            >
              Normal
            </Button>

            <Button
              variant={draft.fontSize === "large" ? "default" : "outline"}
              className="font-bold text-lg"
              onClick={() =>
                setDraft((prev) => ({ ...prev, fontSize: "large" }))
              }
            >
              Grande
            </Button>

            <Button
              variant={draft.fontSize === "extra" ? "default" : "outline"}
              className="font-bold text-xl"
              onClick={() =>
                setDraft((prev) => ({ ...prev, fontSize: "extra" }))
              }
            >
              Extra
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {options.map(({ key, Icon, title, desc }) => (
            <button
              key={key}
              onClick={() => toggle(key)}
              className="flex w-full items-center justify-between gap-3 rounded-2xl border border-border p-4 text-left transition hover:bg-muted/40"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>

                <div>
                  <p className="font-black">{title}</p>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>

              <div
                className={`flex h-8 w-14 items-center rounded-full p-1 transition ${
                  draft[key] ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`h-6 w-6 rounded-full bg-background shadow transition ${
                    draft[key] ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </div>
            </button>
          ))}
        </div>

        <Button className="mt-5 w-full font-bold" onClick={save}>
          Guardar preferencias
        </Button>
      </div>
    </div>
  );
}