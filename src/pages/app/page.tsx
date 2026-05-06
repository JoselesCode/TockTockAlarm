import { useEffect, useState } from "react";
import { AlarmClock, ClipboardCheck, Plus, Camera } from "lucide-react";
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

// 🔥 NUEVO
import { getAuth } from "firebase/auth";

type Tab = "turnos" | "marcaje" | "reconocimiento";

export default function AppPage() {
  const { shifts, alarms, initDefaultShifts } = useAppState();

  const [tab, setTab] = useState<Tab>("turnos");
  const [createOpen, setCreateOpen] = useState(false);
  const [editShift, setEditShift] = useState<Shift | null>(null);
  const [initialized, setInitialized] = useState(false);

  // 🔥 UID del usuario
  const auth = getAuth();
  const uid = auth.currentUser?.uid || "";

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
    { id: "reconocimiento", label: "Reconocimiento", Icon: Camera }, // 🔥 NUEVO
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader activeShift={activeShift} />

      {/* Tab bar */}
      <nav className="sticky top-[73px] z-20 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex gap-1 py-2">
            {tabs.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all",
                  tab === id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <AnimatePresence mode="wait">

          {/* TURNOS */}
          {tab === "turnos" && (
            <motion.div
              key="turnos"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              {shifts === undefined ? (
                <Skeleton className="h-28 w-full rounded-2xl" />
              ) : (
                <ActiveShiftBanner
                  activeShift={activeShift}
                  totalShifts={sortedShifts.length}
                  activeAlarms={alarms.filter(
                    (a) =>
                      a.enabled &&
                      a.shiftId === activeShift?._id
                  ).length}
                />
              )}

              <div className="flex items-center justify-between">
                <h2 className="font-black text-xl">Mis Turnos</h2>
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {sortedShifts.map((shift) => (
                  <ShiftCard
                    key={shift._id}
                    shift={shift}
                    onEdit={(s) => setEditShift(s)}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* MARCAJE */}
          {tab === "marcaje" && (
            <motion.div
              key="marcaje"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
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
            >
              <FaceScanner uid={uid} />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      <ShiftFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      {editShift && (
        <ShiftFormDialog
          open={!!editShift}
          onClose={() => setEditShift(null)}
          editShift={editShift}
        />
      )}
    </div>
  );
}