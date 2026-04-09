import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

/**
 * Tipo de props que recibe el componente
 * children = contenido que queremos proteger (por ejemplo: AppIndex)
 */
type ProtectedRouteProps = {
  children: ReactNode;
};

/**
 * Componente que protege rutas privadas de la aplicación
 * Solo permite acceso si el usuario está autenticado en Firebase
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Estado global de autenticación (viene del AuthProvider con Firebase)
  const { user, isLoading } = useAuth();

  // Captura la ruta actual (útil para redirecciones futuras)
  const location = useLocation();

  /**
   * 1. Mientras Firebase valida la sesión del usuario
   * (ej: cuando se recarga la página o se abre la app)
   */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Verificando sesión...
        </p>
      </div>
    );
  }

  /**
   * 2. Si NO hay usuario autenticado
   * redirige automáticamente al inicio (o login)
   */
  if (!user) {
    return (
      <Navigate
        to="/"
        replace
        state={{ from: location }} // opcional: guarda de dónde venía
      />
    );
  }

  /**
   * 3. Si el usuario está autenticado
   * permite acceder a la ruta protegida
   */
  return <>{children}</>;
}