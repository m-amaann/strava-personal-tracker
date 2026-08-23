"use client";

import { Menu, MoreVertical } from "lucide-react";

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-lg lg:hidden">
      <button
        type="button"
        className="flex size-10 items-center justify-center rounded-lg hover:bg-muted"
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </button>

      <div className="flex flex-col items-center leading-none">
        <span className="text-sm font-semibold tracking-tight">
          Run Performance
        </span>
      </div>

      <button
        type="button"
        className="flex size-10 items-center justify-center rounded-lg hover:bg-muted"
        aria-label="More options"
      >
        <MoreVertical className="size-5" />
      </button>
    </header>
  );
}