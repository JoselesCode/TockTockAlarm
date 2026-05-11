import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
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
  isDefault?: boolean;
  canDelete?: boolean;
};

const DEFAULT_SHIFTS: FirestoreShift[] = [
  {
    _id: "turno-a",
    name: "Turno A",
    icon: "sun",
    color: "orange",
    startTime: "07:00",
    endTime: "14:30",
    order: 1,
    isActive: true,
    isDefault: true,
    canDelete: false,
  },
  {
    _id: "turno-b",
    name: "Turno B",
    icon: "sunset",
    color: "blue",
    startTime: "14:30",
    endTime: "22:00",
    order: 2,
    isActive: false,
    isDefault: true,
    canDelete: false,
  },
  {
    _id: "turno-c",
    name: "Turno C",
    icon: "moon",
    color: "purple",
    startTime: "23:00",
    endTime: "06:30",
    order: 3,
    isActive: false,
    isDefault: true,
    canDelete: false,
  },
];

export async function ensureDefaultShifts(uid: string) {
  const ref = collection(db, "users", uid, "shifts");
  const snapshot = await getDocs(ref);

  const existingIds = snapshot.docs.map((docItem) => docItem.id);

  for (const shift of DEFAULT_SHIFTS) {
    if (!shift._id) continue;

    if (!existingIds.includes(shift._id)) {
      const shiftRef = doc(db, "users", uid, "shifts", shift._id);

      await setDoc(shiftRef, {
        name: shift.name,
        icon: shift.icon,
        color: shift.color,
        startTime: shift.startTime,
        endTime: shift.endTime,
        order: shift.order,
        isActive: shift.isActive,
        isDefault: true,
        canDelete: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  }
}

export async function getUserShifts(uid: string): Promise<FirestoreShift[]> {
  await ensureDefaultShifts(uid);

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
    isDefault: false,
    canDelete: true,
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
  const shifts = await getUserShifts(uid);
  const shift = shifts.find((item) => item._id === shiftId);

  if (shift?.canDelete === false || shift?.isDefault === true) {
    throw new Error("Este turno es fijo y no puede eliminarse.");
  }

  const ref = doc(db, "users", uid, "shifts", shiftId);
  await deleteDoc(ref);
}