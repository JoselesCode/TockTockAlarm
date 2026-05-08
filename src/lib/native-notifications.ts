import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import type { Alarm, Shift } from "@/lib/app-state";

const CHANNELS = {
  suave: "tocktockalarm_suave_v2",
  normal: "tocktockalarm_normal_v2",
  fuerte: "tocktockalarm_fuerte_v2",
} as const;

const ACTION_TYPE_ID = "TOCKTOCK_ALARM_ACTIONS";

function makeNotificationId(alarmId: string, day: number) {
  let hash = day + 1;
  for (let i = 0; i < alarmId.length; i++) {
    hash = (hash * 31 + alarmId.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function getNextDateForDayAndTime(day: number, time: string) {
  const [hour, minute] = time.split(":").map(Number);
  const now = new Date();

  const target = new Date();
  target.setHours(hour, minute, 0, 0);

  const today = now.getDay();
  let diff = day - today;

  if (diff < 0 || (diff === 0 && target <= now)) {
    diff += 7;
  }

  target.setDate(now.getDate() + diff);
  return target;
}

export async function setupAlarmNotifications() {
  if (!Capacitor.isNativePlatform()) return;

  const permission = await LocalNotifications.checkPermissions();

  if (permission.display !== "granted") {
    const requested = await LocalNotifications.requestPermissions();

    if (requested.display !== "granted") {
      throw new Error("Permiso de notificaciones denegado");
    }
  }

  await LocalNotifications.registerActionTypes({
    types: [
      {
        id: ACTION_TYPE_ID,
        actions: [
          {
            id: "dismiss",
            title: "Desactivar",
            destructive: true,
          },
          {
            id: "snooze",
            title: "Posponer 5 min",
          },
        ],
      },
    ],
  });

  await LocalNotifications.createChannel({
    id: CHANNELS.suave,
    name: "Alarmas suaves",
    description: "Alarmas suaves de TockTockAlarm",
    importance: 5,
    visibility: 1,
    vibration: true,
    sound: "faaah.mp3",
  });

  await LocalNotifications.createChannel({
    id: CHANNELS.normal,
    name: "Alarmas normales",
    description: "Alarmas normales de TockTockAlarm",
    importance: 5,
    visibility: 1,
    vibration: true,
    sound: "faaah.mp3",
  });

  await LocalNotifications.createChannel({
    id: CHANNELS.fuerte,
    name: "Alarmas fuertes",
    description: "Alarmas fuertes de TockTockAlarm",
    importance: 5,
    visibility: 1,
    vibration: true,
    sound: "faaah.mp3",
  });
}

export async function scheduleAlarmNotification(alarm: Alarm, shift?: Shift) {
  if (!Capacitor.isNativePlatform()) return;
  if (!alarm.enabled) return;

  await setupAlarmNotifications();

  const days = alarm.days.length > 0 ? alarm.days : [new Date().getDay()];
  const soundMode = alarm.soundMode ?? "normal";
  const channelId = CHANNELS[soundMode];

  await LocalNotifications.schedule({
    notifications: days.map((day) => ({
      id: makeNotificationId(alarm._id, day),
      title: "⏰ TockTockAlarm",
      body: `${alarm.label || "Alarma"}${shift ? ` · ${shift.name}` : ""}`,
      largeBody: `Es momento de prepararte para tu turno. Alarma: ${
        alarm.label || "Sin etiqueta"
      }.`,
      summaryText: "Recordatorio de turno",
      channelId,
      actionTypeId: ACTION_TYPE_ID,
      ongoing: true,
      autoCancel: false,
      schedule: {
        at: getNextDateForDayAndTime(day, alarm.time),
        repeats: true,
        allowWhileIdle: true,
      },
      extra: {
        alarmId: alarm._id,
        shiftId: alarm.shiftId,
        day,
      },
    })),
  });
}

export async function scheduleSnoozeNotification(
  alarmId: string,
  shiftId?: string,
  label = "Alarma pospuesta"
) {
  if (!Capacitor.isNativePlatform()) return;

  await setupAlarmNotifications();

  await LocalNotifications.schedule({
    notifications: [
      {
        id: Math.floor(Date.now() / 1000),
        title: "⏰ TockTockAlarm",
        body: `${label} · Pospuesta 5 minutos`,
        channelId: CHANNELS.fuerte,
        actionTypeId: ACTION_TYPE_ID,
        ongoing: true,
        autoCancel: false,
        schedule: {
          at: new Date(Date.now() + 5 * 60 * 1000),
          allowWhileIdle: true,
        },
        extra: {
          alarmId,
          shiftId,
          snooze: true,
        },
      },
    ],
  });
}

export async function cancelAlarmNotification(alarm: Alarm) {
  if (!Capacitor.isNativePlatform()) return;

  const days = alarm.days.length > 0 ? alarm.days : [0, 1, 2, 3, 4, 5, 6];

  await LocalNotifications.cancel({
    notifications: days.map((day) => ({
      id: makeNotificationId(alarm._id, day),
    })),
  });
}

export async function syncAlarmNotifications(alarms: Alarm[], shifts: Shift[]) {
  if (!Capacitor.isNativePlatform()) return;

  await setupAlarmNotifications();

  for (const alarm of alarms) {
    await cancelAlarmNotification(alarm);

    if (alarm.enabled) {
      const shift = shifts.find((s) => s._id === alarm.shiftId);
      await scheduleAlarmNotification(alarm, shift);
    }
  }
}