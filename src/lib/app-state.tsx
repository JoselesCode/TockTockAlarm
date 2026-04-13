import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuthContext } from "@/components/providers/auth";
import {
  createUserShift,
  deleteUserShift,
  getUserShifts,
  updateUserShift,
} from "@/lib/firebase/shifts";
import {
  createUserAlarm,
  deleteUserAlarm,
  getUserAlarms,
  updateUserAlarm,
} from "@/lib/firebase/alarms";
import {
  createAttendanceRecord,
  deleteAttendanceRecord,
  getUserAttendance,
} from "@/lib/firebase/attendance";

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
  geofenceId?: string;
  geofenceName?: string;
  insideGeofence?: boolean;
  faceVerificationStatus?: "pending" | "verified" | "rejected" | "not_used";
  faceImageUrl?: string;
  markStatus?: "approved" | "rejected" | "manual_review";
};

type AppStateValue = {
  shifts: Shift[];
  alarms: Alarm[];
  attendance: AttendanceRecord[];
  createShift: (input: Omit<Shift, "_id" | "order" | "isActive">) => Promise<void>;
  updateShift: (id: string, input: Partial<Omit<Shift, "_id" | "order">>) => Promise<void>;
  removeShift: (id: string) => Promise<void>;
  setShiftActive: (id: string, isActive: boolean) => Promise<void>;
  initDefaultShifts: () => Promise<void>;
  createAlarm: (input: Omit<Alarm, "_id" | "enabled">) => Promise<void>;
  updateAlarm: (id: string, input: Partial<Omit<Alarm, "_id" | "shiftId">>) => Promise<void>;
  removeAlarm: (id: string) => Promise<void>;
  getAlarmsByShift: (shiftId: string) => Alarm[];
  recordAttendance: (
    input: Omit<AttendanceRecord, "_id" | "timestamp">
  ) => Promise<void>;
  removeAttendance: (id: string) => Promise<void>;
};

const AppStateContext = createContext<AppStateValue | null>(null);

function mapShift(shift: any): Shift {
  return {
    _id: shift._id ?? "",
    name: shift.name,
    icon: shift.icon,
    color: shift.color,
    startTime: shift.startTime,
    endTime: shift.endTime,
    order: shift.order,
    isActive: shift.isActive,
  };
}

function mapAlarm(alarm: any): Alarm {
  return {
    _id: alarm._id ?? "",
    shiftId: alarm.shiftId,
    label: alarm.label,
    time: alarm.time,
    days: alarm.days ?? [],
    enabled: alarm.enabled,
  };
}

function mapAttendance(record: any): AttendanceRecord {
  return {
    _id: record._id ?? "",
    type: record.type,
    timestamp: record.timestamp,
    shiftId: record.shiftId,
    latitude: record.latitude,
    longitude: record.longitude,
    accuracy: record.accuracy,
    note: record.note,
    geofenceId: record.geofenceId,
    geofenceName: record.geofenceName,
    insideGeofence: record.insideGeofence,
    faceVerificationStatus: record.faceVerificationStatus,
    faceImageUrl: record.faceImageUrl,
    markStatus: record.markStatus,
  };
}

