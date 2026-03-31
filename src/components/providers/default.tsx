import { AuthProvider } from "./auth.tsx";
import { QueryClientProvider } from "./query-client.tsx";
import { ThemeProvider } from "./theme.tsx";
import { Toaster } from "../ui/sonner.tsx";
import { TooltipProvider } from "../ui/tooltip.tsx";
import { AppStateProvider } from "@/lib/app-state.tsx";

export function DefaultProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppStateProvider>
        <QueryClientProvider>
          <TooltipProvider>
            <ThemeProvider>
              <Toaster />
              {children}
            </ThemeProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </AppStateProvider>
    </AuthProvider>
  );
}
