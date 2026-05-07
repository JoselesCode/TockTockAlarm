import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  captureImage,
  getFaceDescriptor,
  saveFaceDescriptor,
  getStoredDescriptor,
  compareFaces,
} from "@/lib/firebase/face";

const FaceScanner: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const uid = user?.uid ?? "";

  const videoRef = useRef<HTMLVideoElement>(null);

  const [status, setStatus] = useState("Iniciando cámara...");
  const [loading, setLoading] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [faceRegistered, setFaceRegistered] = useState(false);

  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (!isLoading) {
      checkExistingFace();
    }
  }, [uid, isLoading]);

  const checkExistingFace = async () => {
    if (isLoading) {
      setStatus("Cargando usuario...");
      return;
    }

    if (!isAuthenticated || !uid) {
      setStatus("❌ Usuario no autenticado");
      setFaceRegistered(false);
      return;
    }

    try {
      const stored = await getStoredDescriptor(uid);

      if (stored) {
        setFaceRegistered(true);
        setStatus("✅ Ya tienes un rostro registrado");
      } else {
        setFaceRegistered(false);
        setStatus("No tienes rostro registrado");
      }
    } catch (error) {
      console.error("Error revisando rostro:", error);
      setStatus("❌ Error al revisar el rostro registrado");
    }
  };

  const startCamera = async () => {
    try {
      setStatus("Solicitando permiso de cámara...");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = async () => {
          await videoRef.current?.play();
          setCameraReady(true);
          setStatus("📷 Cámara activa");
        };
      }
    } catch (error) {
      console.error("Error cámara:", error);
      setCameraReady(false);
      setStatus("❌ No se pudo acceder a la cámara");
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
  };

  const handleRegister = async () => {
    try {
      setLoading(true);

      if (!isAuthenticated || !uid) {
        throw new Error("Usuario no autenticado");
      }

      if (!cameraReady || !videoRef.current) {
        throw new Error("La cámara no está lista");
      }

      const existing = await getStoredDescriptor(uid);

      if (existing) {
        setFaceRegistered(true);
        throw new Error("Ya tienes un rostro registrado");
      }

      setStatus("📸 Capturando rostro...");

      const image = await captureImage(videoRef.current);
      const descriptor = await getFaceDescriptor(image);

      await saveFaceDescriptor(uid, descriptor);

      setFaceRegistered(true);
      setStatus("✅ Rostro registrado correctamente");
    } catch (error: any) {
      console.error("Error registrando rostro:", error);
      setStatus(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      setLoading(true);

      if (!isAuthenticated || !uid) {
        throw new Error("Usuario no autenticado");
      }

      if (!cameraReady || !videoRef.current) {
        throw new Error("La cámara no está lista");
      }

      setStatus("🔍 Verificando rostro...");

      const stored = await getStoredDescriptor(uid);

      if (!stored) {
        setFaceRegistered(false);
        throw new Error("No hay rostro registrado");
      }

      const image = await captureImage(videoRef.current);
      const newDescriptor = await getFaceDescriptor(image);

      const match = compareFaces(stored, newDescriptor);

      if (match) {
        setStatus("✅ Rostro coincide");
      } else {
        setStatus("❌ Rostro no coincide");
      }
    } catch (error: any) {
      console.error("Error verificando rostro:", error);
      setStatus(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-xl font-bold">Registro Facial</h2>

      <div className="flex items-center gap-2 text-sm">
        <span
          className={`w-3 h-3 rounded-full ${
            cameraReady ? "bg-green-500" : "bg-red-500"
          }`}
        />
        <span>{cameraReady ? "Cámara activa" : "Cámara apagada"}</span>
      </div>

      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full max-w-sm rounded-xl border bg-black"
      />

      <div className="flex gap-2">
        <Button
          onClick={handleRegister}
          disabled={loading || isLoading || !cameraReady || faceRegistered}
        >
          {loading ? "Procesando..." : "Registrar Rostro"}
        </Button>

        <Button
          onClick={handleVerify}
          disabled={loading || isLoading || !cameraReady || !faceRegistered}
          variant="secondary"
        >
          Verificar
        </Button>
      </div>

      <p className="text-sm text-muted-foreground text-center">{status}</p>
    </div>
  );
};

export default FaceScanner;