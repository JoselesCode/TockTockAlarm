import { useEffect, useMemo, useState } from "react";
import {
  LogOut,
  ArrowLeft,
  Clock3,
  AlertTriangle,
  ClipboardList,
  CheckCircle2,
  History,
  LayoutDashboard,
  FileSpreadsheet,
  FileText,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

import {
  getAllActiveUsers,
  type FirestoreUserProfile,
} from "@/lib/firebase/users";
import {
  getUserAttendance,
  type FirestoreAttendance,
} from "@/lib/firebase/attendance";
import {
  getUserShifts,
  type FirestoreShift,
} from "@/lib/firebase/shifts";

type Tab = "resumen" | "historial";

type DashboardRow = {
  uid: string;
  trabajador: string;
  turnoActual: string;
  horario: string;
  horaIngreso: string;
  horaSalida: string;
  estado: "Pendiente" | "En jornada" | "Finalizado";
  atrasoMinutos: number;
  tieneAtraso: boolean;
};

type HistoryRow = {
  id: string;
  uid: string;
  trabajador: string;
  fecha: string;
  fechaInput: string;
  tipo: "Ingreso" | "Salida";
  hora: string;
  turnoActual: string;
  horario: string;
  atrasoMinutos: number;
  tieneAtraso: boolean;
};

type WorkerData = {
  user: FirestoreUserProfile;
  shifts: FirestoreShift[];
  attendance: FirestoreAttendance[];
};

/**
 * Formatea una fecha completa para mostrar solo la hora.
 */
function formatHour(value?: string) {
  if (!value) return "--:--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--";

  return date.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Formatea una fecha para mostrarla en formato chileno.
 */
function formatDate(value?: string) {
  if (!value) return "--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  return date.toLocaleDateString("es-CL");
}

/**
 * Convierte una fecha a formato YYYY-MM-DD para usarla en inputs tipo date.
 */
function formatDateInput(date: Date) {
  return date.toISOString().split("T")[0];
}

/**
 * Valida si un marcaje pertenece al día actual.
 */
function isToday(value?: string) {
  if (!value) return false;

  const date = new Date(value);
  const today = new Date();

  if (Number.isNaN(date.getTime())) return false;

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

/**
 * Calcula los minutos de atraso comparando la hora de ingreso
 * con la hora de inicio del turno.
 *
 * Se aplica una tolerancia de 5 minutos.
 */
function calculateLateMinutes(shiftStart: string, checkinTimestamp?: string) {
  if (!checkinTimestamp) {
    return {
      atrasoMinutos: 0,
      tieneAtraso: false,
    };
  }

  const checkinDate = new Date(checkinTimestamp);
  if (Number.isNaN(checkinDate.getTime())) {
    return {
      atrasoMinutos: 0,
      tieneAtraso: false,
    };
  }

  const [hours, minutes] = shiftStart.split(":").map(Number);

  const expectedDate = new Date(checkinDate);
  expectedDate.setHours(hours);
  expectedDate.setMinutes(minutes);
  expectedDate.setSeconds(0);
  expectedDate.setMilliseconds(0);

  const diffMs = checkinDate.getTime() - expectedDate.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  const toleranceMinutes = 5;

  if (diffMinutes <= toleranceMinutes) {
    return {
      atrasoMinutos: 0,
      tieneAtraso: false,
    };
  }

  return {
    atrasoMinutos: diffMinutes,
    tieneAtraso: true,
  };
}

/**
 * Construye la fila principal del resumen diario.
 * Solo considera marcajes del día actual.
 */
function buildDashboardRow(
  user: FirestoreUserProfile,
  shifts: FirestoreShift[],
  attendance: FirestoreAttendance[]
): DashboardRow {
  const activeShift = shifts.find((shift) => shift.isActive);

  const turnoActual = activeShift?.name ?? "Sin turno activo";
  const horario = activeShift
    ? `${activeShift.startTime} - ${activeShift.endTime}`
    : "--";

  const todayAttendance = attendance.filter((item) =>
    isToday(item.timestamp)
  );

  const checkin = todayAttendance.find((item) => item.type === "checkin");
  const checkout = todayAttendance.find((item) => item.type === "checkout");

  const lateInfo = calculateLateMinutes(
    activeShift?.startTime ?? "00:00",
    checkin?.timestamp
  );

  let estado: DashboardRow["estado"] = "Pendiente";

  if (checkin && !checkout) estado = "En jornada";
  if (checkin && checkout) estado = "Finalizado";

  return {
    uid: user.uid,
    trabajador: user.name,
    turnoActual,
    horario,
    horaIngreso: formatHour(checkin?.timestamp),
    horaSalida: formatHour(checkout?.timestamp),
    estado,
    atrasoMinutos: lateInfo.atrasoMinutos,
    tieneAtraso: lateInfo.tieneAtraso,
  };
}

/**
 * Construye el historial general de marcajes.
 * Aquí se consideran todos los registros guardados.
 */
function buildHistoryRows(workerData: WorkerData[]): HistoryRow[] {
  return workerData.flatMap(({ user, shifts, attendance }) => {
    const activeShift = shifts.find((shift) => shift.isActive);

    const turnoActual = activeShift?.name ?? "Sin turno activo";
    const horario = activeShift
      ? `${activeShift.startTime} - ${activeShift.endTime}`
      : "--";

    return attendance.map((record) => {
      const recordDate = new Date(record.timestamp);

      const lateInfo =
        record.type === "checkin"
          ? calculateLateMinutes(
              activeShift?.startTime ?? "00:00",
              record.timestamp
            )
          : {
              atrasoMinutos: 0,
              tieneAtraso: false,
            };

      return {
        id: `${user.uid}-${record._id ?? record.timestamp}`,
        uid: user.uid,
        trabajador: user.name,
        fecha: formatDate(record.timestamp),
        fechaInput: Number.isNaN(recordDate.getTime())
          ? ""
          : formatDateInput(recordDate),
        tipo: record.type === "checkin" ? "Ingreso" : "Salida",
        hora: formatHour(record.timestamp),
        turnoActual,
        horario,
        atrasoMinutos: lateInfo.atrasoMinutos,
        tieneAtraso: lateInfo.tieneAtraso,
      };
    });
  });
}

/**
 * Exporta información en formato CSV.
 * Excel puede abrir este archivo sin problemas.
 */
function exportToExcelCompatibleCSV(rows: HistoryRow[], fileName: string) {
  const headers = [
    "Fecha",
    "Trabajador",
    "Tipo",
    "Hora",
    "Turno",
    "Horario",
    "Atraso",
  ];

  const data = rows.map((row) => [
    row.fecha,
    row.trabajador,
    row.tipo,
    row.hora,
    row.turnoActual,
    row.horario,
    row.tipo === "Salida"
      ? "--"
      : row.tieneAtraso
      ? `${row.atrasoMinutos} min`
      : "Sin atraso",
  ]);

  const csvContent = [headers, ...data]
    .map((line) =>
      line
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(";")
    )
    .join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${fileName}.csv`;
  link.click();

  URL.revokeObjectURL(url);
}

/**
 * Genera una vista imprimible para PDF.
 * El usuario puede guardar como PDF desde el navegador.
 */
function exportToPDF(rows: HistoryRow[], title: string) {
  const tableRows = rows
    .map(
      (row) => `
      <tr>
        <td>${row.fecha}</td>
        <td>${row.trabajador}</td>
        <td>${row.tipo}</td>
        <td>${row.hora}</td>
        <td>${row.turnoActual}</td>
        <td>${row.horario}</td>
        <td>${
          row.tipo === "Salida"
            ? "--"
            : row.tieneAtraso
            ? `${row.atrasoMinutos} min`
            : "Sin atraso"
        }</td>
      </tr>
    `
    )
    .join("");

  const printWindow = window.open("", "_blank");

  if (!printWindow) return;

  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 24px;
          }

          h1 {
            margin-bottom: 4px;
          }

          p {
            color: #555;
            margin-bottom: 24px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            font-size: 12px;
          }

          th {
            background: #f3f4f6;
            text-align: left;
          }
        </style>
      </head>

      <body>
        <h1>${title}</h1>
        <p>Reporte generado desde el Panel de RRHH de TockTockAlarm.</p>

        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Trabajador</th>
              <th>Tipo</th>
              <th>Hora</th>
              <th>Turno</th>
              <th>Horario</th>
              <th>Atraso</th>
            </tr>
          </thead>

          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.print();
}

export default function DashboardPage() {
  const { user, removeUser } = useAuth();

  const [tab, setTab] = useState<Tab>("resumen");
  const [rows, setRows] = useState<DashboardRow[]>([]);
  const [historyRows, setHistoryRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [historyDate, setHistoryDate] = useState(formatDateInput(new Date()));
  const [selectedWorker, setSelectedWorker] = useState<DashboardRow | null>(
    null
  );

  async function handleLogout() {
    try {
      await removeUser();
    } catch (error) {
      console.error("Error cerrando sesión:", error);
    }
  }

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);

        const users = await getAllActiveUsers();
        const workerUsers = users.filter((item) => item.role === "worker");

        const workersData = await Promise.all(
          workerUsers.map(async (worker) => {
            const [shifts, attendance] = await Promise.all([
              getUserShifts(worker.uid),
              getUserAttendance(worker.uid),
            ]);

            return {
              user: worker,
              shifts,
              attendance,
            };
          })
        );

        setRows(
          workersData.map((item) =>
            buildDashboardRow(item.user, item.shifts, item.attendance)
          )
        );

        setHistoryRows(buildHistoryRows(workersData));
      } catch (error) {
        console.error("Error cargando dashboard RRHH:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return rows;

    return rows.filter((row) =>
      row.trabajador.toLowerCase().includes(term)
    );
  }, [rows, searchTerm]);

  const historyByDate = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return historyRows.filter((row) => {
      const matchesName = term
        ? row.trabajador.toLowerCase().includes(term)
        : true;

      const matchesDate = historyDate
        ? row.fechaInput === historyDate
        : true;

      return matchesName && matchesDate;
    });
  }, [historyRows, searchTerm, historyDate]);

  const selectedWorkerHistory = useMemo(() => {
    if (!selectedWorker) return [];

    return historyRows.filter((row) => row.uid === selectedWorker.uid);
  }, [historyRows, selectedWorker]);

  const totalTrabajadores = filteredRows.length;

  const presentes = filteredRows.filter(
    (row) => row.estado === "En jornada" || row.estado === "Finalizado"
  ).length;

  const pendientes = filteredRows.filter(
    (row) => row.estado === "Pendiente"
  ).length;

  const enJornada = filteredRows.filter(
    (row) => row.estado === "En jornada"
  ).length;

  const atrasados = filteredRows.filter((row) => row.tieneAtraso).length;

  const porcentajeAsistencia =
    totalTrabajadores > 0
      ? Math.round((presentes / totalTrabajadores) * 100)
      : 0;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black">
              Panel <span className="text-primary">RRHH</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Supervisión de asistencia, turnos rotativos y marcajes
            </p>
          </div>

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

      <section className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="text-xl font-bold">
            Bienvenido, {user?.profile.name}
          </h2>
          <p className="text-muted-foreground mt-2">
            Este módulo permite a RRHH monitorear la asistencia diaria,
            revisar turnos activos, detectar atrasos, consultar historial y
            exportar reportes.
          </p>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Asistencia del día
              </p>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>

            <h3 className="text-3xl font-black mt-4">
              {presentes} / {totalTrabajadores}
            </h3>

            <p className="text-sm text-muted-foreground mt-1">
              {porcentajeAsistencia}% de asistencia
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">En jornada</p>
              <Clock3 className="w-5 h-5 text-yellow-500" />
            </div>

            <h3 className="text-3xl font-black mt-4">{enJornada}</h3>

            <p className="text-sm text-muted-foreground mt-1">
              Trabajadores actualmente activos
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Pendientes de marcaje
              </p>
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>

            <h3 className="text-3xl font-black mt-4">{pendientes}</h3>

            <p className="text-sm text-muted-foreground mt-1">
              Sin ingreso registrado hoy
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Atrasos detectados
              </p>
              <ClipboardList className="w-5 h-5 text-orange-500" />
            </div>

            <h3 className="text-3xl font-black mt-4">{atrasados}</h3>

            <p className="text-sm text-muted-foreground mt-1">
              Con tolerancia de 5 minutos
            </p>
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setTab("resumen")}
              className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
                tab === "resumen"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Resumen de hoy
            </button>

            <button
              onClick={() => setTab("historial")}
              className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
                tab === "historial"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <History className="w-4 h-4" />
              Historial de marcajes
            </button>
          </div>
        </section>

        {tab === "resumen" ? (
          <section className="rounded-2xl border bg-card p-6">
            <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-xl font-bold">Asistencia del día</h2>
                <p className="text-sm text-muted-foreground">
                  Estado actual de los trabajadores registrados hoy
                </p>
              </div>

              <div className="w-full md:w-80">
                <label className="text-sm font-medium block mb-2">
                  Filtrar por trabajador
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre..."
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none"
                />
              </div>
            </div>

            {loading ? (
              <div className="py-10 text-sm text-muted-foreground">
                Cargando datos del dashboard...
              </div>
            ) : filteredRows.length === 0 ? (
              <div className="py-10 text-sm text-muted-foreground">
                No se encontraron trabajadores con ese filtro.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b">
                    <tr className="text-muted-foreground text-sm">
                      <th className="py-3">Trabajador</th>
                      <th className="py-3">Turno actual</th>
                      <th className="py-3">Horario</th>
                      <th className="py-3">Hora ingreso</th>
                      <th className="py-3">Hora salida</th>
                      <th className="py-3">Estado</th>
                      <th className="py-3">Atraso</th>
                      <th className="py-3">Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRows.map((row) => (
                      <tr key={row.uid} className="border-b">
                        <td className="py-4 font-medium">
                          {row.trabajador}
                        </td>
                        <td>{row.turnoActual}</td>
                        <td>{row.horario}</td>
                        <td>{row.horaIngreso}</td>
                        <td>{row.horaSalida}</td>
                        <td>
                          <span
                            className={
                              row.estado === "Finalizado"
                                ? "text-green-500 font-semibold"
                                : row.estado === "En jornada"
                                ? "text-yellow-500 font-semibold"
                                : "text-red-500 font-semibold"
                            }
                          >
                            {row.estado}
                          </span>
                        </td>
                        <td>
                          {row.estado === "Pendiente" ? (
                            <span className="text-muted-foreground">--</span>
                          ) : row.tieneAtraso ? (
                            <span className="text-red-500 font-semibold">
                              {row.atrasoMinutos} min
                            </span>
                          ) : (
                            <span className="text-green-500 font-medium">
                              Sin atraso
                            </span>
                          )}
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            onClick={() => setSelectedWorker(row)}
                          >
                            <Eye className="w-4 h-4" />
                            Ver detalle
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {selectedWorker && (
              <section className="mt-6 rounded-2xl border bg-background p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-2xl font-black">
                      Detalle del trabajador
                    </h3>
                    <p className="text-muted-foreground mt-1">
                      Información individual para supervisión de RRHH.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() =>
                        exportToExcelCompatibleCSV(
                          selectedWorkerHistory,
                          `historial-${selectedWorker.trabajador}`
                        )
                      }
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      Excel
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() =>
                        exportToPDF(
                          selectedWorkerHistory,
                          `Historial de ${selectedWorker.trabajador}`
                        )
                      }
                    >
                      <FileText className="w-4 h-4" />
                      PDF
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedWorker(null)}
                    >
                      Cerrar
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
                  <div className="rounded-xl border p-4">
                    <p className="text-sm text-muted-foreground">
                      Trabajador
                    </p>
                    <h4 className="text-lg font-bold mt-2">
                      {selectedWorker.trabajador}
                    </h4>
                  </div>

                  <div className="rounded-xl border p-4">
                    <p className="text-sm text-muted-foreground">
                      Turno actual
                    </p>
                    <h4 className="text-lg font-bold mt-2">
                      {selectedWorker.turnoActual}
                    </h4>
                  </div>

                  <div className="rounded-xl border p-4">
                    <p className="text-sm text-muted-foreground">Horario</p>
                    <h4 className="text-lg font-bold mt-2">
                      {selectedWorker.horario}
                    </h4>
                  </div>

                  <div className="rounded-xl border p-4">
                    <p className="text-sm text-muted-foreground">
                      Estado actual
                    </p>
                    <h4 className="text-lg font-bold mt-2">
                      {selectedWorker.estado}
                    </h4>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-bold mb-3">
                    Historial del trabajador
                  </h4>

                  {selectedWorkerHistory.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No existen marcajes registrados para este trabajador.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="border-b">
                          <tr className="text-muted-foreground text-sm">
                            <th className="py-3">Fecha</th>
                            <th className="py-3">Tipo</th>
                            <th className="py-3">Hora</th>
                            <th className="py-3">Turno</th>
                            <th className="py-3">Horario</th>
                            <th className="py-3">Atraso</th>
                          </tr>
                        </thead>

                        <tbody>
                          {selectedWorkerHistory.map((row) => (
                            <tr key={row.id} className="border-b">
                              <td className="py-4">{row.fecha}</td>
                              <td>{row.tipo}</td>
                              <td>{row.hora}</td>
                              <td>{row.turnoActual}</td>
                              <td>{row.horario}</td>
                              <td>
                                {row.tipo === "Salida" ? (
                                  <span className="text-muted-foreground">
                                    --
                                  </span>
                                ) : row.tieneAtraso ? (
                                  <span className="text-red-500 font-semibold">
                                    {row.atrasoMinutos} min
                                  </span>
                                ) : (
                                  <span className="text-green-500 font-medium">
                                    Sin atraso
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </section>
            )}
          </section>
        ) : (
          <section className="rounded-2xl border bg-card p-6">
            <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-xl font-bold">Historial de marcajes</h2>
                <p className="text-sm text-muted-foreground">
                  Consulta registros anteriores por trabajador y fecha.
                </p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <div className="w-full md:w-72">
                  <label className="text-sm font-medium block mb-2">
                    Filtrar por trabajador
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre..."
                    className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none"
                  />
                </div>

                <div className="w-full md:w-48">
                  <label className="text-sm font-medium block mb-2">
                    Filtrar por fecha
                  </label>
                  <input
                    type="date"
                    value={historyDate}
                    onChange={(e) => setHistoryDate(e.target.value)}
                    className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() =>
                  exportToExcelCompatibleCSV(
                    historyByDate,
                    `historial-marcajes-${historyDate}`
                  )
                }
              >
                <FileSpreadsheet className="w-4 h-4" />
                Exportar Excel
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() =>
                  exportToPDF(
                    historyByDate,
                    `Historial de marcajes ${historyDate}`
                  )
                }
              >
                <FileText className="w-4 h-4" />
                Exportar PDF
              </Button>
            </div>

            {loading ? (
              <div className="py-10 text-sm text-muted-foreground">
                Cargando historial de marcajes...
              </div>
            ) : historyByDate.length === 0 ? (
              <div className="py-10 text-sm text-muted-foreground">
                No existen marcajes para los filtros seleccionados.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b">
                    <tr className="text-muted-foreground text-sm">
                      <th className="py-3">Fecha</th>
                      <th className="py-3">Trabajador</th>
                      <th className="py-3">Tipo</th>
                      <th className="py-3">Hora</th>
                      <th className="py-3">Turno</th>
                      <th className="py-3">Horario</th>
                      <th className="py-3">Atraso</th>
                    </tr>
                  </thead>

                  <tbody>
                    {historyByDate.map((row) => (
                      <tr key={row.id} className="border-b">
                        <td className="py-4">{row.fecha}</td>
                        <td className="font-medium">{row.trabajador}</td>
                        <td>
                          <span
                            className={
                              row.tipo === "Ingreso"
                                ? "text-green-500 font-semibold"
                                : "text-blue-500 font-semibold"
                            }
                          >
                            {row.tipo}
                          </span>
                        </td>
                        <td>{row.hora}</td>
                        <td>{row.turnoActual}</td>
                        <td>{row.horario}</td>
                        <td>
                          {row.tipo === "Salida" ? (
                            <span className="text-muted-foreground">--</span>
                          ) : row.tieneAtraso ? (
                            <span className="text-red-500 font-semibold">
                              {row.atrasoMinutos} min
                            </span>
                          ) : (
                            <span className="text-green-500 font-medium">
                              Sin atraso
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </section>
    </main>
  );
}