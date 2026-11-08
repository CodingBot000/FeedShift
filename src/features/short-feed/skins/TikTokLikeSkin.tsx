import {
  Bookmark,
  Disc3,
  Heart,
  House,
  MessageCircle,
  Music2,
  Plus,
  Search,
  Share2,
  User,
} from "lucide-react";
import type { SkinProps } from "../types";
import { ActionButton, AvatarCircle, formatCount } from "./parts";

export function TikTokLikeSkin({
  video,
  fixture,
  liked,
  bookmarked,
  onLike,
  onBookmark,
  onComment,
  onShare,
}: SkinProps) {
  return (
    <div className="skin skin-tiktok">
      <nav className="tiktok-tabs" aria-label="피드 탭">
        <button type="button">Following</button>
        <button type="button" className="is-current">
          For You
        </button>
      </nav>

      <aside className="action-rail rail-tiktok" aria-label="영상 액션">
        <div className="tiktok-avatar">
          <AvatarCircle name={fixture.creator} size={44} />
          <span className="tiktok-follow" aria-hidden="true">
            +
          </span>
        </div>
        <ActionButton
          icon={Heart}
          label="좋아요"
          active={liked}
          filled
          count={formatCount(fixture.likeCount)}
          onClick={onLike}
        />
        <ActionButton
          icon={MessageCircle}
          label="댓글"
          count={formatCount(fixture.commentCount)}
          onClick={onComment}
        />
        <ActionButton
          icon={Bookmark}
          label="저장"
          active={bookmarked}
          filled
          onClick={onBookmark}
        />
        <ActionButton icon={Share2} label="공유" onClick={onShare} />
        <span className="tiktok-disc" aria-hidden="true">
          <Disc3 size={38} />
        </span>
      </aside>

      <div className="bottom-info info-tiktok">
        <p className="creator-name">{fixture.creator}</p>
        <p className="video-caption">{fixture.caption}</p>
        <div className="audio-row">
          <Music2 size={14} aria-hidden="true" />
          <span className="audio-label">
            {fixture.audioLabel} — {video.title}
          </span>
        </div>
      </div>

      <nav className="bottom-nav nav-tiktok" aria-hidden="true">
        <span className="is-current">
          <House size={21} />
        </span>
        <span>
          <Search size={21} />
        </span>
        <span>
          <Plus size={21} />
        </span>
        <span>
          <User size={21} />
        </span>
      </nav>
    </div>
  );
}
