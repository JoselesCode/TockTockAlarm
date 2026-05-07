import * as faceapi from "face-api.js";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteField,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

let modelsLoaded = false;
const DESCRIPTOR_LENGTH = 128;

export async function loadModels() {
  if (modelsLoaded) return;

  const MODEL_URL =
  "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights";

  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);

  modelsLoaded = true;
}

export async function captureImage(video: HTMLVideoElement): Promise<string> {
  if (!video || video.readyState < 2) {
    throw new Error("La cámara no está lista");
  }

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No se pudo capturar la imagen");
  }

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL("image/jpeg", 0.95);
}

function validateDescriptor(descriptor: unknown): number[] | null {
  if (!Array.isArray(descriptor)) return null;

  const clean = descriptor
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));

  if (clean.length !== DESCRIPTOR_LENGTH) {
    return null;
  }

  return clean;
}

export async function getFaceDescriptor(imageSrc: string): Promise<number[]> {
  await loadModels();

  const img = await faceapi.fetchImage(imageSrc);

  const detection = await faceapi
    .detectSingleFace(
      img,
      new faceapi.TinyFaceDetectorOptions({
        inputSize: 416,
        scoreThreshold: 0.4,
      })
    )
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) {
    throw new Error("No se detectó rostro. Centra tu cara y mejora la iluminación.");
  }

  const descriptor = Array.from(detection.descriptor);

  if (descriptor.length !== DESCRIPTOR_LENGTH) {
    throw new Error(`Descriptor inválido generado: ${descriptor.length} valores`);
  }

  return descriptor;
}

export async function saveFaceDescriptor(uid: string, descriptor: number[]) {
  if (!uid) throw new Error("Usuario no autenticado");

  const cleanDescriptor = validateDescriptor(descriptor);

  if (!cleanDescriptor) {
    throw new Error("Descriptor facial inválido. Intenta registrar nuevamente.");
  }

  const ref = doc(db, "users", uid);

  await setDoc(
    ref,
    {
      faceDescriptor: cleanDescriptor,
      faceDescriptorVersion: "face-api-tiny-128",
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function getStoredDescriptor(uid: string) {
  if (!uid) return null;

  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  const descriptor = validateDescriptor(snap.data().faceDescriptor);

  if (!descriptor) {
    await updateDoc(ref, {
      faceDescriptor: deleteField(),
      faceDescriptorVersion: deleteField(),
      updatedAt: serverTimestamp(),
    });

    return null;
  }

  return descriptor;
}

export function compareFaces(d1: number[], d2: number[]) {
  const cleanD1 = validateDescriptor(d1);
  const cleanD2 = validateDescriptor(d2);

  if (!cleanD1 || !cleanD2) {
    throw new Error("Descriptor facial inválido. Registra nuevamente el rostro.");
  }

  const distance = faceapi.euclideanDistance(cleanD1, cleanD2);

  console.log("DISTANCIA:", distance);

  return distance < 0.55;
}