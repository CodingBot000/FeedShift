import { Component, type ErrorInfo, type ReactNode } from "react";

type ErrorBoundaryProps = { children: ReactNode };
type ErrorBoundaryState = { error: Error | null };

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ShortFeedLab] 렌더링 오류:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="fatal-error" role="alert">
          <h1>문제가 발생했습니다.</h1>
          <p>{this.state.error.message}</p>
          <button type="button" onClick={() => window.location.reload()}>
            새로고침
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