function getDefaultShifts(): Omit<Shift, "_id">[] {
  return [
    {
      name: "Turno Mañana",
      icon: "sun",
      color: "amber",
      startTime: "05:00",
      endTime: "13:00",
      order: 0,
      isActive: true,
    },
    {
      name: "Turno Tarde",
      icon: "sunset",
      color: "orange",
      startTime: "13:00",
      endTime: "21:00",
      order: 1,
      isActive: false,
    },
    {
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
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuthContext();

  const [shifts, setShifts] = useState<Shift[]>([]);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  const uidValue = user?.uid ?? "";

  useEffect(() => {
    async function loadFirestoreData() {
      if (isAuthLoading) return;

      if (!isAuthenticated || !uidValue) {
        setShifts([]);
        setAlarms([]);
        setAttendance([]);
        return;
      }

      try {
        const [loadedShifts, loadedAlarms, loadedAttendance] = await Promise.all([
          getUserShifts(uidValue),
          getUserAlarms(uidValue),
          getUserAttendance(uidValue),
        ]);

        setShifts(loadedShifts.map(mapShift));
        setAlarms(loadedAlarms.map(mapAlarm));
        setAttendance(loadedAttendance.map(mapAttendance));
      } catch (error) {
        console.error("Error cargando datos desde Firestore:", error);
      }
    }

    void loadFirestoreData();
  }, [isAuthenticated, isAuthLoading, uidValue]);

  const value = useMemo<AppStateValue>(
    () => ({
      shifts,
      alarms,
      attendance,

      createShift: async (input) => {
        if (!uidValue) return;

        const currentShifts = await getUserShifts(uidValue);

        const newShift = {
          ...input,
          order: currentShifts.length,
          isActive: currentShifts.length === 0,
        };

        await createUserShift(uidValue, newShift);

        const updatedShifts = await getUserShifts(uidValue);
        setShifts(updatedShifts.map(mapShift));
      },

      updateShift: async (id, input) => {
        if (!uidValue) return;

        await updateUserShift(uidValue, id, input);

        const updatedShifts = await getUserShifts(uidValue);
        setShifts(updatedShifts.map(mapShift));
      },

      removeShift: async (id) => {
        if (!uidValue) return;

        const currentAlarms = await getUserAlarms(uidValue);
        const alarmsToDelete = currentAlarms.filter((alarm) => alarm.shiftId === id);

        for (const alarm of alarmsToDelete) {
          if (alarm._id) {
            await deleteUserAlarm(uidValue, alarm._id);
          }
        }

        await deleteUserShift(uidValue, id);

        const updatedShifts = await getUserShifts(uidValue);
        const reorderedShifts = updatedShifts.map((shift, index) => ({
          ...shift,
          order: index,
        }));

        for (const shift of reorderedShifts) {
          if (shift._id) {
            await updateUserShift(uidValue, shift._id, { order: shift.order });
          }
        }

        const [finalShifts, finalAlarms] = await Promise.all([
          getUserShifts(uidValue),
          getUserAlarms(uidValue),
        ]);

        setShifts(finalShifts.map(mapShift));
        setAlarms(finalAlarms.map(mapAlarm));
      },

      setShiftActive: async (id, isActive) => {
        if (!uidValue) return;

        const currentShifts = await getUserShifts(uidValue);

        if (isActive) {
          for (const shift of currentShifts) {
            if (shift._id) {
              await updateUserShift(uidValue, shift._id, {
                isActive: shift._id === id,
              });
            }
          }
        } else {
          await updateUserShift(uidValue, id, { isActive: false });
        }

        const updatedShifts = await getUserShifts(uidValue);
        setShifts(updatedShifts.map(mapShift));
      },

      initDefaultShifts: async () => {
        if (!uidValue) return;

        const existingShifts = await getUserShifts(uidValue);

        if (existingShifts.length > 0) {
          setShifts(existingShifts.map(mapShift));
          return;
        }

        const defaults = getDefaultShifts();

        for (const shift of defaults) {
          await createUserShift(uidValue, shift);
        }

        const loadedShifts = await getUserShifts(uidValue);
        setShifts(loadedShifts.map(mapShift));
      },

      createAlarm: async (input) => {
        if (!uidValue) return;

        await createUserAlarm(uidValue, {
          ...input,
          enabled: true,
        });

        const updatedAlarms = await getUserAlarms(uidValue);
        setAlarms(updatedAlarms.map(mapAlarm));
      },

      updateAlarm: async (id, input) => {
        if (!uidValue) return;

        await updateUserAlarm(uidValue, id, input);

        const updatedAlarms = await getUserAlarms(uidValue);
        setAlarms(updatedAlarms.map(mapAlarm));
      },

      removeAlarm: async (id) => {
        if (!uidValue) return;

        await deleteUserAlarm(uidValue, id);

        const updatedAlarms = await getUserAlarms(uidValue);
        setAlarms(updatedAlarms.map(mapAlarm));
      },

      getAlarmsByShift: (shiftId) => alarms.filter((a) => a.shiftId === shiftId),

      recordAttendance: async (input) => {
        if (!uidValue) return;

        await createAttendanceRecord(uidValue, {
          ...input,
          timestamp: new Date().toISOString(),
          faceVerificationStatus: input.faceVerificationStatus ?? "not_used",
          markStatus: input.markStatus ?? "approved",
        });

        const updatedAttendance = await getUserAttendance(uidValue);
        setAttendance(updatedAttendance.map(mapAttendance));
      },

      removeAttendance: async (id) => {
        if (!uidValue) return;

        await deleteAttendanceRecord(uidValue, id);

        const updatedAttendance = await getUserAttendance(uidValue);
        setAttendance(updatedAttendance.map(mapAttendance));
      },
    }),
    [shifts, alarms, attendance, uidValue]
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