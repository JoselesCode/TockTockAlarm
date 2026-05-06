// Shift icon and color helpers
import { Moon, Sun, Sunset, Briefcase, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const SHIFT_ICONS: Record<string, LucideIcon> = {
  sun: Sun,
  sunset: Sunset,
  moon: Moon,
  briefcase: Briefcase,
  star: Star,
};

export const SHIFT_COLORS: Record<
  string,
  { bg: string; text: string; border: string; activeBg: string; badge: string; dot: string }
> = {
  amber: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-300 dark:border-amber-700",
    activeBg: "bg-amber-500",
    badge: "bg-amber-500 text-white",
    dot: "bg-amber-500",
  },
  orange: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-700 dark:text-orange-400",
    border: "border-orange-300 dark:border-orange-700",
    activeBg: "bg-orange-500",
    badge: "bg-orange-500 text-white",
    dot: "bg-orange-500",
  },
  indigo: {
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
    text: "text-indigo-700 dark:text-indigo-400",
    border: "border-indigo-300 dark:border-indigo-700",
    activeBg: "bg-indigo-600",
    badge: "bg-indigo-600 text-white",
    dot: "bg-indigo-600",
  },
  teal: {
    bg: "bg-teal-100 dark:bg-teal-900/30",
    text: "text-teal-700 dark:text-teal-400",
    border: "border-teal-300 dark:border-teal-700",
    activeBg: "bg-teal-500",
    badge: "bg-teal-500 text-white",
    dot: "bg-teal-500",
  },
  rose: {
    bg: "bg-rose-100 dark:bg-rose-900/30",
    text: "text-rose-700 dark:text-rose-400",
    border: "border-rose-300 dark:border-rose-700",
    activeBg: "bg-rose-500",
    badge: "bg-rose-500 text-white",
    dot: "bg-rose-500",
  },
  green: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-400",
    border: "border-green-300 dark:border-green-700",
    activeBg: "bg-green-500",
    badge: "bg-green-500 text-white",
    dot: "bg-green-500",
  },
};

export const DAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
export const DAY_LABELS_FULL = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export const ICON_OPTIONS = Object.keys(SHIFT_ICONS);
export const COLOR_OPTIONS = Object.keys(SHIFT_COLORS);
