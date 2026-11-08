import type { TestVideo, VideoFixture } from "./types";

const CREATORS = ["demo_lab", "feed_test", "sample_loop", "short_feed_lab"];
const CAPTIONS = [
  "테스트 콘텐츠입니다. 빠른 스와이프 성능을 확인하세요.",
  "숏폼 피드 엔진 성능 검증용 샘플 영상.",
  "DOM video 개수와 preload 상태를 debug overlay에서 확인할 수 있습니다.",
  "무한 순환과 자동재생 상태를 확인하는 테스트 영상입니다.",
  "모바일에서 위로 밀어 다음 영상으로 이동하세요.",
];
const AUDIO_LABELS = ["original sound", "sample audio", "demo track"];
const FOLLOWERS = ["12.4K", "3,218", "98.1K", "540"];

function hashString(value: string): number {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 33) ^ value.charCodeAt(i);
  }
  return hash >>> 0;
}

function pick<T>(list: T[], seed: number): T {
  return list[seed % list.length];
}

export function getVideoFixture(video: TestVideo): VideoFixture {
  const seed = hashString(video.fileName);
  return {
    creator: `@${pick(CREATORS, seed)}`,
    likeCount: 48 + (seed % 9800),
    commentCount: 3 + (seed % 420),
    caption: pick(CAPTIONS, seed >> 3),
    audioLabel: pick(AUDIO_LABELS, seed >> 5),
  };
}

export function getFollowerLabel(video: TestVideo): string {
  return pick(FOLLOWERS, hashString(video.id) >> 7);
}
