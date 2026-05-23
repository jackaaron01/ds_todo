"use client";

import { Component } from "react";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex justify-center pt-20">
            <div className="w-full max-w-[560px] px-4 text-center">
              <div className="text-4xl mb-3 opacity-40">⚠️</div>
              <p className="text-[var(--text-secondary)] text-sm">
                出了点问题，请刷新页面重试。
              </p>
              <button
                onClick={() => {
                  this.setState({ hasError: false });
                  window.location.reload();
                }}
                className="mt-3 px-4 py-2 rounded-full text-xs font-semibold text-white
                           bg-[var(--accent)] hover:bg-[var(--accent-hover)]
                           transition-all duration-200"
              >
                刷新页面
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
