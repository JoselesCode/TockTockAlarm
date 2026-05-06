import * as faceapi from "face-api.js";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

let modelsLoaded = false;

// 🔥 Cargar modelos
export async function loadModels() {
  if (modelsLoaded) return;

  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  ]);

  modelsLoaded = true;
}

// 🔥 Capturar imagen desde video
export async function captureImage(video: HTMLVideoElement): Promise<string> {
  if (!video || video.readyState !== 4) {
    throw new Error("La cámara no está lista");
  }

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");
  ctx?.drawImage(video, 0, 0);

  return canvas.toDataURL("image/jpeg");
}

// 🔥 Obtener descriptor facial
export async function getFaceDescriptor(imageSrc: string) {
  await loadModels();

  const img = await faceapi.fetchImage(imageSrc);

  const detection = await faceapi
    .detectSingleFace(img)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) {
    throw new Error("No se detectó rostro");
  }

  return Array.from(detection.descriptor);
}

// 🔥 GUARDAR 
export async function saveFaceDescriptor(uid: string, descriptor: number[]) {
  if (!uid) throw new Error("Usuario no autenticado");

  const ref = doc(db, "users", uid);

  await setDoc(
    ref,
    {
      faceDescriptor: descriptor,
      updatedAt: serverTimestamp(),
    },
    { merge: true } 
  );
}

// 🔥 OBTENER
export async function getStoredDescriptor(uid: string) {
  if (!uid) return null;

  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return snap.data().faceDescriptor || null;
}

// 🔥 COMPARAR
export function compareFaces(d1: number[], d2: number[]) {
  const distance = faceapi.euclideanDistance(d1, d2);

  console.log("DISTANCIA:", distance);

  return distance < 0.5;
}