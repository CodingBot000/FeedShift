import { describe, expect, it } from "vitest";
import {
  CENTER_SLOT,
  FEED_WINDOW_SIZE,
  clampSlot,
  logicalForSlot,
  nearestSlotFromScroll,
  positiveModulo,
  slotForLogical,
  videoAt,
  windowStartFor,
} from "./window";
import type { TestVideo } from "./types";

const videos: TestVideo[] = ["a.mp4", "b.mp4", "c.mp4", "d.mp4"].map(
  (fileName) => ({
    id: fileName,
    fileName,
    src: `/test-generated/${fileName}`,
    title: fileName.replace(".mp4", ""),
  }),
);

describe("positiveModulo", () => {
  it("wraps negative logical indexes", () => {
    expect(positiveModulo(-1, 4)).toBe(3);
    expect(positiveModulo(-4, 4)).toBe(0);
    expect(positiveModulo(5, 4)).toBe(1);
  });

  it("handles empty lists", () => {
    expect(positiveModulo(3, 0)).toBe(0);
  });
});

describe("videoAt", () => {
  it("cycles through the source videos", () => {
    expect(videoAt(videos, 0)?.fileName).toBe("a.mp4");
    expect(videoAt(videos, 4)?.fileName).toBe("a.mp4");
    expect(videoAt(videos, -1)?.fileName).toBe("d.mp4");
    expect(videoAt(videos, 9)?.fileName).toBe("b.mp4");
  });

  it("returns undefined when there are no videos", () => {
    expect(videoAt([], 0)).toBeUndefined();
  });
});

describe("window math", () => {
  it("centers the active index", () => {
    expect(windowStartFor(10)).toBe(10 - CENTER_SLOT);
    expect(slotForLogical(10, windowStartFor(10))).toBe(CENTER_SLOT);
  });

  it("maps slots back to logical indexes", () => {
    expect(logicalForSlot(-3, 0)).toBe(-3);
    expect(logicalForSlot(-3, FEED_WINDOW_SIZE - 1)).toBe(
      -3 + FEED_WINDOW_SIZE - 1,
    );
  });

  it("clamps slots into the rendered window", () => {
    expect(clampSlot(-5)).toBe(0);
    expect(clampSlot(99)).toBe(FEED_WINDOW_SIZE - 1);
  });
});

describe("nearestSlotFromScroll", () => {
  it("rounds scroll offset to the nearest page", () => {
    expect(nearestSlotFromScroll(0, 800)).toBe(0);
    expect(nearestSlotFromScroll(799, 800)).toBe(1);
    expect(nearestSlotFromScroll(3200, 800)).toBe(4);
  });

  it("never exceeds the rendered window", () => {
    expect(nearestSlotFromScroll(99999, 800)).toBe(FEED_WINDOW_SIZE - 1);
  });

  it("guards against invalid heights", () => {
    expect(nearestSlotFromScroll(400, 0)).toBe(0);
  });
});
