import type { TestVideo } from "./types";

export const FEED_WINDOW_SIZE = 7;
export const CENTER_SLOT = Math.floor(FEED_WINDOW_SIZE / 2);
export const ACTIVE_RATIO_THRESHOLD = 0.6;

export function positiveModulo(value: number, length: number): number {
  if (length <= 0) return 0;
  return ((value % length) + length) % length;
}

export function videoAt(
  videos: TestVideo[],
  logicalIndex: number,
): TestVideo | undefined {
  if (videos.length === 0) return undefined;
  return videos[positiveModulo(logicalIndex, videos.length)];
}

export function windowStartFor(logicalIndex: number): number {
  return logicalIndex - CENTER_SLOT;
}

export function logicalForSlot(windowStart: number, slot: number): number {
  return windowStart + slot;
}

export function slotForLogical(
  logicalIndex: number,
  windowStart: number,
): number {
  return logicalIndex - windowStart;
}

export function clampSlot(slot: number): number {
  return Math.min(FEED_WINDOW_SIZE - 1, Math.max(0, slot));
}

export function nearestSlotFromScroll(
  scrollTop: number,
  itemHeight: number,
): number {
  if (!Number.isFinite(itemHeight) || itemHeight <= 0) return 0;
  return clampSlot(Math.round(scrollTop / itemHeight));
}

export function resolveWindowStart(
  windowStart: number,
  activeLogical: number,
): number {
  if (activeLogical < windowStart) return windowStartFor(activeLogical);
  if (activeLogical > windowStart + FEED_WINDOW_SIZE - 1) {
    return windowStartFor(activeLogical);
  }
  return windowStart;
}
