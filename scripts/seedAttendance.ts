import dotenv from "dotenv";
dotenv.config();

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const SOURCE = "seed-demo-abril-mayo-junio-v2-lunes";
const DELETE_OLD_SEED_DATA = true;

const workers = [
  { id: "worker_001", name: "Jose Antonio Diaz" },
  { id: "worker_002", name: "Nicolas Pozo" },
  { id: "worker_003", name: "Martin Lara" },
  { id: "worker_004", name: "Camila Rojas" },
  { id: "worker_005", name: "Sebastian Muñoz" },
  { id: "worker_006", name: "Valentina Torres" },
  { id: "worker_007", name: "Matias Fernandez" },
  { id: "worker_008", name: "Fernanda Soto" },
  { id: "worker_009", name: "Ignacio Morales" },
  { id: "worker_010", name: "Daniela Caceres" },
];

const shifts = [
  { name: "Turno Mañana", start: "07:00", end: "14:30" },
  { name: "Turno Tarde", start: "14:30", end: "22:00" },
  { name: "Turno Noche", start: "22:00", end: "06:30" },
];

function randomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addMinutesToTime(time: string, minutes: number) {
  const [hour, minute] = time.split(":").map(Number);
  const date = new Date(2026, 0, 1, hour, minute);
  date.setMinutes(date.getMinutes() + minutes);

  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
}

function formatDateLocal(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonday(date: Date) {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);

  return result;
}

function getWeekIndex(date: Date, startDate: Date) {
  const oneDay = 24 * 60 * 60 * 1000;

  const currentMonday = getMonday(date);
  const startMonday = getMonday(startDate);

  const diffDays = Math.floor(
    (currentMonday.getTime() - startMonday.getTime()) / oneDay
  );

  return Math.floor(diffDays / 7);
}

function getWeeklyShift(workerIndex: number, weekIndex: number) {
  const shiftIndex = (workerIndex + weekIndex) % shifts.length;
  return shifts[shiftIndex];
}

async function deleteOldSeedData() {
  const oldSources = [
    "seed-demo",
    "seed-demo-abril-mayo",
    "seed-demo-abril-mayo-v2",
    "seed-demo-abril-mayo-v3",
    "seed-demo-abril-mayo-v4-rotacion-semanal",
    "seed-demo-junio-2026-v1",
    "seed-demo-abril-mayo-junio-v1",
    "seed-demo-abril-mayo-junio-v2-lunes",
  ];

  let deleted = 0;

  for (const source of oldSources) {
    const q = query(
      collection(db, "attendanceRecords"),
      where("source", "==", source)
    );

    const snapshot = await getDocs(q);

    for (const document of snapshot.docs) {
      await deleteDoc(doc(db, "attendanceRecords", document.id));
      deleted++;
    }
  }

  console.log(`🗑️ Registros seed eliminados: ${deleted}`);
}

async function seedAttendance() {
  if (DELETE_OLD_SEED_DATA) {
    await deleteOldSeedData();
  }

  const startDate = new Date(2026, 3, 1); // 01 abril 2026
  const endDate = new Date(2026, 5, 30); // 30 junio 2026

  let total = 0;

  for (
    let currentDate = new Date(startDate);
    currentDate <= endDate;
    currentDate.setDate(currentDate.getDate() + 1)
  ) {
    const day = currentDate.getDay();

    if (day === 0) continue;

    const weekIndex = getWeekIndex(currentDate, startDate);

    for (const [workerIndex, worker] of workers.entries()) {
      const shift = getWeeklyShift(workerIndex, weekIndex);
      const probability = Math.random();

      let status = "";
      let lateMinutes = 0;

      let checkInTime: string | null = null;
      let checkOutTime: string | null = null;

      if (probability < 0.68) {
        status = "A tiempo";
        checkInTime = addMinutesToTime(shift.start, randomNumber(-5, 4));
        checkOutTime = addMinutesToTime(shift.end, randomNumber(0, 10));
      } else if (probability < 0.86) {
        status = "Atrasado";
        lateMinutes = randomNumber(6, 35);
        checkInTime = addMinutesToTime(shift.start, lateMinutes);
        checkOutTime = addMinutesToTime(shift.end, randomNumber(0, 15));
      } else if (probability < 0.94) {
        status = "Ausente";
      } else if (probability < 0.98) {
        status = "Pendiente";
      } else {
        status = "Incompleto";
        checkInTime = addMinutesToTime(shift.start, randomNumber(0, 15));
      }

      await addDoc(collection(db, "attendanceRecords"), {
        userId: worker.id,
        workerName: worker.name,
        date: formatDateLocal(currentDate),
        shiftName: shift.name,
        scheduledStart: shift.start,
        scheduledEnd: shift.end,
        checkInTime,
        checkOutTime,
        status,
        lateMinutes,
        location: "CD Refrigerados Macul",
        source: SOURCE,
        rotationType: "weekly",
        rotationWeek: weekIndex + 1,
        weekStartsOn: "monday",
        createdAt: Timestamp.now(),
      });

      total++;
    }
  }

  console.log(`✅ Datos creados abril-mayo-junio 2026: ${total}`);
}

seedAttendance()
  .then(() => {
    console.log("🔥 Seed finalizado correctamente con semanas desde lunes");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });