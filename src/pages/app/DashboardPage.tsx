import { useEffect, useMemo, useState } from "react";
import {
  LogOut,
  ArrowLeft,
  History,
  LayoutDashboard,
  FileSpreadsheet,
  FileText,
  Clock3,
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

import {
  getAllAttendanceRecords,
  type AttendanceRecord,
} from "@/lib/firebase/attendance";

type Tab = "resumen" | "historial";

type SortKey =
  | "date"
  | "workerName"
  | "shiftName"
  | "scheduledStart"
  | "checkInTime"
  | "checkOutTime"
  | "status"
  | "lateMinutes";

type SortDirection = "asc" | "desc";

function parseLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toInputDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMondayFromDate(value: string) {
  const date = parseLocalDate(value);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return toInputDate(date);
}

function getSundayFromDate(value: string) {
  const date = parseLocalDate(value);
  const day = date.getDay();
  const daysUntilSunday = day === 0 ? 0 : 7 - day;
  date.setDate(date.getDate() + daysUntilSunday);
  return toInputDate(date);
}

function getCurrentWeekRange() {
  const todayInput = toInputDate(new Date());
  const monday = getMondayFromDate(todayInput);
  const sunday = getSundayFromDate(monday);
  return { monday, sunday };
}

function formatDateCL(value: string) {
  return parseLocalDate(value).toLocaleDateString("es-CL");
}

function formatDateShort(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}-${month}-${year}`;
}

function getWeekDay(value: string) {
  const date = parseLocalDate(value);
  const days = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
  return days[date.getDay()];
}

function getWeekNumber(value: string) {
  const date = parseLocalDate(value);
  const year = date.getFullYear();
  const firstDay = new Date(year, 0, 1);
  const pastDays = Math.floor(
    (date.getTime() - firstDay.getTime()) / 86400000
  );

  return Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
}

function exportToCSV(rows: AttendanceRecord[], fileName: string) {
  const headers = [
    "Fecha",
    "Trabajador",
    "Turno",
    "Horario",
    "Ingreso",
    "Salida",
    "Estado",
    "Atraso",
    "Ubicación",
  ];

  const data = rows.map((row) => [
    formatDateCL(row.date),
    row.workerName,
    row.shiftName,
    `${row.scheduledStart} - ${row.scheduledEnd}`,
    row.checkInTime ?? "--",
    row.checkOutTime ?? "--",
    row.status,
    row.lateMinutes > 0 ? `${row.lateMinutes} min` : "Sin atraso",
    row.location,
  ]);

  const csvContent = [headers, ...data]
    .map((line) =>
      line.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(";")
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

function exportToPDF(rows: AttendanceRecord[], title: string) {
  const tableRows = rows
    .map(
      (row) => `
      <tr>
        <td>${formatDateCL(row.date)}</td>
        <td>${row.workerName}</td>
        <td>${row.shiftName}</td>
        <td>${row.scheduledStart} - ${row.scheduledEnd}</td>
        <td>${row.checkInTime ?? "--"}</td>
        <td>${row.checkOutTime ?? "--"}</td>
        <td>${row.status}</td>
        <td>${row.lateMinutes > 0 ? `${row.lateMinutes} min` : "Sin atraso"}</td>
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
          body { font-family: Arial, sans-serif; padding: 24px; }
          h1 { margin-bottom: 4px; }
          p { color: #555; margin-bottom: 24px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
          th { background: #f3f4f6; text-align: left; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p>Reporte generado desde el Panel RRHH de TockTockAlarm.</p>
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Trabajador</th>
              <th>Turno</th>
              <th>Horario</th>
              <th>Ingreso</th>
              <th>Salida</th>
              <th>Estado</th>
              <th>Atraso</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.print();
}

export default function DashboardPage() {
  const { removeUser } = useAuth();
  const currentWeek = getCurrentWeekRange();

  const [tab, setTab] = useState<Tab>("resumen");
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState(currentWeek.monday);
  const [endDate, setEndDate] = useState(currentWeek.sunday);
  const [selectedStatus, setSelectedStatus] = useState("Todos");
  const [selectedShift, setSelectedShift] = useState("Todos");

  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection("desc");
  }

  function sortIcon(key: SortKey) {
    if (sortKey !== key) return "↕";
    return sortDirection === "asc" ? "↑" : "↓";
  }

  function handleStartDateChange(value: string) {
    setStartDate(value);
    setEndDate(getSundayFromDate(value));
  }

  async function handleLogout() {
    await removeUser();
  }

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await getAllAttendanceRecords();
        setRecords(data);
      } catch (error) {
        console.error("Error cargando attendanceRecords:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const workersOptions = useMemo(() => {
    return Array.from(new Set(records.map((record) => record.workerName))).sort();
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesName = searchTerm ? record.workerName === searchTerm : true;
      const matchesDate = record.date >= startDate && record.date <= endDate;
      const matchesStatus =
        selectedStatus === "Todos" || record.status === selectedStatus;
      const matchesShift =
        selectedShift === "Todos" || record.shiftName === selectedShift;

      return matchesName && matchesDate && matchesStatus && matchesShift;
    });
  }, [records, searchTerm, startDate, endDate, selectedStatus, selectedShift]);

  const sortedFilteredRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      let valueA: string | number = "";
      let valueB: string | number = "";

      if (sortKey === "lateMinutes") {
        valueA = a.lateMinutes ?? 0;
        valueB = b.lateMinutes ?? 0;
      } else if (sortKey === "scheduledStart") {
        valueA = `${a.scheduledStart} - ${a.scheduledEnd}`;
        valueB = `${b.scheduledStart} - ${b.scheduledEnd}`;
      } else {
        valueA = String(a[sortKey] ?? "");
        valueB = String(b[sortKey] ?? "");
      }

      if (typeof valueA === "number" && typeof valueB === "number") {
        return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
      }

      return sortDirection === "asc"
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    });
  }, [filteredRecords, sortKey, sortDirection]);

  const totalRegistros = filteredRecords.length;

  const presentes = filteredRecords.filter(
    (item) => item.status === "A tiempo" || item.status === "Atrasado"
  ).length;

  const atrasos = filteredRecords.filter((item) => item.status === "Atrasado")
    .length;

  const ausentes = filteredRecords.filter((item) => item.status === "Ausente")
    .length;

  const pendientes = filteredRecords.filter(
    (item) => item.status === "Pendiente" || item.status === "Incompleto"
  ).length;

  const porcentajeAsistencia =
    totalRegistros > 0 ? Math.round((presentes / totalRegistros) * 100) : 0;

  const promedioAtraso =
    atrasos > 0
      ? Math.round(
          filteredRecords.reduce((acc, item) => acc + item.lateMinutes, 0) /
            atrasos
        )
      : 0;

  const startWeek = getWeekNumber(startDate);
  const endWeek = getWeekNumber(endDate);

  const selectedWeekText =
    startWeek === endWeek
      ? `Semana ${startWeek} del año 2026`
      : `Semana ${startWeek} a semana ${endWeek} del año 2026`;

  const asistenciaPorDiaSemana = useMemo(() => {
    const days = [
      { key: "lun", label: "LUN" },
      { key: "mar", label: "MAR" },
      { key: "mié", label: "MIÉ" },
      { key: "jue", label: "JUE" },
      { key: "vie", label: "VIE" },
      { key: "sáb", label: "SÁB" },
    ];

    return days.map((day) => {
      const dayRecords = filteredRecords.filter(
        (record) => getWeekDay(record.date) === day.key
      );

      const presentesDia = dayRecords.filter(
        (item) => item.status === "A tiempo" || item.status === "Atrasado"
      ).length;

      return {
        day: day.label,
        asistencia:
          dayRecords.length > 0
            ? Math.round((presentesDia / dayRecords.length) * 100)
            : 0,
        registros: dayRecords.length,
      };
    });
  }, [filteredRecords]);

  const topAtrasos = useMemo(() => {
    const result: Record<string, number> = {};

    filteredRecords.forEach((item) => {
      if (item.status === "Atrasado") {
        result[item.workerName] = (result[item.workerName] ?? 0) + 1;
      }
    });

    return Object.entries(result)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [filteredRecords]);

  const estadosData = useMemo(() => {
    const estados = [
      "A tiempo",
      "Atrasado",
      "Ausente",
      "Pendiente",
      "Incompleto",
    ];

    return estados.map((estado) => ({
      name: estado,
      value: filteredRecords.filter((item) => item.status === estado).length,
    }));
  }, [filteredRecords]);

  const atrasosPorTurno = useMemo(() => {
    const turnos = ["Turno Mañana", "Turno Tarde", "Turno Noche"];

    return turnos.map((turno) => ({
      turno,
      atrasos: filteredRecords.filter(
        (item) => item.shiftName === turno && item.status === "Atrasado"
      ).length,
    }));
  }, [filteredRecords]);

  const filtersContent = (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <div>
          <label className="text-sm font-medium block mb-2">Fecha inicio</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">Fecha fin</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">Estado</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none"
          >
            <option>Todos</option>
            <option>A tiempo</option>
            <option>Atrasado</option>
            <option>Ausente</option>
            <option>Pendiente</option>
            <option>Incompleto</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">Turno</label>
          <select
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none"
          >
            <option>Todos</option>
            <option>Turno Mañana</option>
            <option>Turno Tarde</option>
            <option>Turno Noche</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">Trabajador</label>
          <select
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none"
          >
            <option value="">Todos</option>
            {workersOptions.map((workerName) => (
              <option key={workerName} value={workerName}>
                {workerName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm">
        <p className="font-semibold text-primary">
          Período seleccionado: {formatDateShort(startDate)} al{" "}
          {formatDateShort(endDate)}
        </p>
        <p className="text-muted-foreground">
          Rango analizado: {selectedWeekText}
        </p>
      </div>
    </>
  );

  function RecordsTable({
    rows,
    limit,
  }: {
    rows: AttendanceRecord[];
    limit?: number;
  }) {
    const visibleRows = limit ? rows.slice(0, limit) : rows;

    const headerClass =
      "py-3 text-left font-bold cursor-pointer select-none hover:text-primary transition";

    return (
      <div className="overflow-x-auto mt-6">
        <table className="w-full text-left">
          <thead className="border-b">
            <tr className="text-muted-foreground text-sm">
              <th
                className={headerClass}
                onClick={() => handleSort("date")}
              >
                Fecha {sortIcon("date")}
              </th>

              <th
                className={headerClass}
                onClick={() => handleSort("workerName")}
              >
                Trabajador {sortIcon("workerName")}
              </th>

              <th
                className={headerClass}
                onClick={() => handleSort("shiftName")}
              >
                Turno {sortIcon("shiftName")}
              </th>

              <th
                className={headerClass}
                onClick={() => handleSort("scheduledStart")}
              >
                Horario {sortIcon("scheduledStart")}
              </th>

              <th
                className={headerClass}
                onClick={() => handleSort("checkInTime")}
              >
                Ingreso {sortIcon("checkInTime")}
              </th>

              <th
                className={headerClass}
                onClick={() => handleSort("checkOutTime")}
              >
                Salida {sortIcon("checkOutTime")}
              </th>

              <th
                className={headerClass}
                onClick={() => handleSort("status")}
              >
                Estado {sortIcon("status")}
              </th>

              <th
                className={headerClass}
                onClick={() => handleSort("lateMinutes")}
              >
                Atraso {sortIcon("lateMinutes")}
              </th>
            </tr>
          </thead>

          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.id} className="border-b">
                <td className="py-4">{formatDateCL(row.date)}</td>
                <td className="font-medium">{row.workerName}</td>
                <td>{row.shiftName}</td>
                <td>
                  {row.scheduledStart} - {row.scheduledEnd}
                </td>
                <td>{row.checkInTime ?? "--"}</td>
                <td>{row.checkOutTime ?? "--"}</td>
                <td className="font-semibold">{row.status}</td>
                <td>
                  {row.lateMinutes > 0 ? (
                    <span className="text-red-500 font-semibold">
                      {row.lateMinutes} min
                    </span>
                  ) : (
                    <span className="text-green-500">Sin atraso</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

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
        <section className="rounded-2xl border bg-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Dashboard Analítico RRHH</h2>
          </div>

          {filtersContent}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Asistencia período
              </p>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-3xl font-black mt-4">
              {porcentajeAsistencia}%
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {presentes} de {totalRegistros} registros
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Atrasos detectados</p>
              <Clock3 className="w-5 h-5 text-yellow-500" />
            </div>
            <h3 className="text-3xl font-black mt-4">{atrasos}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Promedio {promedioAtraso} min
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Ausencias</p>
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-3xl font-black mt-4">{ausentes}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Registros sin asistencia
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Pendientes/Incompletos
              </p>
              <ClipboardList className="w-5 h-5 text-orange-500" />
            </div>
            <h3 className="text-3xl font-black mt-4">{pendientes}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Requieren revisión RRHH
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="rounded-2xl border bg-card p-6">
            <div className="mb-4">
              <h3 className="font-bold">Asistencia por día de la semana</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedWeekText}
              </p>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={asistenciaPorDiaSemana}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="day" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip
                    formatter={(value, _name, props) => [
                      `${value}%`,
                      `Asistencia (${props.payload.registros} registros)`,
                    ]}
                    labelFormatter={(label) => `Día: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="asistencia"
                    stroke="#ff5a00"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6">
            <h3 className="font-bold mb-4">Top 5 atrasos por trabajador</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topAtrasos}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 60, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={170}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="total"
                    fill="#ff5a00"
                    barSize={30}
                    radius={[0, 8, 8, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6">
            <h3 className="font-bold mb-4">Distribución de estados</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={estadosData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    label
                  >
                    {estadosData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={
                          [
                            "#16a34a",
                            "#f97316",
                            "#ef4444",
                            "#eab308",
                            "#3b82f6",
                          ][index]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6">
            <h3 className="font-bold mb-4">Atrasos por turno</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={atrasosPorTurno}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="turno" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar
                    dataKey="atrasos"
                    fill="#ff5a00"
                    barSize={80}
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
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
              Resumen general
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
            <h2 className="text-xl font-bold">Resumen de la semana actual</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Registros obtenidos desde la colección attendanceRecords.
            </p>

            {loading ? (
              <p className="py-10 text-sm text-muted-foreground">
                Cargando datos...
              </p>
            ) : sortedFilteredRecords.length === 0 ? (
              <p className="py-10 text-sm text-muted-foreground">
                No existen registros para los filtros seleccionados.
              </p>
            ) : (
              <RecordsTable rows={sortedFilteredRecords} limit={20} />
            )}
          </section>
        ) : (
          <section className="rounded-2xl border bg-card p-6">
            <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-xl font-bold">Historial de marcajes</h2>
                <p className="text-sm text-muted-foreground">
                  Consulta registros históricos y ordénalos por cualquier columna.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() =>
                    exportToCSV(sortedFilteredRecords, "historial-marcajes-rrhh")
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
                      sortedFilteredRecords,
                      "Historial de marcajes RRHH"
                    )
                  }
                >
                  <FileText className="w-4 h-4" />
                  Exportar PDF
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-4 mb-6">
              {filtersContent}
            </div>

            {sortedFilteredRecords.length === 0 ? (
              <p className="py-10 text-sm text-muted-foreground">
                No existen marcajes para los filtros seleccionados.
              </p>
            ) : (
              <RecordsTable rows={sortedFilteredRecords} />
            )}
          </section>
        )}
      </section>
    </main>
  );
}