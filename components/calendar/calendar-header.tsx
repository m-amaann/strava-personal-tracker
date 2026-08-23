"use client";

import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react";

interface CalendarHeaderProps {
  month: string;
  year: number;
  activityCount: number;
  onPrevious: () => void;
  onNext: () => void;
}

export function CalendarHeader({
  month,
  year,
  activityCount,
  onPrevious,
  onNext,
}: CalendarHeaderProps) {
  return (
    <div className="flex h-16 items-center justify-between border-b border-border/60 px-4 sm:h-17.5 sm:px-5">
      <button
        type="button"
        onClick={onPrevious}
        aria-label="Previous month"
        className="
          flex size-8 items-center justify-center
          rounded-full
          text-muted-foreground
          transition-all duration-200
          hover:bg-muted
          hover:text-foreground
          active:scale-90
        "
      >
        <ChevronLeft className="size-4" />
      </button>

      <div className="flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-full bg-[#FFF1EB] text-[#FC4C02]">
          <CalendarDays className="size-3.5" />
        </div>

        <div className="text-center">
          <h2 className="text-sm font-bold">
            {month} {year}
          </h2>

          <p className="text-[9px] text-muted-foreground">
            {activityCount} activities
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onNext}
        aria-label="Next month"
        className="
          flex size-8 items-center justify-center
          rounded-full
          text-muted-foreground
          transition-all duration-200
          hover:bg-muted
          hover:text-foreground
          active:scale-90
        "
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}