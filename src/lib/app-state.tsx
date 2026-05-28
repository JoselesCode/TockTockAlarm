import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  applyWeeklyRotation,
  DEFAULT_ROTATION_CONFIG,
  type RotationConfig,
} from "@/lib/weekly-rotation";
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
import {
  getUserRotationConfig,
  saveUserRotationConfig,
} from "@/lib/firebase/rotation";
import {
  cancelAlarmNotification,
  cancelAllAlarmNotifications,
  scheduleAlarmNotification,
  syncAlarmNotifications,
} from "@/lib/native-notifications";

export type Shift = {
  _id: string;
  name: string;
  icon: string;
  color: string;
  startTime: string;
  endTime: string;
  order: number;
  isActive: boolean;
  isDefault?: boolean;
  canDelete?: boolean;
};

export type AlarmSoundMode = "suave" | "normal" | "fuerte";
export type AlarmVibrationMode = "suave" | "normal" | "fuerte";
export type AlarmToneMode = "alarma01" | "alarma02" | "alarma03";

export type Alarm = {
  _id: string;
  shiftId: string;
  label: string;
  time: string;
  days: number[];
  enabled: boolean;
  soundMode?: AlarmSoundMode;
  vibrationMode?: AlarmVibrationMode;
  toneMode?: AlarmToneMode;
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
  rotationConfig: RotationConfig;
  createShift: (
    input: Omit<Shift, "_id" | "order" | "isActive">
  ) => Promise<void>;
  updateShift: (
    id: string,
    input: Partial<Omit<Shift, "_id" | "order">>
  ) => Promise<void>;
  removeShift: (id: string) => Promise<void>;
  setShiftActive: (id: string, isActive: boolean) => Promise<void>;
  initDefaultShifts: () => Promise<void>;
  saveRotationSettings: (config: RotationConfig) => Promise<void>;
  createAlarm: (input: Omit<Alarm, "_id" | "enabled">) => Promise<void>;
  updateAlarm: (
    id: string,
    input: Partial<Omit<Alarm, "_id" | "shiftId">>
  ) => Promise<void>;
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
    isDefault: shift.isDefault ?? false,
    canDelete: shift.canDelete ?? true,
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
    soundMode: alarm.soundMode ?? "normal",
    vibrationMode: alarm.vibrationMode ?? "normal",
    toneMode: alarm.toneMode ?? "alarma01",
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
  const [rotationConfig, setRotationConfig] =
    useState<RotationConfig>(DEFAULT_ROTATION_CONFIG);

  const uidValue = user?.uid ?? "";

  useEffect(() => {
    async function loadFirestoreData() {
      if (isAuthLoading) return;

      if (!isAuthenticated || !uidValue) {
        setShifts([]);
        setAlarms([]);
        setAttendance([]);
        setRotationConfig(DEFAULT_ROTATION_CONFIG);
        await cancelAllAlarmNotifications();
        return;
      }

      try {
        const [
          loadedShifts,
          loadedAlarms,
          loadedAttendance,
          loadedRotationConfig,
        ] = await Promise.all([
          getUserShifts(uidValue),
          getUserAlarms(uidValue),
          getUserAttendance(uidValue),
          getUserRotationConfig(uidValue),
        ]);

        const finalRotationConfig =
          loadedRotationConfig ?? DEFAULT_ROTATION_CONFIG;

        const mappedShifts = applyWeeklyRotation(
          loadedShifts.map(mapShift),
          finalRotationConfig
        );
        const mappedAlarms = loadedAlarms.map(mapAlarm);
        const mappedAttendance = loadedAttendance.map(mapAttendance);

        setShifts(mappedShifts);
        setAlarms(mappedAlarms);
        setAttendance(mappedAttendance);
        setRotationConfig(finalRotationConfig);

        await syncAlarmNotifications(mappedAlarms, mappedShifts);
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
      rotationConfig,

      createShift: async (input) => {
        if (!uidValue) return;

        const currentShifts = await getUserShifts(uidValue);

        const newShift = {
          ...input,
          order: currentShifts.length,
          isActive: false,
        };

        await createUserShift(uidValue, newShift);

        const updatedShifts = await getUserShifts(uidValue);
        const mappedShifts = applyWeeklyRotation(
          updatedShifts.map(mapShift),
          rotationConfig
        );

        setShifts(mappedShifts);
        await syncAlarmNotifications(alarms, mappedShifts);
      },

      updateShift: async (id, input) => {
        if (!uidValue) return;

        await updateUserShift(uidValue, id, input);

        const updatedShifts = await getUserShifts(uidValue);
        const mappedShifts = applyWeeklyRotation(
          updatedShifts.map(mapShift),
          rotationConfig
        );

        setShifts(mappedShifts);
        await syncAlarmNotifications(alarms, mappedShifts);
      },

      removeShift: async (id) => {
        if (!uidValue) return;

        const currentAlarms = await getUserAlarms(uidValue);
        const alarmsToDelete = currentAlarms.filter(
          (alarm) => alarm.shiftId === id
        );

        for (const alarm of alarmsToDelete) {
          if (alarm._id) {
            const mappedAlarm = mapAlarm(alarm);
            await cancelAlarmNotification(mappedAlarm);
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
            await updateUserShift(uidValue, shift._id, {
              order: shift.order,
            });
          }
        }

        const [finalShifts, finalAlarms] = await Promise.all([
          getUserShifts(uidValue),
          getUserAlarms(uidValue),
        ]);

        const mappedShifts = applyWeeklyRotation(
          finalShifts.map(mapShift),
          rotationConfig
        );
        const mappedAlarms = finalAlarms.map(mapAlarm);

        setShifts(mappedShifts);
        setAlarms(mappedAlarms);

        await syncAlarmNotifications(mappedAlarms, mappedShifts);
      },

      setShiftActive: async (id, isActive) => {
        if (!uidValue) return;

        const currentShifts = await getUserShifts(uidValue);
        const mappedCurrentShifts = currentShifts.map(mapShift);

        if (!isActive) {
          const updatedShifts = mappedCurrentShifts.map((shift) => ({
            ...shift,
            isActive: false,
          }));

          for (const shift of currentShifts) {
            if (shift._id) {
              await updateUserShift(uidValue, shift._id, {
                isActive: false,
              });
            }
          }

          setShifts(updatedShifts);
          await cancelAllAlarmNotifications();

          return;
        }

        const currentOrder =
          rotationConfig.rotationOrder.length > 0
            ? rotationConfig.rotationOrder
            : ["turno-a", "turno-b", "turno-c"];

        const newRotationOrder = [
          id,
          ...currentOrder.filter((shiftId) => shiftId !== id),
        ];

        const newConfig = {
          ...rotationConfig,
          configured: true,
          rotationOrder: newRotationOrder,
          startDate: new Date().toISOString().slice(0, 10),
        };

        await saveUserRotationConfig(uidValue, newConfig);

        setRotationConfig(newConfig);

        const mappedShifts = applyWeeklyRotation(mappedCurrentShifts, newConfig);

        setShifts(mappedShifts);

        await syncAlarmNotifications(alarms, mappedShifts);
},

      initDefaultShifts: async () => {
        if (!uidValue) return;

        const existingShifts = await getUserShifts(uidValue);

        if (existingShifts.length > 0) {
          const mappedShifts = applyWeeklyRotation(
            existingShifts.map(mapShift),
            rotationConfig
          );

          setShifts(mappedShifts);
          await syncAlarmNotifications(alarms, mappedShifts);
          return;
        }

        const defaults = getDefaultShifts();

        for (const shift of defaults) {
          await createUserShift(uidValue, shift);
        }

        const loadedShifts = await getUserShifts(uidValue);
        const mappedShifts = applyWeeklyRotation(
          loadedShifts.map(mapShift),
          rotationConfig
        );

        setShifts(mappedShifts);
        await syncAlarmNotifications(alarms, mappedShifts);
      },

      saveRotationSettings: async (config) => {
        if (!uidValue) return;

        await saveUserRotationConfig(uidValue, config);

        setRotationConfig(config);

        const updatedShifts = applyWeeklyRotation(shifts, config);

        setShifts(updatedShifts);

        await syncAlarmNotifications(alarms, updatedShifts);
      },

      createAlarm: async (input) => {
        if (!uidValue) return;

        await createUserAlarm(uidValue, {
          ...input,
          enabled: true,
        });

        const updatedAlarms = await getUserAlarms(uidValue);
        const mappedAlarms = updatedAlarms.map(mapAlarm);

        setAlarms(mappedAlarms);

        const newAlarm = mappedAlarms[mappedAlarms.length - 1];
        const shift = shifts.find((s) => s._id === newAlarm?.shiftId);

        if (newAlarm) {
          await scheduleAlarmNotification(newAlarm, shift);
        }
      },

      updateAlarm: async (id, input) => {
        if (!uidValue) return;

        const oldAlarm = alarms.find((a) => a._id === id);

        if (oldAlarm) {
          await cancelAlarmNotification(oldAlarm);
        }

        await updateUserAlarm(uidValue, id, input);

        const updatedAlarms = await getUserAlarms(uidValue);
        const mappedAlarms = updatedAlarms.map(mapAlarm);
        const updatedAlarm = mappedAlarms.find((a) => a._id === id);
        const shift = shifts.find((s) => s._id === updatedAlarm?.shiftId);

        setAlarms(mappedAlarms);

        if (updatedAlarm?.enabled) {
          await scheduleAlarmNotification(updatedAlarm, shift);
        }
      },

      removeAlarm: async (id) => {
        if (!uidValue) return;

        const alarmToDelete = alarms.find((a) => a._id === id);

        if (alarmToDelete) {
          await cancelAlarmNotification(alarmToDelete);
        }

        await deleteUserAlarm(uidValue, id);

        const updatedAlarms = await getUserAlarms(uidValue);
        const mappedAlarms = updatedAlarms.map(mapAlarm);

        setAlarms(mappedAlarms);
      },

      getAlarmsByShift: (shiftId) =>
        alarms.filter((a) => a.shiftId === shiftId),

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
    [shifts, alarms, attendance, rotationConfig, uidValue]
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);

  if (!ctx) {
    throw new Error("useAppState must be used within AppStateProvider");
  }

  return ctx;
}