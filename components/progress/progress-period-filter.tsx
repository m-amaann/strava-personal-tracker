"use client";

import {
  progressPeriods,
  type ProgressPeriod,
} from "@/lib/progress";

interface ProgressPeriodFilterProps {
  value: ProgressPeriod;
  onChange: (value: ProgressPeriod) => void;
}

export function ProgressPeriodFilter({
  value,
  onChange,
}: ProgressPeriodFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {progressPeriods.map((period) => {
        const active = value === period.id;

        return (
          <button
            key={period.id}
            type="button"
            onClick={() => onChange(period.id)}
            aria-pressed={active}
            className={[
              "shrink-0 rounded-full px-4 py-2",
              "text-xs font-semibold",
              "transition-all duration-200",
              "focus-visible:outline-none",
              "focus-visible:ring-2",
              "focus-visible:ring-[#FC4C02]/40",
              active
                ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900"
                : [
                    "border border-border",
                    "bg-card text-muted-foreground",
                    "hover:border-[#FC4C02]/40",
                    "hover:text-[#FC4C02]",
                  ].join(" "),
            ].join(" ")}
          >
            {period.label}
          </button>
        );
      })}
    </div>
  );
}