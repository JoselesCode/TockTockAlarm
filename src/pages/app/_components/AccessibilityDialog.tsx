import { useEffect, useState } from "react";
import {
  Accessibility,
  Eye,
  Monitor,
  Moon,
  Palette,
  Sun,
  Type,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { useAppState } from "@/lib/app-state.tsx";
import type {
  AccessibilitySettings,
  AccessibilityThemeMode,
} from "@/lib/firebase/users";
import { cn } from "@/lib/utils.ts";

type Props = {
  open: boolean;
  onClose: () => void;
};

const themeOptions: {
  value: AccessibilityThemeMode;
  title: string;
  desc: string;
  Icon: typeof Sun;
}[] = [
  {
    value: "system",
    title: "Sistema",
    desc: "Usa el tema del dispositivo.",
    Icon: Monitor,
  },
  {
    value: "light",
    title: "Claro",
    desc: "Interfaz clara para ambientes iluminados.",
    Icon: Sun,
  },
  {
    value: "dark",
    title: "Oscuro",
    desc: "Interfaz oscura para menor fatiga visual.",
    Icon: Moon,
  },
];

export default function AccessibilityDialog({ open, onClose }: Props) {
  const { accessibilitySettings, saveAccessibilitySettings } = useAppState();
  const [draft, setDraft] =
    useState<AccessibilitySettings>(accessibilitySettings);

  useEffect(() => {
    setDraft(accessibilitySettings);
  }, [accessibilitySettings, open]);

  if (!open) return null;

  const save = async () => {
    await saveAccessibilitySettings(draft);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-3xl bg-background p-5 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <Accessibility className="h-6 w-6 text-primary" />
            </div>

            <div>
              <h2 className="text-xl font-black">Accesibilidad</h2>
              <p className="text-sm text-muted-foreground">
                Ajustes visuales guardados para cada trabajador/a.
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

        <div className="mb-5 rounded-2xl border border-border p-4">
          <div className="mb-3 flex items-center gap-2">
            <Sun className="h-5 w-5 text-primary" />
            <h3 className="font-black">Tema de la app</h3>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {themeOptions.map(({ value, title, desc, Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setDraft((prev) => ({ ...prev, themeMode: value }))
                }
                className={cn(
                  "rounded-2xl border-2 p-3 text-left transition",
                  draft.themeMode === value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-muted/40 text-foreground hover:border-primary/40"
                )}
              >
                <Icon className="mb-2 h-5 w-5" />
                <p className="font-black">{title}</p>
                <p className="text-xs opacity-80">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() =>
              setDraft((prev) => ({
                ...prev,
                lowVision: !prev.lowVision,
              }))
            }
            className="flex w-full items-center justify-between gap-3 rounded-2xl border border-border p-4 text-left transition hover:bg-muted/40"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Eye className="h-5 w-5 text-primary" />
              </div>

              <div>
                <p className="font-black">Baja visión</p>
                <p className="text-sm text-muted-foreground">
                  Aumenta contraste, bordes y legibilidad.
                </p>
              </div>
            </div>

            <div
              className={cn(
                "flex h-8 w-14 items-center rounded-full p-1 transition",
                draft.lowVision ? "bg-primary" : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "h-6 w-6 rounded-full bg-background shadow transition",
                  draft.lowVision ? "translate-x-6" : "translate-x-0"
                )}
              />
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              setDraft((prev) => ({
                ...prev,
                colorBlind: !prev.colorBlind,
              }))
            }
            className="flex w-full items-center justify-between gap-3 rounded-2xl border border-border p-4 text-left transition hover:bg-muted/40"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Palette className="h-5 w-5 text-primary" />
              </div>

              <div>
                <p className="font-black">Daltonismo</p>
                <p className="text-sm text-muted-foreground">
                  Usa colores más diferenciados por turno.
                </p>
              </div>
            </div>

            <div
              className={cn(
                "flex h-8 w-14 items-center rounded-full p-1 transition",
                draft.colorBlind ? "bg-primary" : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "h-6 w-6 rounded-full bg-background shadow transition",
                  draft.colorBlind ? "translate-x-6" : "translate-x-0"
                )}
              />
            </div>
          </button>
        </div>

        <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/10 p-4 text-sm text-muted-foreground">
          <p className="text-base font-semibold">
            Las preferencias de accesibilidad se almacenan de forma individual para cada usuario.
          </p>

          <p className="text-sm text-muted-foreground">
            Los ajustes se conservan en la cuenta y se aplican automáticamente en futuros accesos.
          </p>
        </div>

        <Button className="mt-5 w-full font-bold" onClick={save}>
          Guardar preferencias
        </Button>
      </div>
    </div>
  );
}