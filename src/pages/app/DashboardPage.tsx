import {
  LogOut,
  ArrowLeft,
  Users,
  Clock3,
  AlertTriangle,
  ClipboardList,
} from "lucide-react";

import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardPage() {
  const { user, removeUser } = useAuth();

  async function handleLogout() {
    try {
      await removeUser();
    } catch (error) {
      console.error("Error cerrando sesión:", error);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          
          {/* Left */}
          <div>
            <h1 className="text-2xl font-black">
              Panel <span className="text-primary">RRHH</span>
            </h1>

            <p className="text-sm text-muted-foreground mt-1">
              Supervisión de asistencia y atrasos
            </p>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Inicio
              </Button>
            </Link>

            <Button
              variant="destructive"
              size="sm"
              className="gap-2"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Bienvenida */}
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="text-xl font-bold">
            Bienvenido, {user?.profile.name}
          </h2>

          <p className="text-muted-foreground mt-2">
            Desde este panel podrás supervisar asistencia,
            atrasos y comportamiento de trabajadores.
          </p>
        </div>

        {/* KPIs */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Trabajadores activos
              </p>

              <Users className="w-5 h-5 text-primary" />
            </div>

            <h3 className="text-3xl font-black mt-4">
              120
            </h3>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Atrasos hoy
              </p>

              <Clock3 className="w-5 h-5 text-yellow-500" />
            </div>

            <h3 className="text-3xl font-black mt-4">
              12
            </h3>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Inasistencias
              </p>

              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>

            <h3 className="text-3xl font-black mt-4">
              5
            </h3>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Reportes generados
              </p>

              <ClipboardList className="w-5 h-5 text-blue-500" />
            </div>

            <h3 className="text-3xl font-black mt-4">
              18
            </h3>
          </div>

        </section>

        {/* Tabla */}
        <section className="rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold">
                Asistencia del día
              </h2>

              <p className="text-sm text-muted-foreground">
                Supervisión de trabajadores y marcajes
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">

              <thead className="border-b">
                <tr className="text-muted-foreground text-sm">
                  <th className="py-3">Trabajador</th>
                  <th className="py-3">Turno</th>
                  <th className="py-3">Hora ingreso</th>
                  <th className="py-3">Estado</th>
                </tr>
              </thead>

              <tbody>

                <tr className="border-b">
                  <td className="py-4">José Díaz</td>
                  <td>Mañana</td>
                  <td>07:08</td>

                  <td>
                    <span className="text-yellow-500 font-semibold">
                      Atrasado
                    </span>
                  </td>
                </tr>

                <tr className="border-b">
                  <td className="py-4">Nicolás Pozo</td>
                  <td>Tarde</td>
                  <td>14:25</td>

                  <td>
                    <span className="text-green-500 font-semibold">
                      Puntual
                    </span>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}