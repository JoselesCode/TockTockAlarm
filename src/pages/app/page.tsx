import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Accessibility,
  AlarmClock,
  Camera,
  ClipboardCheck,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils.ts";
import { useAppState, type Shift } from "@/lib/app-state.tsx";
import AppHeader from "./_components/AppHeader.tsx";
import ActiveShiftBanner from "./_components/ActiveShiftBanner.tsx";
import ShiftCard from "./_components/ShiftCard.tsx";
import ShiftFormDialog from "./_components/ShiftFormDialog.tsx";
import MarcajePage from "./marcaje/index.tsx";
import FaceScanner from "./facescanner.tsx";
import WebAlarmBanner from "@/components/app/WebAlarmBanner";

type Tab = "turnos" | "marcaje" | "reconocimiento";

export default function AppPage() {
  const { shifts, alarms, initDefaultShifts, accessibilitySettings } =
    useAppState();

  const [tab, setTab] = useState<Tab>("turnos");
  const [createOpen, setCreateOpen] = useState(false);
  const [editShift, setEditShift] = useState<Shift | null>(null);
  const [initialized, setInitialized] = useState(false);

  const headerRef = useRef<HTMLDivElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    if (shifts !== undefined && !initialized) {
      setInitialized(true);

      if (shifts.length === 0) {
        initDefaultShifts();
      }
    }
  }, [shifts, initialized, initDefaultShifts]);

  const activeShift = shifts?.find((s) => s.isActive) ?? null;
  const sortedShifts = shifts?.slice().sort((a, b) => a.order - b.order) ?? [];

  const tabs = [
    { id: "turnos", label: "Mis Turnos", Icon: AlarmClock },
    { id: "marcaje", label: "Marcaje", Icon: ClipboardCheck },
    { id: "reconocimiento", label: "Reconocimiento", Icon: Camera },
  ] as const;

  const activeAccessibilityCount = [
    accessibilitySettings.lowVision,
    accessibilitySettings.colorBlind,
    accessibilitySettings.fontSize !== "normal",
    accessibilitySettings.themeMode !== "system",
  ].filter(Boolean).length;
  useEffect(() => {
  const root = document.documentElement;

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  const shouldUseDark =
    accessibilitySettings.themeMode === "dark" ||
    (accessibilitySettings.themeMode === "system" && prefersDark);

  root.classList.toggle("dark", shouldUseDark);
}, [accessibilitySettings.themeMode]);

  useLayoutEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };

    updateHeaderHeight();
    window.addEventListener("resize", updateHeaderHeight);

    return () => {
      window.removeEventListener("resize", updateHeaderHeight);
    };
  }, [activeShift, activeAccessibilityCount, tab, accessibilitySettings.fontSize]);

  return (
    <div
      className={cn(
        "min-h-screen bg-background overflow-x-hidden",
        accessibilitySettings.fontSize === "large" &&
          "text-lg [&_button]:text-base",
        accessibilitySettings.fontSize === "extra" &&
          "text-xl [&_button]:text-lg",
        accessibilitySettings.lowVision && "tt-low-vision",
        accessibilitySettings.colorBlind && "tt-color-blind"
      )}
    >
      <div
        ref={headerRef}
        className="fixed left-0 right-0 top-0 z-[80] bg-background shadow-sm"
      >
        <AppHeader
          activeShift={activeShift}
          activeAccessibilityCount={activeAccessibilityCount}
        />

        <nav className="border-b border-border bg-background/95 backdrop-blur">
          <div className="tt-page">
            <div className="flex gap-1 py-2 overflow-x-auto">
              {tabs.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={cn(
                    "min-w-fit flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all whitespace-nowrap",
                    tab === id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>
      </div>

      <div style={{ height: headerHeight }} />

      {activeAccessibilityCount > 0 && (
        <div className="tt-page pt-4">
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-bold text-primary">
            <Accessibility className="h-4 w-4 shrink-0" />
            <span>
              Accesibilidad activa: {activeAccessibilityCount} ajuste
              {activeAccessibilityCount === 1 ? "" : "s"} aplicado
              {activeAccessibilityCount === 1 ? "" : "s"}.
            </span>
          </div>
        </div>
      )}

      <main className="tt-page py-6 pb-24">
        <AnimatePresence mode="wait">
          {tab === "turnos" && (
            <motion.div
              key="turnos"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="w-full space-y-6"
            >
              {shifts === undefined ? (
                <Skeleton className="h-28 w-full rounded-2xl" />
              ) : (
                <ActiveShiftBanner
                  activeShift={activeShift}
                  totalShifts={sortedShifts.length}
                  activeAlarms={
                    alarms.filter(
                      (a) => a.enabled && a.shiftId === activeShift?._id
                    ).length
                  }
                />
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-black">Mis Turnos</h2>
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {sortedShifts.map((shift) => (
                  <ShiftCard
                    key={`${shift._id}-${shift.name}`}
                    shift={shift}
                    onEdit={(s) => setEditShift(s)}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {tab === "marcaje" && (
            <motion.div
              key="marcaje"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="w-full"
            >
              <MarcajePage />
            </motion.div>
          )}

          {tab === "reconocimiento" && (
            <motion.div
              key="reconocimiento"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="w-full"
            >
              <FaceScanner />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <ShiftFormDialog open={createOpen} onClose={() => setCreateOpen(false)} />

      {editShift && (
        <ShiftFormDialog
          open={!!editShift}
          onClose={() => setEditShift(null)}
          editShift={editShift}
        />
      )}

      <WebAlarmBanner />
    </div>
  );
}