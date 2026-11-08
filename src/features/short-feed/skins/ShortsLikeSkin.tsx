import { BadgeCheck, Bookmark, Heart, MessageCircle, Share2 } from "lucide-react";
import type { SkinProps } from "../types";
import { ActionButton, formatCount } from "./parts";

export function ShortsLikeSkin({
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
    <div className="skin skin-shorts">
      <aside className="action-rail rail-shorts" aria-label="영상 액션">
        <ActionButton
          icon={Heart}
          label="Like"
          active={liked}
          filled
          showLabel
          count={formatCount(fixture.likeCount)}
          onClick={onLike}
        />
        <ActionButton
          icon={MessageCircle}
          label="Comment"
          showLabel
          count={formatCount(fixture.commentCount)}
          onClick={onComment}
        />
        <ActionButton
          icon={Bookmark}
          label="Save"
          active={bookmarked}
          filled
          showLabel
          onClick={onBookmark}
        />
        <ActionButton icon={Share2} label="Share" showLabel onClick={onShare} />
      </aside>

      <div className="bottom-info info-shorts">
        <p className="video-title">{video.title}</p>
        <p className="channel-name">
          <span>{fixture.creator}</span>
          <BadgeCheck size={15} aria-hidden="true" />
        </p>
        <p className="video-caption">{fixture.caption}</p>
      </div>
    </div>
  );
}
