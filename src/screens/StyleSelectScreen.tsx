import { CircleCheck, Clapperboard, Film, Music2 } from "lucide-react";
import {
  APP_NAME,
  EMPTY_VIDEO_MESSAGE,
  STYLE_DESCRIPTIONS,
  STYLE_LABELS,
} from "../config";
import {
  FEED_STYLES,
  type FeedStyle,
  type TestVideo,
} from "../features/short-feed/types";
import type { LucideIcon } from "lucide-react";

const STYLE_ICONS: Record<FeedStyle, LucideIcon> = {
  reels: Clapperboard,
  shorts: Film,
  tiktok: Music2,
};

type StyleSelectScreenProps = {
  videos: TestVideo[];
  selected: FeedStyle | null;
  onSelect: (style: FeedStyle) => void;
  onConfirm: () => void;
};

export function StyleSelectScreen({
  videos,
  selected,
  onSelect,
  onConfirm,
}: StyleSelectScreenProps) {
  const hasVideos = videos.length > 0;

  return (
    <div className="select-screen">
      <header className="select-header">
        <span className="select-badge">MVP</span>
        <h1>{APP_NAME}</h1>
        <p className="select-subtitle">피드 스타일을 선택하세요</p>
      </header>

      <div
        className="select-grid"
        role="radiogroup"
        aria-label="피드 스타일 선택"
      >
        {FEED_STYLES.map((style) => {
          const Icon = STYLE_ICONS[style];
          const isSelected = selected === style;
          return (
            <button
              key={style}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`style-card${isSelected ? " is-selected" : ""}`}
              onClick={() => onSelect(style)}
            >
              <span className="style-card-icon">
                <Icon size={24} aria-hidden="true" />
              </span>
              <span className="style-card-title">{STYLE_LABELS[style]}</span>
              <span className="style-card-desc">
                {STYLE_DESCRIPTIONS[style]}
              </span>
              <span className="style-card-check" aria-hidden="true">
                {isSelected ? <CircleCheck size={20} /> : null}
              </span>
            </button>
          );
        })}
      </div>

      <footer className="select-footer">
        {hasVideos ? (
          <p className="select-count">
            테스트 동영상 <strong>{videos.length}개</strong> 발견 · 무한 순환
            재생
          </p>
        ) : (
          <p className="select-count is-empty">{EMPTY_VIDEO_MESSAGE}</p>
        )}
        <button
          type="button"
          className="confirm-btn"
          disabled={!selected || !hasVideos}
          onClick={onConfirm}
        >
          확인
        </button>
      </footer>
    </div>
  );
}
