import type { Shift } from "@/lib/app-state";

export type RotationConfig = {
  configured: boolean;
  rotationOrder: string[];
  startDate: string;
};

export const DEFAULT_ROTATION_CONFIG: RotationConfig = {
  configured: false,
  rotationOrder: ["Turno-A", "Turno-B", "Turno-C"],
  startDate: new Date().toISOString().slice(0, 10),
};

function getStartOfWeek(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);

  return copy;
}

function getWeeksBetween(startDate: Date, currentDate: Date) {
  const startWeek = getStartOfWeek(startDate);
  const currentWeek = getStartOfWeek(currentDate);

  const diffMs = currentWeek.getTime() - startWeek.getTime();
  return Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
}

export function applyWeeklyRotation(
  shifts: Shift[],
  rotationConfig?: RotationConfig | null
) {
  const config = rotationConfig ?? DEFAULT_ROTATION_CONFIG;

  const validRotationOrder = config.rotationOrder.filter((shiftId) =>
    shifts.some((shift) => shift._id === shiftId)
  );

  const finalRotationOrder =
    validRotationOrder.length > 0
      ? validRotationOrder
      : ["Turno-A", "Turno-B", "Turno-C"];

  const weeksPassed = getWeeksBetween(
    new Date(config.startDate),
    new Date()
  );

  const activeIndex =
    ((weeksPassed % finalRotationOrder.length) + finalRotationOrder.length) %
    finalRotationOrder.length;

  const activeShiftId = finalRotationOrder[activeIndex];

  return shifts.map((shift) => ({
    ...shift,
    isActive: shift._id === activeShiftId,
  }));
}

export function getCurrentRotationWeekNumber(rotationConfig?: RotationConfig | null) {
  const config = rotationConfig ?? DEFAULT_ROTATION_CONFIG;

  return getWeeksBetween(new Date(config.startDate), new Date()) + 1;
}

export function getCurrentRotationShiftId(rotationConfig: RotationConfig, shifts: Shift[]) {
  const rotatedShifts = applyWeeklyRotation(shifts, rotationConfig);
  return rotatedShifts.find((shift) => shift.isActive)?._id ?? null;
}