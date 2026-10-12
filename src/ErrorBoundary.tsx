import React from "react";
import { Button } from "@/components/ui/button";

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <div role="alert" className="p-8 sm:p-12 text-center space-y-4">
          <h1 className="text-xl font-bold text-slate-900">
            画面を読み込めませんでした
          </h1>
          <p className="text-sm text-slate-500">
            ページを再読み込みして、もう一度お試しください。
          </p>
          <Button onClick={() => location.reload()}>ページを再読み込み</Button>
        </div>
      );
    return this.props.children;
  }
}
