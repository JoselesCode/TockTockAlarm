import { useAuthContext } from "@/components/providers/auth";

export function useAuth() {
  return useAuthContext();
}