import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type FirestoreShift = {
  _id?: string;
  name: string;
  icon: string;
  color: string;
  startTime: string;
  endTime: string;
  order: number;
  isActive: boolean;
};

export async function getUserShifts(uid: string): Promise<FirestoreShift[]> {
  const ref = collection(db, "users", uid, "shifts");
  const q = query(ref, orderBy("order", "asc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docItem) => ({
    _id: docItem.id,
    ...(docItem.data() as Omit<FirestoreShift, "_id">),
  }));
}

export async function createUserShift(
  uid: string,
  input: Omit<FirestoreShift, "_id">
) {
  const ref = collection(db, "users", uid, "shifts");

  await addDoc(ref, {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateUserShift(
  uid: string,
  shiftId: string,
  input: Partial<Omit<FirestoreShift, "_id">>
) {
  const ref = doc(db, "users", uid, "shifts", shiftId);

  await updateDoc(ref, {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteUserShift(uid: string, shiftId: string) {
  const ref = doc(db, "users", uid, "shifts", shiftId);
  await deleteDoc(ref);
}