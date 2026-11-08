import { useEffect, useRef, useState, type ReactNode } from "react";
import { Play } from "lucide-react";
import type { TestVideo } from "./types";

type PreloadHint = "auto" | "metadata" | "none";

type ShortFeedItemProps = {
  video: TestVideo;
  logicalIndex: number;
  activeLogical: number;
  muted: boolean;
  documentVisible: boolean;
  manuallyPaused: boolean;
  preload: PreloadHint;
  registerItem: (logicalIndex: number, el: HTMLElement | null) => void;
  onTogglePlay: (logicalIndex: number) => void;
  onSkipNext: () => void;
  onPlayBlocked?: () => void;
  children: ReactNode;
};

export function ShortFeedItem({
  video,
  logicalIndex,
  activeLogical,
  muted,
  documentVisible,
  manuallyPaused,
  preload,
  registerItem,
  onTogglePlay,
  onSkipNext,
  onPlayBlocked,
  children,
}: ShortFeedItemProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const isActive = logicalIndex === activeLogical;

  useEffect(() => {
    const el = videoRef.current;
    if (el) el.muted = muted;
  }, [muted]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || failed) return;
    if (!isActive) {
      el.pause();
      if (el.currentTime !== 0) {
        try {
          el.currentTime = 0;
        } catch {
          void 0;
        }
      }
      return;
    }
    if (!documentVisible || manuallyPaused) {
      el.pause();
      return;
    }
    const attempt = el.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (!el.muted) {
          onPlayBlocked?.();
          el.muted = true;
          el.play().catch(() => undefined);
        }
      });
    }
  }, [isActive, documentVisible, manuallyPaused, failed, onPlayBlocked]);

  return (
    <section
      className="feed-item"
      data-logical={logicalIndex}
      ref={(el) => registerItem(logicalIndex, el)}
    >
      <video
        ref={videoRef}
        className="feed-video"
        src={video.src}
        preload={preload}
        playsInline
        loop
        disablePictureInPicture
        onCanPlay={() => setReady(true)}
        onError={() => {
          setFailed(true);
          console.warn(`[ShortFeed] 재생할 수 없는 영상: ${video.fileName}`);
        }}
      />
      <button
        type="button"
        className="feed-tap-layer"
        aria-label="재생 또는 일시정지"
        onClick={() => onTogglePlay(logicalIndex)}
      />
      <div className="feed-gradient" aria-hidden="true" />
      {isActive && !ready && !failed ? (
        <div className="feed-loading" role="status">
          로딩 중…
        </div>
      ) : null}
      {isActive && manuallyPaused ? (
        <div className="feed-paused" aria-hidden="true">
          <Play size={34} />
        </div>
      ) : null}
      <div className="feed-overlay">{children}</div>
      {failed ? (
        <div className="feed-error" role="alert">
          <p className="feed-error-title">이 영상을 재생할 수 없습니다.</p>
          <p className="feed-error-file">{video.fileName}</p>
          <button type="button" className="feed-error-btn" onClick={onSkipNext}>
            다음 영상으로 이동
          </button>
        </div>
      ) : null}
    </section>
  );
}
