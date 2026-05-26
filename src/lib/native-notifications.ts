import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import type { Alarm, Shift } from "@/lib/app-state";

const ACTION_TYPE_ID = "TOCKTOCK_ALARM_ACTIONS";

function getChannelId(alarm: Alarm) {
  const soundMode = alarm.soundMode ?? "normal";
  const toneMode = alarm.toneMode ?? "alarma01";
  return `tocktockalarm_${soundMode}_${toneMode}_v5`;
}

function getToneFile(alarm: Alarm) {
  const toneMode = alarm.toneMode ?? "alarma01";
  return `${toneMode}.mp3`;
}

function makeNotificationId(alarmId: string, day: number) {
  let hash = day + 1;

  for (let i = 0; i < alarmId.length; i++) {
    hash = (hash * 31 + alarmId.charCodeAt(i)) | 0;
  }

  return Math.abs(hash);
}

function getAlarmHour(time: string) {
  return Number(time.split(":")[0]);
}

function getAlarmMinute(time: string) {
  return Number(time.split(":")[1]);
}

export async function setupAlarmNotifications(alarm?: Alarm) {
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

  if (alarm) {
    await LocalNotifications.createChannel({
      id: getChannelId(alarm),
      name: `TockTockAlarm ${alarm.soundMode ?? "normal"} ${
        alarm.toneMode ?? "alarma01"
      }`,
      description: "Canal personalizado de alarma",
      importance: 5,
      visibility: 1,
      vibration: alarm.vibrationMode !== "suave",
      sound: getToneFile(alarm),
    });
  }
}

export async function cancelAllAlarmNotifications() {
  if (!Capacitor.isNativePlatform()) return;

  const pending = await LocalNotifications.getPending();

  if (pending.notifications.length > 0) {
    await LocalNotifications.cancel({
      notifications: pending.notifications.map((notification) => ({
        id: notification.id,
      })),
    });
  }
}

export async function scheduleAlarmNotification(alarm: Alarm, shift?: Shift) {
  if (!Capacitor.isNativePlatform()) return;
  if (!alarm.enabled) return;
  if (shift && !shift.isActive) return;

  await setupAlarmNotifications(alarm);

  const days = alarm.days.length > 0 ? alarm.days : [new Date().getDay()];
  const hour = getAlarmHour(alarm.time);
  const minute = getAlarmMinute(alarm.time);

  await LocalNotifications.schedule({
    notifications: days.map((day) => ({
      id: makeNotificationId(alarm._id, day),
      title: "⏰ TockTockAlarm",
      body: `${alarm.label || "Alarma"}${shift ? ` · ${shift.name}` : ""}`,
      largeBody: `Es momento de prepararte para tu turno. Alarma: ${
        alarm.label || "Sin etiqueta"
      }.`,
      summaryText: "Recordatorio de turno",
      channelId: getChannelId(alarm),
      actionTypeId: ACTION_TYPE_ID,
      ongoing: false,
      autoCancel: true,
      schedule: {
        on: {
          weekday: day + 1,
          hour,
          minute,
        },
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

  const defaultAlarm = {
    _id: alarmId,
    shiftId: shiftId ?? "",
    label,
    time: "00:00",
    days: [],
    enabled: true,
    soundMode: "fuerte",
    vibrationMode: "fuerte",
    toneMode: "alarma01",
  } as Alarm;

  await setupAlarmNotifications(defaultAlarm);

  await LocalNotifications.schedule({
    notifications: [
      {
        id: Math.floor(Date.now() / 1000),
        title: "⏰ TockTockAlarm",
        body: `${label} · Pospuesta 5 minutos`,
        channelId: getChannelId(defaultAlarm),
        actionTypeId: ACTION_TYPE_ID,
        ongoing: false,
        autoCancel: true,
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

  await cancelAllAlarmNotifications();

  for (const alarm of alarms) {
    if (!alarm.enabled) continue;

    const shift = shifts.find((s) => s._id === alarm.shiftId);

    if (!shift?.isActive) continue;

    await scheduleAlarmNotification(alarm, shift);
  }
}