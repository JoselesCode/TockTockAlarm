import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

const provider = new GoogleAuthProvider();

export async function loginWithGoogle() {
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function logoutUser() {
  await signOut(auth);
}

export function listenAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}