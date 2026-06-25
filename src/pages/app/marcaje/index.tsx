import { useCallback, useMemo, useState, lazy, Suspense, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { toast } from "sonner";
import {
  CheckCircle2,
  Clock,
  LogIn,
  LogOut,
  MapPin,
  MapPinOff,
  Navigation,
  AlertTriangle,
  Loader2,
  Trash2,
} from "lucide-react";
import { Geolocation } from "@capacitor/geolocation";
import { Button } from "@/components/ui/button.tsx";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import { cn } from "@/lib/utils.ts";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { type AttendanceRecord, useAppState } from "@/lib/app-state.tsx";
import { isInsideGeofence } from "@/lib/firebase/locationDefining";
import { useAuth } from "@/hooks/use-auth";
import {
  captureImage,
  getFaceDescriptor,
  getStoredDescriptor,
  compareFaces,
} from "@/lib/firebase/face";

const officeGeofence = {
  id: "duoc",
  name: "Duoc Sede San Joaquin",
  latitude: -33.500618,
  longitude: -70.616733,
  radius: 100,
};

const AttendanceMap = lazy(() => import("./AttendanceMap.tsx"));

type GeoState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; lat: number; lng: number; accuracy: number }
  | { status: "denied" }
  | { status: "unavailable" };

type RecordStep = "idle" | "location" | "face" | "saving";

