import type { ReactNode } from "react";
import { AuthProvider } from "@/components/providers/auth";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return <AuthProvider>{children}</AuthProvider>;
}