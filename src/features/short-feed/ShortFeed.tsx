import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ShortFeedItem } from "./ShortFeedItem";
import type { FeedItemContext, TestVideo } from "./types";
import {
  ACTIVE_RATIO_THRESHOLD,
  CENTER_SLOT,
  FEED_WINDOW_SIZE,
  nearestSlotFromScroll,
  videoAt,
  windowStartFor,
} from "./window";

type ShortFeedProps = {
  videos: TestVideo[];
  muted: boolean;
  renderOverlay: (context: FeedItemContext) => React.ReactNode;
  onActiveChange?: (logicalIndex: number, windowStart: number) => void;
  onPlayBlocked?: () => void;
};

export function ShortFeed({
  videos,
  muted,
  renderOverlay,
  onActiveChange,
  onPlayBlocked,
}: ShortFeedProps) {
  const [activeLogical, setActiveLogical] = useState(0);
  const [windowStart, setWindowStart] = useState(() => windowStartFor(0));
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(
    () => !document.hidden,
  );

  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef(new Map<number, HTMLElement>());
  const ratiosRef = useRef(new Map<Element, number>());
  const pendingAnchorRef = useRef<{ el: Element; top: number } | null>(null);
  const activeRef = useRef(activeLogical);
  const windowStartRef = useRef(windowStart);
  const settleTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    windowStartRef.current = windowStart;
    activeRef.current = activeLogical;
  }, [windowStart, activeLogical]);

  useEffect(() => {
    onActiveChange?.(activeLogical, windowStart);
  }, [activeLogical, windowStart, onActiveChange]);

  const registerItem = useCallback(
    (logicalIndex: number, el: HTMLElement | null) => {
      if (el) itemRefs.current.set(logicalIndex, el);
      else itemRefs.current.delete(logicalIndex);
    },
    [],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const ratios = ratiosRef.current;
        for (const entry of entries) {
          ratios.set(entry.target, entry.intersectionRatio);
        }
        let best: Element | null = null;
        let bestRatio = 0;
        for (const [el, ratio] of [...ratios]) {
          if (!el.isConnected) {
            ratios.delete(el);
            continue;
          }
          if (ratio > bestRatio) {
            bestRatio = ratio;
            best = el;
          }
        }
        if (!best || bestRatio < ACTIVE_RATIO_THRESHOLD) return;
        const logical = Number((best as HTMLElement).dataset.logical);
        if (!Number.isFinite(logical) || logical === activeRef.current) return;
        setManuallyPaused(false);
        setActiveLogical(logical);
      },
      {
        root: container,
        threshold: [0, 0.25, 0.5, 0.6, 0.75, 0.9, 1],
      },
    );
    for (const el of itemRefs.current.values()) observer.observe(el);
    return () => observer.disconnect();
  }, [windowStart]);

  const handleSettle = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const itemHeight = container.clientHeight || 1;
    const slot = nearestSlotFromScroll(container.scrollTop, itemHeight);
    const logical = windowStartRef.current + slot;
    if (!Number.isFinite(logical)) return;
    if (logical !== activeRef.current) {
      setManuallyPaused(false);
      setActiveLogical(logical);
    }
    const desiredStart = windowStartFor(logical);
    if (desiredStart === windowStartRef.current) return;
    const el = itemRefs.current.get(logical) ?? null;
    pendingAnchorRef.current = el
      ? { el, top: el.getBoundingClientRect().top }
      : null;
    setWindowStart(desiredStart);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const scheduleSettle = () => {
      if (settleTimerRef.current !== undefined) {
        window.clearTimeout(settleTimerRef.current);
      }
      settleTimerRef.current = window.setTimeout(handleSettle, 140);
    };
    const onScrollEnd = () => {
      if (settleTimerRef.current !== undefined) {
        window.clearTimeout(settleTimerRef.current);
        settleTimerRef.current = undefined;
      }
      handleSettle();
    };
    container.addEventListener("scroll", scheduleSettle, { passive: true });
    container.addEventListener("scrollend", onScrollEnd);
    return () => {
      container.removeEventListener("scroll", scheduleSettle);
      container.removeEventListener("scrollend", onScrollEnd);
      if (settleTimerRef.current !== undefined) {
        window.clearTimeout(settleTimerRef.current);
      }
    };
  }, [handleSettle]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.scrollTop = CENTER_SLOT * (container.clientHeight || 1);
  }, []);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const anchor = pendingAnchorRef.current;
    pendingAnchorRef.current = null;
    if (!container || !anchor || !anchor.el.isConnected) return;
    const delta = anchor.el.getBoundingClientRect().top - anchor.top;
    if (delta !== 0) container.scrollTop += delta;
  }, [windowStart]);

  useEffect(() => {
    const onVisibilityChange = () => setDocumentVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  const togglePlayForActive = useCallback((logicalIndex: number) => {
    if (logicalIndex !== activeRef.current) return;
    setManuallyPaused((paused) => !paused);
  }, []);

  const skipToNext = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const itemHeight = container.clientHeight || 1;
    const slot = nearestSlotFromScroll(container.scrollTop, itemHeight);
    const nextSlot = Math.min(FEED_WINDOW_SIZE - 1, slot + 1);
    if (nextSlot === slot) {
      handleSettle();
      return;
    }
    container.scrollTo({ top: nextSlot * itemHeight, behavior: "smooth" });
  }, [handleSettle]);

  const items = useMemo(() => {
    const list: number[] = [];
    for (let i = 0; i < FEED_WINDOW_SIZE; i += 1) list.push(windowStart + i);
    return list;
  }, [windowStart]);

  return (
    <div className="short-feed" ref={containerRef}>
      {items.map((logical) => {
        const video = videoAt(videos, logical);
        if (!video) return null;
        const offset = logical - activeLogical;
        const preload =
          offset === 0 || offset === 1
            ? "auto"
            : offset === 2 || offset === -1
              ? "metadata"
              : "none";
        return (
          <ShortFeedItem
            key={logical}
            video={video}
            logicalIndex={logical}
            activeLogical={activeLogical}
            muted={muted}
            documentVisible={documentVisible}
            manuallyPaused={manuallyPaused}
            preload={preload}
            registerItem={registerItem}
            onTogglePlay={togglePlayForActive}
            onSkipNext={skipToNext}
            onPlayBlocked={onPlayBlocked}
          >
            {renderOverlay({
              video,
              logicalIndex: logical,
              active: offset === 0,
              offsetFromActive: offset,
            })}
          </ShortFeedItem>
        );
      })}
    </div>
  );
}