function formatTimestamp(ts: string) {
  const d = new Date(ts);

  return {
    date: d.toLocaleDateString("es-CL", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }),
    time: d.toLocaleTimeString("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  };
}

function RecordCard({ record }: { record: AttendanceRecord }) {
  const { removeAttendance } = useAppState();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const { date, time } = formatTimestamp(record.timestamp);
  const isCheckIn = record.type === "checkin";

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
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
              isCheckIn ? "bg-green-500" : "bg-rose-500"
            )}
          >
            {isCheckIn ? (
              <LogIn className="w-5 h-5 text-white" />
            ) : (
              <LogOut className="w-5 h-5 text-white" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  "text-xs font-black px-2 py-0.5 rounded-full",
                  isCheckIn
                    ? "bg-green-500 text-white"
                    : "bg-rose-500 text-white"
                )}
              >
                {isCheckIn ? "ENTRADA" : "SALIDA"}
              </span>

              <span className="text-xs text-muted-foreground capitalize">
                {date}
              </span>
            </div>

            <p className="font-black text-2xl tabular-nums mt-1">{time}</p>

            {record.latitude != null && record.longitude != null ? (
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
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5">
                <MapPinOff className="w-3 h-3" />
                Sin ubicación
              </div>
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

        <AnimatePresence>
          {showMap && record.latitude != null && record.longitude != null && (
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

              {record.accuracy != null && (
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
              ¿Eliminar este registro de {isCheckIn ? "entrada" : "salida"}?
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                removeAttendance(record._id);
                toast.success("Registro eliminado");
              }}
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
  const { user, isAuthenticated, isLoading } = useAuth();
  const uid = user?.uid ?? "";

  const { shifts, attendance, recordAttendance } = useAppState();

  const latest = attendance[0] ?? null;
  const activeShift = shifts.find((s) => s.isActive) ?? null;
  const isCheckedIn = latest?.type === "checkin";
  const nextType = isCheckedIn ? "checkout" : "checkin";

  const [geo, setGeo] = useState<GeoState>({ status: "idle" });
  const [recording, setRecording] = useState(false);
  const [recordStep, setRecordStep] = useState<RecordStep>("idle");
  const [showCamera, setShowCamera] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);

  const videoRef = useRef<HTMLVideoElement>(null);

  const results = useMemo(
    () => attendance.slice(0, visibleCount),
    [attendance, visibleCount]
  );

  const getLocation = useCallback(async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        const permission = await Geolocation.requestPermissions();

        if (
          permission.location !== "granted" &&
          permission.coarseLocation !== "granted"
        ) {
          setGeo({ status: "denied" });
          return null;
        }

        const pos = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });

        return {
          coords: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy ?? 0,
          },
        };
      }

      return await new Promise<GeolocationPosition | null>((resolve) => {
        if (!navigator.geolocation) {
          setGeo({ status: "unavailable" });
          resolve(null);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => resolve(position),
          (error) => {
            console.error("Error obteniendo ubicación web:", error);
            setGeo({ status: "denied" });
            resolve(null);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      });
    } catch (error) {
      console.error("Error obteniendo ubicación:", error);
      setGeo({ status: "denied" });
      return null;
    }
  }, []);

  const startCamera = async () => {
    try {
      setShowCamera(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      if (!videoRef.current) {
        throw new Error("No se encontró el elemento de video");
      }

      videoRef.current.srcObject = stream;

      await new Promise<void>((resolve) => {
        if (!videoRef.current) return resolve();

        videoRef.current.onloadedmetadata = async () => {
          await videoRef.current?.play();
          setCameraReady(true);
          resolve();
        };
      });
    } catch (error) {
      console.error("Error cámara:", error);
      setCameraReady(false);
      setShowCamera(false);
      toast.error("No se pudo acceder a la cámara");
      throw error;
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream | null;

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraReady(false);
    setShowCamera(false);
  };

  const handleRecord = async () => {
    setRecording(true);
    setRecordStep("location");

    try {
      if (isLoading) {
        toast.error("Cargando usuario, intenta nuevamente");
        return;
      }

      if (!isAuthenticated || !uid) {
        toast.error("Usuario no autenticado");
        return;
      }

      setGeo({ status: "loading" });

      const pos = await getLocation();

      if (!pos) {
        toast.error("No se pudo obtener tu ubicación");
        setGeo({ status: "denied" });
        return;
      }

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const accuracy = pos.coords.accuracy ?? null;

      const inside = isInsideGeofence(lat, lng, officeGeofence);

      if (!inside) {
        toast.error("No puedes marcar: estás fuera de la ubicación permitida");
        setGeo({ status: "denied" });
        return;
      }

      setGeo({
        status: "success",
        lat,
        lng,
        accuracy: accuracy ?? 0,
      });

      const stored = await getStoredDescriptor(uid);

      if (!stored) {
        toast.error("No tienes rostro registrado");
        return;
      }

      setRecordStep("face");
      await startCamera();

      await new Promise((resolve) => setTimeout(resolve, 1200));

      if (!videoRef.current) {
        toast.error("La cámara no está lista");
        return;
      }

      const image = await captureImage(videoRef.current);
      const newDescriptor = await getFaceDescriptor(image);

      const match = compareFaces(stored, newDescriptor);

      if (!match) {
        toast.error("Rostro no coincide");
        return;
      }

      setRecordStep("saving");

      await recordAttendance({
        type: nextType,
        latitude: lat,
        longitude: lng,
        accuracy,
        shiftId: activeShift?._id ?? null,
        insideGeofence: inside,
        geofenceId: officeGeofence.id,
        geofenceName: officeGeofence.name,
        faceVerificationStatus: "verified",
        markStatus: "approved",
      });

      toast.success(
        nextType === "checkin"
          ? "Entrada registrada correctamente"
          : "Salida registrada correctamente"
      );
    } catch (error) {
      console.error("Error en el marcaje:", error);
      toast.error("Error en el marcaje");
    } finally {
      stopCamera();
      setRecording(false);
      setRecordStep("idle");
    }
  };

  const now = new Date();

  const timeStr = now.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const dateStr = now.toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-2xl p-5 text-center">
        <p className="text-6xl font-black tabular-nums tracking-tighter text-foreground">
          {timeStr}
        </p>

        <p className="text-muted-foreground capitalize mt-1">{dateStr}</p>

        {activeShift && (
          <div className="mt-3 inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            {activeShift.name} activo
          </div>
        )}
      </div>

      <div
        className={cn(
          "rounded-2xl border-2 p-4 flex items-center gap-3",
          isCheckedIn
            ? "bg-green-50 dark:bg-green-950/20 border-green-300 dark:border-green-700"
            : "bg-muted border-border"
        )}
      >
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
            isCheckedIn ? "bg-green-500" : "bg-muted"
          )}
        >
          {isCheckedIn ? (
            <CheckCircle2 className="w-5 h-5 text-white" />
          ) : (
            <Clock className="w-5 h-5 text-muted-foreground" />
          )}
        </div>

        <div>
          <p
            className={cn(
              "font-black text-sm",
              isCheckedIn
                ? "text-green-700 dark:text-green-400"
                : "text-muted-foreground"
            )}
          >
            {isCheckedIn ? "Actualmente en el trabajo" : "Fuera del trabajo"}
          </p>

          {latest ? (
            <p className="text-xs text-muted-foreground">
              Último {latest.type === "checkin" ? "entrada" : "salida"}:{" "}
              {formatTimestamp(latest.timestamp).time} —{" "}
              {formatTimestamp(latest.timestamp).date}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Sin registros hoy</p>
          )}
        </div>
      </div>

      {geo.status === "success" && !showCamera && (
        <div className="w-full h-56 rounded-2xl overflow-hidden border">
          <Suspense fallback={<Skeleton className="h-full w-full" />}>
            <AttendanceMap
              lat={geo.lat}
              lng={geo.lng}
              label="Ubicación actual"
              className="h-full w-full"
            />
          </Suspense>
        </div>
      )}

      {recording && (
        <div className="rounded-2xl border bg-card p-4 space-y-3">
          <p className="font-black text-sm text-center">Proceso de marcaje</p>

          <div className="grid grid-cols-3 gap-2 text-xs font-bold text-center">
            <div
              className={cn(
                "rounded-xl p-2 border",
                recordStep === "location"
                  ? "bg-orange-100 border-orange-300 text-orange-700"
                  : recordStep === "face" || recordStep === "saving"
                    ? "bg-green-100 border-green-300 text-green-700"
                    : "bg-muted"
              )}
            >
              📍 Ubicación
            </div>

            <div
              className={cn(
                "rounded-xl p-2 border",
                recordStep === "face"
                  ? "bg-orange-100 border-orange-300 text-orange-700"
                  : recordStep === "saving"
                    ? "bg-green-100 border-green-300 text-green-700"
                    : "bg-muted"
              )}
            >
              😀 Rostro
            </div>

            <div
              className={cn(
                "rounded-xl p-2 border",
                recordStep === "saving"
                  ? "bg-orange-100 border-orange-300 text-orange-700"
                  : "bg-muted"
              )}
            >
              ☁️ Guardando
            </div>
          </div>
        </div>
      )}

      <motion.div whileTap={{ scale: 0.97 }}>
        <AnimatePresence>
          {showCamera && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            >
              <div className="bg-background rounded-3xl p-4 w-full max-w-md space-y-4">
                <h2 className="text-xl font-black text-center">
                  Verificación Facial
                </h2>

                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full rounded-2xl border bg-black"
                />

                <p className="text-center text-sm text-muted-foreground">
                  {cameraReady
                    ? "Mira a la cámara para validar tu identidad"
                    : "Iniciando cámara..."}
                </p>

                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => {
                    stopCamera();
                    setRecording(false);
                    setRecordStep("idle");
                    toast.info("Verificación cancelada");
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handleRecord}
          disabled={recording}
          className={cn(
            "w-full rounded-3xl py-8 flex flex-col items-center justify-center gap-3 transition-all shadow-lg font-black text-xl border-0 outline-none",
            nextType === "checkin"
              ? "bg-green-500 hover:bg-green-600 text-white shadow-green-200 dark:shadow-green-900"
              : "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200 dark:shadow-rose-900"
          )}
        >
          {recording ? (
            <>
              <Loader2 className="w-12 h-12 animate-spin" />
              <span>
                {recordStep === "location" && "Validando ubicación..."}
                {recordStep === "face" && "Verificando rostro..."}
                {recordStep === "saving" && "Guardando marcaje..."}
                {recordStep === "idle" && "Registrando..."}
              </span>
            </>
          ) : (
            <>
              {nextType === "checkin" ? (
                <LogIn className="w-14 h-14" strokeWidth={2} />
              ) : (
                <LogOut className="w-14 h-14" strokeWidth={2} />
              )}

              <span>
                {nextType === "checkin"
                  ? "REGISTRAR ENTRADA"
                  : "REGISTRAR SALIDA"}
              </span>

              <span className="text-sm font-normal opacity-80 flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5" />
                Ubicación + reconocimiento facial
              </span>
            </>
          )}
        </button>
      </motion.div>

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
                No se pudo validar tu ubicación para realizar el marcaje.
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
              Ubicación validada · precisión ±{Math.round(geo.accuracy)}m
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <h3 className="font-black text-lg mb-3">Historial de marcajes</h3>

        {results.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <Clock className="w-12 h-12 text-muted-foreground/40 mx-auto" />
            <p className="font-semibold text-muted-foreground">
              Sin registros aún
            </p>
            <p className="text-sm text-muted-foreground/70">
              Tu historial de entradas y salidas aparecerá aquí.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((r) => (
              <RecordCard key={r._id} record={r} />
            ))}

            {attendance.length > results.length && (
              <Button
                variant="secondary"
                className="w-full font-semibold"
                onClick={() => setVisibleCount((n) => n + 10)}
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