import { FEED_WINDOW_SIZE } from "./window";
import type { FeedStyle } from "./types";

type DebugOverlayProps = {
  style: FeedStyle;
  activeLogical: number;
  windowStart: number;
  sourceFile: string;
  domVideos: number;
  playingVideos: number;
};

export function DebugOverlay({
  style,
  activeLogical,
  windowStart,
  sourceFile,
  domVideos,
  playingVideos,
}: DebugOverlayProps) {
  return (
    <aside className="debug-overlay" aria-label="개발 디버그 정보">
      <p className="debug-title">DEV MODE</p>
      <dl>
        <div>
          <dt>active logicalIndex</dt>
          <dd>{activeLogical}</dd>
        </div>
        <div>
          <dt>source</dt>
          <dd>{sourceFile}</dd>
        </div>
        <div>
          <dt>render window</dt>
          <dd>
            {windowStart} … {windowStart + FEED_WINDOW_SIZE - 1}
          </dd>
        </div>
        <div>
          <dt>DOM video count</dt>
          <dd>{domVideos}</dd>
        </div>
        <div>
          <dt>playing count</dt>
          <dd>{playingVideos}</dd>
        </div>
        <div>
          <dt>preload</dt>
          <dd>active auto / +1 auto / +2 metadata / -1 metadata</dd>
        </div>
        <div>
          <dt>style</dt>
          <dd>{style}</dd>
        </div>
      </dl>
    </aside>
  );
}
