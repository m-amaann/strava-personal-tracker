import {
  Activity,
  Flame,
  HeartPulse,
  Mountain,
  Timer,
  Zap,
} from "lucide-react";

import { Card } from "@/components/ui/card";

import type { StravaActivity } from "@/lib/strava/types";

interface RunStatsProps {
  run: StravaActivity;
}

function formatDuration(
  seconds: number,
) {
  const hours =
    Math.floor(seconds / 3600);

  const minutes =
    Math.floor(
      (seconds % 3600) / 60,
    );

  const remaining =
    seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}:${remaining
    .toString()
    .padStart(2, "0")}`;
}

function formatPace(
  distance: number,
  movingTime: number,
) {
  if (
    distance <= 0 ||
    movingTime <= 0
  ) {
    return "—";
  }

  const minutesPerKm =
    movingTime /
    60 /
    (distance / 1000);

  const minutes =
    Math.floor(minutesPerKm);

  const seconds =
    Math.round(
      (minutesPerKm - minutes) *
        60,
    );

  return `${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

export function RunStats({
  run,
}: RunStatsProps) {
  const stats = [
    {
      label: "Distance",
      value: (
        run.distance / 1000
      ).toFixed(2),
      unit: "km",
      icon: Activity,
    },
    {
      label: "Moving Time",
      value: formatDuration(
        run.moving_time,
      ),
      unit: "",
      icon: Timer,
    },
    {
      label: "Avg Pace",
      value: formatPace(
        run.distance,
        run.moving_time,
      ),
      unit: "/km",
      icon: Zap,
    },
    {
      label: "Avg Heart Rate",
      value:
        run.average_heartrate !=
        null
          ? String(
              Math.round(
                run.average_heartrate,
              ),
            )
          : "—",
      unit:
        run.average_heartrate !=
        null
          ? "bpm"
          : "",
      icon: HeartPulse,
    },
    {
      label: "Elevation Gain",
      value: String(
        Math.round(
          run.total_elevation_gain,
        ),
      ),
      unit: "m",
      icon: Mountain,
    },
    {
      label: "Calories",
      value:
        run.calories != null
          ? String(
              Math.round(
                run.calories,
              ),
            )
          : "—",
      unit:
        run.calories != null
          ? "kcal"
          : "",
      icon: Flame,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <Card
            key={stat.label}
            className="border-border/70 bg-card p-4"
          >
            <Icon className="size-4 text-[#FC4C02]" />

            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-xl font-bold tracking-tight">
                {stat.value}
              </span>

              {stat.unit && (
                <span className="text-xs font-medium text-muted-foreground">
                  {stat.unit}
                </span>
              )}
            </div>

            <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {stat.label}
            </p>
          </Card>
        );
      })}
    </div>
  );
}