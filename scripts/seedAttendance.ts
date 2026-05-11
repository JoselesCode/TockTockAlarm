import dotenv from "dotenv";
dotenv.config();

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
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

  const date = new Date();
  date.setHours(hour);
  date.setMinutes(minute + minutes);

  return date.toTimeString().slice(0, 5);
}

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

async function seedAttendance() {
  const startDate = new Date("2026-03-01");
  const endDate = new Date("2026-05-03");

  let total = 0;

  for (
    let currentDate = new Date(startDate);
    currentDate <= endDate;
    currentDate.setDate(currentDate.getDate() + 1)
  ) {
    const day = currentDate.getDay();

    if (day === 0) continue;

    for (const worker of workers) {
      const shift = shifts[randomNumber(0, shifts.length - 1)];

      const probability = Math.random();

      let status = "";
      let lateMinutes = 0;

      let checkInTime: string | null = null;
      let checkOutTime: string | null = null;

      if (probability < 0.65) {
        status = "A tiempo";

        checkInTime = addMinutesToTime(
          shift.start,
          randomNumber(-5, 4)
        );

        checkOutTime = addMinutesToTime(
          shift.end,
          randomNumber(0, 10)
        );
      } else if (probability < 0.85) {
        status = "Atrasado";

        lateMinutes = randomNumber(6, 35);

        checkInTime = addMinutesToTime(
          shift.start,
          lateMinutes
        );

        checkOutTime = addMinutesToTime(
          shift.end,
          randomNumber(0, 15)
        );
      } else if (probability < 0.93) {
        status = "Ausente";
      } else if (probability < 0.97) {
        status = "Pendiente";
      } else {
        status = "Incompleto";

        checkInTime = addMinutesToTime(
          shift.start,
          randomNumber(0, 15)
        );
      }

      await addDoc(collection(db, "attendanceRecords"), {
        userId: worker.id,
        workerName: worker.name,

        date: formatDate(currentDate),

        shiftName: shift.name,

        scheduledStart: shift.start,
        scheduledEnd: shift.end,

        checkInTime,
        checkOutTime,

        status,
        lateMinutes,

        location: "CD Refrigerados Macul",

        source: "seed-demo",

        createdAt: Timestamp.now(),
      });

      total++;
    }
  }

  console.log(`✅ Datos creados: ${total}`);
}

seedAttendance()
  .then(() => {
    console.log("🔥 Seed finalizado");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });