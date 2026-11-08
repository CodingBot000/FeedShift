import {
  Bookmark,
  Ellipsis,
  Heart,
  House,
  MessageCircle,
  Plus,
  Search,
  Share2,
  User,
} from "lucide-react";
import type { SkinProps } from "../types";
import { ActionButton, AvatarCircle, formatCount } from "./parts";

export function ReelsLikeSkin({
  video,
  fixture,
  liked,
  bookmarked,
  onLike,
  onBookmark,
  onComment,
  onShare,
  onMore,
}: SkinProps) {
  return (
    <div className="skin skin-reels">
      <nav className="reels-tabs" aria-label="피드 탭">
        <button type="button">Following</button>
        <span className="reels-tab-divider" aria-hidden="true" />
        <button type="button" className="is-current">
          For You
        </button>
      </nav>

      <aside className="action-rail rail-reels" aria-label="영상 액션">
        <ActionButton
          icon={Heart}
          label="좋아요"
          active={liked}
          filled
          onClick={onLike}
        />
        <ActionButton icon={MessageCircle} label="댓글" onClick={onComment} />
        <ActionButton icon={Share2} label="공유" onClick={onShare} />
        <ActionButton
          icon={Bookmark}
          label="저장"
          active={bookmarked}
          filled
          onClick={onBookmark}
        />
        <ActionButton icon={Ellipsis} label="더보기" onClick={onMore} />
      </aside>

      <div className="bottom-info info-reels">
        <div className="creator-row">
          <AvatarCircle name={fixture.creator} size={30} />
          <span className="creator-name">{fixture.creator}</span>
          <span className="follow-chip">팔로우</span>
        </div>
        <p className="video-title">{video.title}</p>
        <p className="video-caption">{fixture.caption}</p>
        <p className="like-count">
          좋아요 {formatCount(fixture.likeCount)}개 · 댓글{" "}
          {formatCount(fixture.commentCount)}개
        </p>
      </div>

      <nav className="bottom-nav nav-reels" aria-hidden="true">
        <span className="is-current">
          <House size={22} />
        </span>
        <span>
          <Search size={22} />
        </span>
        <span>
          <Plus size={22} />
        </span>
        <span>
          <User size={22} />
        </span>
      </nav>
    </div>
  );
}
