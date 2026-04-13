import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

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

export async function createAttendanceRecord(
  uid: string,
  input: Omit<FirestoreAttendance, "_id">
) {
  const ref = collection(db, "users", uid, "attendance");

  await addDoc(ref, {
    ...input,
    createdAt: serverTimestamp(),
  });
}

export async function deleteAttendanceRecord(uid: string, attendanceId: string) {
  const ref = doc(db, "users", uid, "attendance", attendanceId);
  await deleteDoc(ref);
}