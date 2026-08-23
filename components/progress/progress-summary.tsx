import {
  Activity,
  Gauge,
  HeartPulse,
  TrendingUp,
} from "lucide-react";

import { Card } from "@/components/ui/card";

interface ProgressSummaryProps {
  distance: number;
  pace: number;
  heartRate: number;
}

function formatPace(value: number) {
  const minutes = Math.floor(value);
  const seconds = Math.round((value - minutes) * 60);

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function ProgressSummary({
  distance,
  pace,
  heartRate,
}: ProgressSummaryProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Card className="border-border/70 p-4">
        <div className="flex size-9 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          <Activity className="size-4" />
        </div>

        <p className="mt-4 text-2xl font-bold tracking-tight">
          {distance.toFixed(1)}
          <span className="ml-1 text-sm font-medium text-muted-foreground">
            km
          </span>
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          Weekly distance
        </p>

        <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
          <TrendingUp className="size-3" />
          21.3%
        </div>
      </Card>

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

      <Card className="border-border/70 p-4">
        <div className="flex size-9 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
          <HeartPulse className="size-4" />
        </div>

        <p className="mt-4 text-2xl font-bold tracking-tight">
          {heartRate}
          <span className="ml-1 text-sm font-medium text-muted-foreground">
            bpm
          </span>
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          Average heart rate
        </p>
      </Card>

      <Card className="border-border/70 p-4">
        <div className="flex size-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
          <TrendingUp className="size-4" />
        </div>

        <p className="mt-4 text-2xl font-bold tracking-tight">
          Improving
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          Overall trend
        </p>
      </Card>
    </div>
  );
}