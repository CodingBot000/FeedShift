import { useState } from "react";
import { FeedScreen } from "./screens/FeedScreen";
import { StyleSelectScreen } from "./screens/StyleSelectScreen";
import { ErrorBoundary } from "./components/ErrorBoundary";
import type { FeedStyle, TestVideo } from "./features/short-feed/types";

const testVideos: TestVideo[] = [];

export default function App() {
  const [screen, setScreen] = useState<"select" | "feed">("select");
  const [style, setStyle] = useState<FeedStyle | null>(null);

  const canEnterFeed = testVideos.length > 0;

  return (
    <ErrorBoundary>
      <div className="app-frame">
        {screen === "feed" && style && canEnterFeed ? (
          <FeedScreen
            videos={testVideos}
            style={style}
            onBack={() => setScreen("select")}
          />
        ) : (
          <StyleSelectScreen
            videos={testVideos}
            selected={style}
            onSelect={setStyle}
            onConfirm={() => {
              if (style && canEnterFeed) setScreen("feed");
            }}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
