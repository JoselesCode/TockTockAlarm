import { useState, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { toast } from "sonner";
import {
  CheckCircle2, Clock, LogIn, LogOut, MapPin, MapPinOff, Navigation,
  AlertTriangle, Loader2, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { usePaginatedQuery } from "convex/react";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import { cn } from "@/lib/utils.ts";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import type { Doc } from "@/convex/_generated/dataModel.d.ts";
import { lazy, Suspense } from "react";

const AttendanceMap = lazy(() => import("./AttendanceMap.tsx"));

type GeoState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; lat: number; lng: number; accuracy: number }
  | { status: "denied" }
  | { status: "unavailable" };

function formatTimestamp(ts: string) {
  const d = new Date(ts);
  return {
    date: d.toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "short" }),
    time: d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", hour12: false }),
    full: d.toLocaleString("es-CL"),
  };
}

function RecordCard({ record }: { record: Doc<"attendance"> }) {
  const removeRecord = useMutation(api.attendance.remove);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const { date, time } = formatTimestamp(record.timestamp);
  const isCheckIn = record.type === "checkin";
  const hasLocation = record.latitude !== undefined && record.longitude !== undefined;

  return (
    <>
      <div
        className={cn(
          "rounded-2xl border p-4 transition-all",
          isCheckIn
            ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
            : "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800"
        )}
      >
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
            isCheckIn ? "bg-green-500" : "bg-rose-500"
          )}>
            {isCheckIn
              ? <LogIn className="w-5 h-5 text-white" />
              : <LogOut className="w-5 h-5 text-white" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn(
                "text-xs font-black px-2 py-0.5 rounded-full",
                isCheckIn ? "bg-green-500 text-white" : "bg-rose-500 text-white"
              )}>
                {isCheckIn ? "ENTRADA" : "SALIDA"}
              </span>
              <span className="text-xs text-muted-foreground capitalize">{date}</span>
            </div>
            <p className="font-black text-2xl tabular-nums mt-1">{time}</p>

            {hasLocation && (
              <button
                onClick={() => setShowMap(!showMap)}
                className={cn(
                  "flex items-center gap-1.5 text-xs font-medium mt-1.5 transition-colors",
                  isCheckIn
                    ? "text-green-700 dark:text-green-400 hover:text-green-900"
                    : "text-rose-700 dark:text-rose-400 hover:text-rose-900"
                )}
              >
                <MapPin className="w-3 h-3" />
                {showMap ? "Ocultar mapa" : "Ver ubicación"}
              </button>
            )}

            {!hasLocation && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5">
                <MapPinOff className="w-3 h-3" />
                Sin ubicación
              </div>
            )}

            {record.note && (
              <p className="text-xs text-muted-foreground mt-1 italic">{record.note}</p>
            )}
          </div>

          <button
            onClick={() => setDeleteOpen(true)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
            aria-label="Eliminar registro"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Map */}
        <AnimatePresence>
          {showMap && hasLocation && record.latitude !== undefined && record.longitude !== undefined && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden mt-3"
            >
              <Suspense fallback={<Skeleton className="h-48 w-full rounded-xl" />}>
                <AttendanceMap
                  lat={record.latitude}
                  lng={record.longitude}
                  label={isCheckIn ? "Entrada" : "Salida"}
                  className="h-48 w-full rounded-xl"
                />
              </Suspense>
              {record.accuracy !== undefined && (
                <p className="text-xs text-muted-foreground mt-1.5 text-center">
                  Precisión: ±{Math.round(record.accuracy)}m
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar registro</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Eliminar este registro de {isCheckIn ? "entrada" : "salida"}? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => { await removeRecord({ id: record._id }); toast.success("Registro eliminado"); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function MarcajePage() {
  const latest = useQuery(api.attendance.getLatest, {});
  const activeShifts = useQuery(api.shifts.getAll, {});
  const recordAttendance = useMutation(api.attendance.record);

  const { results, status, loadMore } = usePaginatedQuery(
    api.attendance.getHistory,
    {},
    { initialNumItems: 10 }
  );

  const [geo, setGeo] = useState<GeoState>({ status: "idle" });
  const [recording, setRecording] = useState(false);

  const activeShift = activeShifts?.find((s) => s.isActive) ?? null;
  const isCheckedIn = latest?.type === "checkin";
  const nextType = isCheckedIn ? "checkout" : "checkin";

  const getLocation = useCallback((): Promise<GeolocationPosition | null> => {
    return new Promise((resolve) => {
      if (!("geolocation" in navigator)) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    });
  }, []);

  const handleRecord = async () => {
    setRecording(true);
    setGeo({ status: "loading" });

    let lat: number | undefined;
    let lng: number | undefined;
    let accuracy: number | undefined;

    if (!("geolocation" in navigator)) {
      setGeo({ status: "unavailable" });
    } else {
      const pos = await getLocation();
      if (pos) {
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
        accuracy = pos.coords.accuracy;
        setGeo({ status: "success", lat, lng, accuracy });
      } else {
        setGeo({ status: "denied" });
      }
    }

    try {
      await recordAttendance({
        type: nextType,
        latitude: lat,
        longitude: lng,
        accuracy,
        shiftId: activeShift?._id,
      });
      toast.success(
        nextType === "checkin"
          ? "Entrada registrada exitosamente"
          : "Salida registrada exitosamente"
      );
    } catch {
      toast.error("Error al registrar el marcaje");
    } finally {
      setRecording(false);
    }
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", hour12: false });
  const dateStr = now.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* Current time */}
      <div className="bg-card border border-border rounded-2xl p-5 text-center">
        <p className="text-6xl font-black tabular-nums tracking-tighter text-foreground">{timeStr}</p>
        <p className="text-muted-foreground capitalize mt-1">{dateStr}</p>
        {activeShift && (
          <div className="mt-3 inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            {activeShift.name} activo
          </div>
        )}
      </div>

      {/* Current status */}
      {latest !== undefined && (
        <div className={cn(
          "rounded-2xl border-2 p-4 flex items-center gap-3",
          isCheckedIn
            ? "bg-green-50 dark:bg-green-950/20 border-green-300 dark:border-green-700"
            : "bg-muted border-border"
        )}>
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
            isCheckedIn ? "bg-green-500" : "bg-muted"
          )}>
            {isCheckedIn
              ? <CheckCircle2 className="w-5 h-5 text-white" />
              : <Clock className="w-5 h-5 text-muted-foreground" />}
          </div>
          <div>
            <p className={cn("font-black text-sm", isCheckedIn ? "text-green-700 dark:text-green-400" : "text-muted-foreground")}>
              {isCheckedIn ? "Actualmente en el trabajo" : "Fuera del trabajo"}
            </p>
            {latest && (
              <p className="text-xs text-muted-foreground">
                Último {latest.type === "checkin" ? "entrada" : "salida"}: {formatTimestamp(latest.timestamp).time} — {formatTimestamp(latest.timestamp).date}
              </p>
            )}
            {!latest && (
              <p className="text-xs text-muted-foreground">Sin registros hoy</p>
            )}
          </div>
        </div>
      )}

      {/* Main action button */}
      <motion.div whileTap={{ scale: 0.97 }}>
        <button
          onClick={handleRecord}
          disabled={recording}
          className={cn(
            "w-full rounded-3xl py-8 flex flex-col items-center justify-center gap-3 transition-all shadow-lg font-black text-xl border-0 outline-none",
            nextType === "checkin"
              ? "bg-green-500 hover:bg-green-600 text-white shadow-green-200 dark:shadow-green-900"
              : "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200 dark:shadow-rose-900"
          )}
          aria-label={nextType === "checkin" ? "Registrar entrada" : "Registrar salida"}
        >
          {recording ? (
            <>
              <Loader2 className="w-12 h-12 animate-spin" />
              <span>{geo.status === "loading" ? "Obteniendo ubicación..." : "Registrando..."}</span>
            </>
          ) : (
            <>
              {nextType === "checkin"
                ? <LogIn className="w-14 h-14" strokeWidth={2} />
                : <LogOut className="w-14 h-14" strokeWidth={2} />}
              <span>{nextType === "checkin" ? "REGISTRAR ENTRADA" : "REGISTRAR SALIDA"}</span>
              <span className="text-sm font-normal opacity-80 flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5" />
                Con geolocalización automática
              </span>
            </>
          )}
        </button>
      </motion.div>

      {/* Geo feedback */}
      <AnimatePresence>
        {geo.status === "denied" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4"
          >
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-yellow-800 dark:text-yellow-400">
                Ubicación no disponible
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-500 mt-0.5">
                El marcaje se registró sin coordenadas. Para activar la ubicación, ve a Configuración del navegador &gt; Permisos &gt; Ubicación.
              </p>
            </div>
          </motion.div>
        )}
        {geo.status === "success" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl p-3"
          >
            <MapPin className="w-4 h-4 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-700 dark:text-green-400">
              Ubicación registrada · precisión ±{Math.round(geo.accuracy)}m
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History */}
      <div>
        <h3 className="font-black text-lg mb-3">Historial de marcajes</h3>

        {results.length === 0 && status !== "LoadingFirstPage" ? (
          <div className="text-center py-10 space-y-2">
            <Clock className="w-12 h-12 text-muted-foreground/40 mx-auto" />
            <p className="font-semibold text-muted-foreground">Sin registros aún</p>
            <p className="text-sm text-muted-foreground/70">
              Tu historial de entradas y salidas aparecerá aquí.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {status === "LoadingFirstPage"
              ? [1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)
              : results.map((r) => <RecordCard key={r._id} record={r} />)
            }

            {status === "CanLoadMore" && (
              <Button
                variant="secondary"
                className="w-full font-semibold"
                onClick={() => loadMore(10)}
              >
                Ver más registros
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
