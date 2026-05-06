import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type FirestoreAlarm = {
  _id?: string;
  shiftId: string;
  label: string;
  time: string;
  days: number[];
  enabled: boolean;
};

export async function getUserAlarms(uid: string): Promise<FirestoreAlarm[]> {
  const ref = collection(db, "users", uid, "alarms");
  const snapshot = await getDocs(ref);

  return snapshot.docs.map((docItem) => ({
    _id: docItem.id,
    ...(docItem.data() as Omit<FirestoreAlarm, "_id">),
  }));
}

export async function createUserAlarm(
  uid: string,
  input: Omit<FirestoreAlarm, "_id">
) {
  const ref = collection(db, "users", uid, "alarms");

  await addDoc(ref, {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateUserAlarm(
  uid: string,
  alarmId: string,
  input: Partial<Omit<FirestoreAlarm, "_id">>
) {
  const ref = doc(db, "users", uid, "alarms", alarmId);

  await updateDoc(ref, {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteUserAlarm(uid: string, alarmId: string) {
  const ref = doc(db, "users", uid, "alarms", alarmId);
  await deleteDoc(ref);
}