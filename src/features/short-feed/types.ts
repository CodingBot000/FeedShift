import type { ReactNode } from "react";

export type TestVideo = {
  id: string;
  fileName: string;
  src: string;
  title: string;
};

export type FeedStyle = "reels" | "shorts" | "tiktok";

export const FEED_STYLES: FeedStyle[] = ["reels", "shorts", "tiktok"];

export type VideoFixture = {
  creator: string;
  likeCount: number;
  commentCount: number;
  caption: string;
  audioLabel: string;
};

export type FeedItemContext = {
  video: TestVideo;
  logicalIndex: number;
  active: boolean;
  offsetFromActive: number;
};

export type FeedOverlayContext = FeedItemContext & {
  fixture: VideoFixture;
  liked: boolean;
  bookmarked: boolean;
  onLike: () => void;
  onBookmark: () => void;
  onComment: () => void;
  onShare: () => void;
  onMore: () => void;
};

export type SkinProps = FeedOverlayContext;

export type OverlayRenderer = (context: FeedItemContext) => ReactNode;
