import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Shift = {
  _id: string;
  name: string;
  icon: string;
  color: string;
  startTime: string;
  endTime: string;
  order: number;
  isActive: boolean;
};

export type Alarm = {
  _id: string;
  shiftId: string;
  label: string;
  time: string;
  days: number[];
  enabled: boolean;
};

export type AttendanceRecord = {
  _id: string;
  type: "checkin" | "checkout";
  timestamp: string;
  shiftId?: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  note?: string;
};

type AppStateValue = {
  shifts: Shift[];
  alarms: Alarm[];
  attendance: AttendanceRecord[];
  createShift: (input: Omit<Shift, "_id" | "order" | "isActive">) => void;
  updateShift: (id: string, input: Partial<Omit<Shift, "_id" | "order">>) => void;
  removeShift: (id: string) => void;
  setShiftActive: (id: string, isActive: boolean) => void;
  initDefaultShifts: () => void;
  createAlarm: (input: Omit<Alarm, "_id" | "enabled">) => void;
  updateAlarm: (id: string, input: Partial<Omit<Alarm, "_id" | "shiftId">>) => void;
  removeAlarm: (id: string) => void;
  getAlarmsByShift: (shiftId: string) => Alarm[];
  recordAttendance: (input: Omit<AttendanceRecord, "_id" | "timestamp">) => void;
  removeAttendance: (id: string) => void;
};

const STORAGE_KEY = "tocktockalarm.local.v1";

const AppStateContext = createContext<AppStateValue | null>(null);

function uid(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function getDefaultShifts(): Shift[] {
  return [
    {
      _id: uid("shift"),
      name: "Turno Mañana",
      icon: "sun",
      color: "amber",
      startTime: "05:00",
      endTime: "13:00",
      order: 0,
      isActive: true,
    },
    {
      _id: uid("shift"),
      name: "Turno Tarde",
      icon: "sunset",
      color: "orange",
      startTime: "13:00",
      endTime: "21:00",
      order: 1,
      isActive: false,
    },
    {
      _id: uid("shift"),
      name: "Turno Noche",
      icon: "moon",
      color: "indigo",
      startTime: "21:00",
      endTime: "05:00",
      order: 2,
      isActive: false,
    },
  ];
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as {
        shifts?: Shift[];
        alarms?: Alarm[];
        attendance?: AttendanceRecord[];
      };
      setShifts(parsed.shifts ?? []);
      setAlarms(parsed.alarms ?? []);
      setAttendance(parsed.attendance ?? []);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ shifts, alarms, attendance }));
  }, [shifts, alarms, attendance]);

  const value = useMemo<AppStateValue>(
    () => ({
      shifts,
      alarms,
      attendance,
      createShift: (input) => {
        setShifts((prev) => [
          ...prev,
          {
            _id: uid("shift"),
            order: prev.length,
            isActive: prev.length === 0,
            ...input,
          },
        ]);
      },
      updateShift: (id, input) => {
        setShifts((prev) => prev.map((s) => (s._id === id ? { ...s, ...input } : s)));
      },
      removeShift: (id) => {
        setShifts((prev) => prev.filter((s) => s._id !== id).map((s, idx) => ({ ...s, order: idx })));
        setAlarms((prev) => prev.filter((a) => a.shiftId !== id));
      },
      setShiftActive: (id, isActive) => {
        setShifts((prev) =>
          prev.map((s) => ({
            ...s,
            isActive: isActive ? s._id === id : s._id === id ? false : s.isActive,
          }))
        );
      },
      initDefaultShifts: () => {
        setShifts((prev) => (prev.length > 0 ? prev : getDefaultShifts()));
      },
      createAlarm: (input) => {
        setAlarms((prev) => [...prev, { _id: uid("alarm"), enabled: true, ...input }]);
      },
      updateAlarm: (id, input) => {
        setAlarms((prev) => prev.map((a) => (a._id === id ? { ...a, ...input } : a)));
      },
      removeAlarm: (id) => {
        setAlarms((prev) => prev.filter((a) => a._id !== id));
      },
      getAlarmsByShift: (shiftId) => alarms.filter((a) => a.shiftId === shiftId),
      recordAttendance: (input) => {
        setAttendance((prev) => [
          { _id: uid("att"), timestamp: new Date().toISOString(), ...input },
          ...prev,
        ]);
      },
      removeAttendance: (id) => {
        setAttendance((prev) => prev.filter((r) => r._id !== id));
      },
    }),
    [shifts, alarms, attendance]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return ctx;
}
