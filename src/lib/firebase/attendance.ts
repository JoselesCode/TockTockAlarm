import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import {
  isInsideGeofence,
  type geoUbicacion,
} from "@/lib/firebase/locationDefining";

export type FirestoreAttendance = {
  _id?: string;
  type: "checkin" | "checkout";
  timestamp: string;
  shiftId?: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  note?: string;
  geofenceId?: string;
  geofenceName?: string;
  insideGeofence?: boolean;
  faceVerificationStatus?: "pending" | "verified" | "rejected" | "not_used";
  faceImageUrl?: string;
  markStatus?: "approved" | "rejected" | "manual_review";
};

export type AttendanceRecord = {
  id: string;
  userId: string;
  workerName: string;
  date: string;
  shiftName: string;
  scheduledStart: string;
  scheduledEnd: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: string;
  lateMinutes: number;
  location: string;
  source?: string;
};

function getDateOnly(timestamp: string) {
  return timestamp.split("T")[0];
}

function getTimeOnly(timestamp: string) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) return "--:--";

  return date.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function calculateLateMinutes(scheduledStart: string, timestamp: string) {
  const markDate = new Date(timestamp);

  if (Number.isNaN(markDate.getTime())) return 0;

  const [hours, minutes] = scheduledStart.split(":").map(Number);

  const expectedDate = new Date(markDate);
  expectedDate.setHours(hours);
  expectedDate.setMinutes(minutes);
  expectedDate.setSeconds(0);
  expectedDate.setMilliseconds(0);

  const diffMinutes = Math.floor(
    (markDate.getTime() - expectedDate.getTime()) / 60000
  );

  const toleranceMinutes = 5;

  return diffMinutes > toleranceMinutes ? diffMinutes : 0;
}

async function syncAttendanceRecord(
  uid: string,
  input: Omit<FirestoreAttendance, "_id">
) {
  const date = getDateOnly(input.timestamp);
  const time = getTimeOnly(input.timestamp);

  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  const userData = userSnap.exists() ? userSnap.data() : null;

  const workerName =
    userData?.name ||
    userData?.displayName ||
    userData?.email ||
    "Trabajador sin nombre";

  let shiftName = "Sin turno asignado";
  let scheduledStart = "00:00";
  let scheduledEnd = "00:00";

  if (input.shiftId) {
    const shiftRef = doc(db, "users", uid, "shifts", input.shiftId);
    const shiftSnap = await getDoc(shiftRef);

    if (shiftSnap.exists()) {
      const shiftData = shiftSnap.data();

      shiftName = shiftData.name ?? "Turno sin nombre";
      scheduledStart = shiftData.startTime ?? "00:00";
      scheduledEnd = shiftData.endTime ?? "00:00";
    }
  }

  const recordId = `${uid}_${date}`;
  const recordRef = doc(db, "attendanceRecords", recordId);

  if (input.type === "checkin") {
    const lateMinutes = calculateLateMinutes(
      scheduledStart,
      input.timestamp
    );

    await setDoc(
      recordRef,
      {
        userId: uid,
        workerName,
        date,
        shiftName,
        scheduledStart,
        scheduledEnd,
        checkInTime: time,
        status: lateMinutes > 0 ? "Atrasado" : "A tiempo",
        lateMinutes,
        location: input.geofenceName ?? "Ubicación no definida",
        source: "app",
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  if (input.type === "checkout") {
    await setDoc(
      recordRef,
      {
        userId: uid,
        workerName,
        date,
        shiftName,
        scheduledStart,
        scheduledEnd,
        checkOutTime: time,
        location: input.geofenceName ?? "Ubicación no definida",
        source: "app",
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }
}

export async function getUserAttendance(
  uid: string
): Promise<FirestoreAttendance[]> {
  const ref = collection(db, "users", uid, "attendance");
  const q = query(ref, orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docItem) => ({
    _id: docItem.id,
    ...(docItem.data() as Omit<FirestoreAttendance, "_id">),
  }));
}

export async function getAllAttendanceRecords(): Promise<AttendanceRecord[]> {
  const recordsQuery = query(
    collection(db, "attendanceRecords"),
    orderBy("date", "desc")
  );

  const snapshot = await getDocs(recordsQuery);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...(docItem.data() as Omit<AttendanceRecord, "id">),
  }));
}

export async function createAttendanceRecord(
  uid: string,
  input: Omit<FirestoreAttendance, "_id">
) {
  const ref = collection(db, "users", uid, "attendance");

  await addDoc(ref, {
    ...input,
    createdAt: serverTimestamp(),
  });

  await syncAttendanceRecord(uid, input);
}

export async function deleteAttendanceRecord(
  uid: string,
  attendanceId: string
) {
  const ref = doc(db, "users", uid, "attendance", attendanceId);
  await deleteDoc(ref);
}

const officeGeofence: geoUbicacion = {
  id: "duoc",
  name: "Duoc Sede San Joaquin",
  latitude: -33.500618,
  longitude: -70.616733,
  radius: 100,
};

export async function checkInWithGeofence(
  uid: string,
  userLat: number,
  userLng: number
) {
  const inside = isInsideGeofence(userLat, userLng, officeGeofence);

  await createAttendanceRecord(uid, {
    type: "checkin",
    timestamp: new Date().toISOString(),
    latitude: userLat,
    longitude: userLng,
    insideGeofence: inside,
    geofenceId: officeGeofence.id,
    geofenceName: officeGeofence.name,
  });
}