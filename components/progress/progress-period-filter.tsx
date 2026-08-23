"use client";

import {
  progressPeriods,
  type ProgressPeriod,
} from "@/lib/mock/progress";

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
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 ${
              active
                ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900"
                : "border border-border bg-card text-muted-foreground hover:border-blue-300 hover:text-blue-600 dark:hover:border-blue-700 dark:hover:text-blue-400"
            }`}
          >
            {period.label}
          </button>
        );
      })}
    </div>
  );
}