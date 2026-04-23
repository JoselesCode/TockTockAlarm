import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import type { UserRole } from "@/lib/firebase/users";

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: UserRole[];
};

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Verificando sesión...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/app" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "rrhh") {
      return <Navigate to="/app/dashboard" replace />;
    }

    return <Navigate to="/app/home" replace />;
  }

  return <>{children}</>;
}