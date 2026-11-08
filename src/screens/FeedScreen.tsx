import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Bug, Volume2, VolumeX } from "lucide-react";
import { ShortFeed } from "../features/short-feed/ShortFeed";
import { ReelsLikeSkin } from "../features/short-feed/skins/ReelsLikeSkin";
import { ShortsLikeSkin } from "../features/short-feed/skins/ShortsLikeSkin";
import { TikTokLikeSkin } from "../features/short-feed/skins/TikTokLikeSkin";
import { getVideoFixture } from "../features/short-feed/fixtures";
import { videoAt } from "../features/short-feed/window";
import type {
  FeedItemContext,
  FeedStyle,
  SkinProps,
  TestVideo,
} from "../features/short-feed/types";
import { DebugOverlay } from "../features/short-feed/DebugOverlay";
import { Toast } from "../components/Toast";

type FeedScreenProps = {
  videos: TestVideo[];
  style: FeedStyle;
  onBack: () => void;
};

async function shareVideo(video: TestVideo, notify: (message: string) => void) {
  const shareData = {
    title: `${video.title} — Short Feed Lab`,
    text: "Short Feed Lab 숏폼 피드 테스트 영상",
    url: window.location.href,
  };
  try {
    if (typeof navigator.share === "function") {
      await navigator.share(shareData);
      return;
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareData.url);
      notify("링크를 클립보드에 복사했습니다.");
      return;
    }
  } catch {
    return;
  }
  notify("이 브라우저에서는 공유를 지원하지 않습니다.");
}

export function FeedScreen({ videos, style, onBack }: FeedScreenProps) {
  const [soundOn, setSoundOn] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [debug, setDebug] = useState(
    () =>
      import.meta.env.DEV &&
      new URLSearchParams(window.location.search).has("debug"),
  );
  const [feedState, setFeedState] = useState({
    activeLogical: 0,
    windowStart: 0,
  });
  const [domStats, setDomStats] = useState({ videos: 0, playing: 0 });
  const toastTimerRef = useRef<number | undefined>(undefined);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimerRef.current !== undefined) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== undefined) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!debug) return;
    const update = () => {
      const elements = document.querySelectorAll("video");
      setDomStats({
        videos: elements.length,
        playing: [...elements].filter((el) => !el.paused && !el.ended).length,
      });
    };
    update();
    const id = window.setInterval(update, 500);
    return () => window.clearInterval(id);
  }, [debug]);

  const muted = !soundOn || audioBlocked;

  const handleActiveChange = useCallback(
    (activeLogical: number, windowStart: number) => {
      setFeedState((prev) =>
        prev.activeLogical === activeLogical && prev.windowStart === windowStart
          ? prev
          : { activeLogical, windowStart },
      );
    },
    [],
  );

  const handlePlayBlocked = useCallback(() => {
    setAudioBlocked(true);
    showToast("자동재생 정책으로 음소거 재생 중입니다. 🔊 버튼으로 소리를 켜세요.");
  }, [showToast]);

  const toggleSound = useCallback(() => {
    if (soundOn && !audioBlocked) {
      setSoundOn(false);
      return;
    }
    setSoundOn(true);
    setAudioBlocked(false);
    const activeEl = [...document.querySelectorAll("video")].find(
      (el) => !el.paused,
    );
    if (activeEl) {
      activeEl.muted = false;
      activeEl.play().catch(() => undefined);
    }
  }, [soundOn, audioBlocked]);

  const renderOverlay = useCallback(
    (base: FeedItemContext) => {
      const { video } = base;
      const skinProps: SkinProps = {
        ...base,
        fixture: getVideoFixture(video),
        liked: Boolean(likes[video.id]),
        bookmarked: Boolean(bookmarks[video.id]),
        onLike: () =>
          setLikes((prev) => ({ ...prev, [video.id]: !prev[video.id] })),
        onBookmark: () =>
          setBookmarks((prev) => ({ ...prev, [video.id]: !prev[video.id] })),
        onComment: () =>
          showToast("댓글 기능은 이번 MVP 범위에서 제외되어 있습니다."),
        onShare: () => {
          void shareVideo(video, showToast);
        },
        onMore: () => showToast("더보기 메뉴는 데모입니다."),
      };

      switch (style) {
        case "reels":
          return <ReelsLikeSkin {...skinProps} />;
        case "shorts":
          return <ShortsLikeSkin {...skinProps} />;
        case "tiktok":
          return <TikTokLikeSkin {...skinProps} />;
      }
    },
    [style, likes, bookmarks, showToast],
  );

  const activeVideo = videoAt(videos, feedState.activeLogical);

  return (
    <div className="feed-screen">
      <ShortFeed
        videos={videos}
        muted={muted}
        renderOverlay={renderOverlay}
        onActiveChange={handleActiveChange}
        onPlayBlocked={handlePlayBlocked}
      />

      <div className="feed-controls">
        <button
          type="button"
          className="round-btn"
          onClick={onBack}
          aria-label="스타일 선택으로 돌아가기"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="feed-controls-right">
          {import.meta.env.DEV ? (
            <button
              type="button"
              className={`round-btn${debug ? " is-on" : ""}`}
              onClick={() => setDebug((value) => !value)}
              aria-label="디버그 오버레이 토글"
              aria-pressed={debug}
            >
              <Bug size={20} />
            </button>
          ) : null}
          <button
            type="button"
            className="round-btn"
            onClick={toggleSound}
            aria-label={muted ? "소리 켜기" : "소리 끄기"}
            aria-pressed={!muted}
          >
            {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </div>

      {debug ? (
        <DebugOverlay
          style={style}
          activeLogical={feedState.activeLogical}
          windowStart={feedState.windowStart}
          sourceFile={activeVideo?.fileName ?? "-"}
          domVideos={domStats.videos}
          playingVideos={domStats.playing}
        />
      ) : null}

      <Toast message={toast} />
    </div>
  );
}
