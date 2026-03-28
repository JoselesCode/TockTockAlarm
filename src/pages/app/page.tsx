import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { AlarmClock, ClipboardCheck, Plus } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils.ts";
import type { Doc } from "@/convex/_generated/dataModel.d.ts";
import AppHeader from "./_components/AppHeader.tsx";
import ActiveShiftBanner from "./_components/ActiveShiftBanner.tsx";
import ShiftCard from "./_components/ShiftCard.tsx";
import ShiftFormDialog from "./_components/ShiftFormDialog.tsx";
import MarcajePage from "./marcaje/index.tsx";

type Tab = "turnos" | "marcaje";

export default function AppPage() {
  const shifts = useQuery(api.shifts.getAll, {});
  const initDefaults = useMutation(api.shifts.initDefaultShifts);

  const [tab, setTab] = useState<Tab>("turnos");
  const [createOpen, setCreateOpen] = useState(false);
  const [editShift, setEditShift] = useState<Doc<"shifts"> | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Initialize default shifts on first load
  useEffect(() => {
    if (shifts !== undefined && !initialized) {
      setInitialized(true);
      if (shifts.length === 0) {
        initDefaults().catch(() => {});
      }
    }
  }, [shifts, initialized, initDefaults]);

  const activeShift = shifts?.find((s) => s.isActive) ?? null;
  const sortedShifts = shifts?.slice().sort((a, b) => a.order - b.order) ?? [];

  const tabs: { id: Tab; label: string; Icon: typeof AlarmClock }[] = [
    { id: "turnos", label: "Mis Turnos", Icon: AlarmClock },
    { id: "marcaje", label: "Marcaje", Icon: ClipboardCheck },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader activeShift={activeShift} />

      {/* Tab bar */}
      <nav
        role="tablist"
        aria-label="Secciones de la aplicación"
        className="sticky top-[73px] z-20 bg-background/95 backdrop-blur border-b border-border"
      >
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex gap-1 py-2">
            {tabs.map(({ id, label, Icon }) => (
              <button
                key={id}
                role="tab"
                aria-selected={tab === id}
                aria-controls={`tabpanel-${id}`}
                onClick={() => setTab(id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all",
                  tab === id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main id="main-content" className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <AnimatePresence mode="wait">
          {tab === "turnos" ? (
            <motion.div
              key="turnos"
              id="tabpanel-turnos"
              role="tabpanel"
              aria-labelledby="tab-turnos"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              {/* Active shift banner */}
              {shifts === undefined ? (
                <Skeleton className="h-28 w-full rounded-2xl" />
              ) : (
                <ActiveShiftBanner
                  activeShift={activeShift}
                  totalShifts={sortedShifts.length}
                  activeAlarms={0}
                />
              )}

              {/* Section header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-black text-xl">Mis Turnos</h2>
                  <p className="text-sm text-muted-foreground">
                    {shifts === undefined
                      ? "Cargando..."
                      : `${sortedShifts.length} turno${sortedShifts.length !== 1 ? "s" : ""} configurados`}
                  </p>
                </div>
                <Button
                  onClick={() => setCreateOpen(true)}
                  size="sm"
                  className="gap-1.5 font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  Nuevo turno
                </Button>
              </div>

              {/* Shifts list */}
              {shifts === undefined ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-40 w-full rounded-2xl" />
                  ))}
                </div>
              ) : sortedShifts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16 space-y-3"
                >
                  <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mx-auto">
                    <Plus className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <p className="font-bold text-lg">Configura tus turnos</p>
                  <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                    Crea los turnos que manejas en tu trabajo para organizar tus alarmas.
                  </p>
                  <Button onClick={() => setCreateOpen(true)} className="mt-2 gap-2 font-semibold">
                    <Plus className="w-4 h-4" />
                    Crear primer turno
                  </Button>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {sortedShifts.map((shift, i) => (
                    <motion.div
                      key={shift._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <ShiftCard shift={shift} onEdit={(s) => setEditShift(s)} />
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Tip */}
              {sortedShifts.length > 0 && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm text-primary/80">
                  <strong className="text-primary">Consejo:</strong> Al cambiar de turno, activa el
                  nuevo turno con el boton de encendido. Las alarmas del turno anterior se desactivaran
                  automaticamente.
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="marcaje"
              id="tabpanel-marcaje"
              role="tabpanel"
              aria-labelledby="tab-marcaje"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
            >
              <MarcajePage />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Dialogs */}
      <ShiftFormDialog open={createOpen} onClose={() => setCreateOpen(false)} />
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
