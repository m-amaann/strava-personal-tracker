import {
  Activity,
  Gauge,
  HeartPulse,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { Card } from "@/components/ui/card";

interface ProgressSummaryProps {
  distance: number | null;
  pace: number | null;
  heartRate: number | null;
  distanceChange?: number | null;
  trend?: "improving" | "declining" | "stable" | null;
}

function formatPace(value: number | null) {
  if (
    value === null ||
    !Number.isFinite(value)
  ) {
    return "--:--";
  }

  const minutes = Math.floor(value);

  const seconds = Math.round(
    (value - minutes) * 60,
  );

  if (seconds === 60) {
    return `${minutes + 1}:00`;
  }

  return `${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

function formatDistance(
  value: number | null,
) {
  if (
    value === null ||
    !Number.isFinite(value)
  ) {
    return "—";
  }

  return value.toFixed(1);
}

function formatHeartRate(
  value: number | null,
) {
  if (
    value === null ||
    !Number.isFinite(value)
  ) {
    return "—";
  }

  return Math.round(value);
}

export function ProgressSummary({
  distance,
  pace,
  heartRate,
  distanceChange = null,
  trend = null,
}: ProgressSummaryProps) {
  const trendLabel =
    trend === "improving"
      ? "Improving"
      : trend === "declining"
        ? "Declining"
        : trend === "stable"
          ? "Stable"
          : "—";

  const TrendIcon =
    trend === "declining"
      ? TrendingDown
      : TrendingUp;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      {/* Distance */}
      <Card className="border-border/70 p-4">
        <div className="flex size-9 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          <Activity className="size-4" />
        </div>

        <p className="mt-4 text-2xl font-bold tracking-tight">
          {formatDistance(distance)}

          <span className="ml-1 text-sm font-medium text-muted-foreground">
            km
          </span>
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          Running distance
        </p>

        {distanceChange !== null && (
          <div
            className={[
              "mt-2 flex items-center gap-1",
              "text-[10px] font-semibold",
              distanceChange >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400",
            ].join(" ")}
          >
            <TrendIcon className="size-3" />

            {Math.abs(distanceChange).toFixed(1)}%
          </div>
        )}
      </Card>

      {/* Pace */}
      <Card className="border-border/70 p-4">
        <div className="flex size-9 items-center justify-center rounded-full bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
          <Gauge className="size-4" />
        </div>

        <p className="mt-4 text-2xl font-bold tracking-tight">
          {formatPace(pace)}

          <span className="ml-1 text-sm font-medium text-muted-foreground">
            /km
          </span>
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          Average pace
        </p>
      </Card>

      {/* Heart rate */}
      <Card className="border-border/70 p-4">
        <div className="flex size-9 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
          <HeartPulse className="size-4" />
        </div>

        <p className="mt-4 text-2xl font-bold tracking-tight">
          {formatHeartRate(heartRate)}

          <span className="ml-1 text-sm font-medium text-muted-foreground">
            bpm
          </span>
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          Average heart rate
        </p>
      </Card>

      {/* Trend */}
      {trend !== null && (
        <Card className="border-border/70 p-4">
          <div className="flex size-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            <TrendIcon className="size-4" />
          </div>

          <p className="mt-4 text-2xl font-bold tracking-tight">
            {trendLabel}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Overall trend
          </p>
        </Card>
      )}
    </div>
  );
}