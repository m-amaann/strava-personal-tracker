import Link from "next/link";

import {
  Activity,
  Clock3,
  HeartPulse,
  Mountain,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { RunMapPreview } from "@/components/runs/run-map-preview";

import type { StravaActivity } from "@/lib/strava/types";

interface RunCardProps {
  run: StravaActivity;
}

/**
 * Strava-style distance display.
 *
 * Strava activity distance is returned in meters.
 * We truncate to 2 decimal places when displaying km.
 *
 * Example:
 * 5045 meters -> 5.04 km
 */
function formatDistance(meters: number): string {
  if (!Number.isFinite(meters) || meters < 0) {
    return "0.00";
  }

  const kilometers = meters / 1000;

  const truncated =
    Math.floor(kilometers * 100) / 100;

  return truncated.toFixed(2);
}

/**
 * Format activity date using the local activity timestamp.
 */
function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );
}

/**
 * Format Strava moving time.
 *
 * 1960 seconds -> 32:40
 * 3660 seconds -> 1h 1m
 */
function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "—";
  }

  const hours = Math.floor(seconds / 3600);

  const minutes = Math.floor(
    (seconds % 3600) / 60,
  );

  const remainingSeconds =
    seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes
      .toString()
      .padStart(2, "0")}m`;
  }

  return `${minutes}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

/**
 * Format average pace from the actual
 * Strava distance and moving time.
 *
 * Strava stores:
 * distance    -> meters
 * moving_time -> seconds
 *
 * Example:
 * 5045 meters + 1960 seconds
 * -> approximately 6:28 /km
 *
 * We truncate the displayed pace to seconds
 * rather than rounding up.
 */
function formatPace(
  distance: number,
  movingTime: number,
): string {
  if (
    !Number.isFinite(distance) ||
    !Number.isFinite(movingTime) ||
    distance <= 0 ||
    movingTime <= 0
  ) {
    return "—";
  }

  const kilometers = distance / 1000;

  const secondsPerKm =
    movingTime / kilometers;

  const minutes = Math.floor(
    secondsPerKm / 60,
  );

  const seconds = Math.floor(
    secondsPerKm % 60,
  );

  return `${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

export function RunCard({
  run,
}: RunCardProps) {
  /*
   * These values come directly from the
   * Strava activity returned by the API.
   */
  const distance = formatDistance(
    run.distance,
  );

  const pace = formatPace(
    run.distance,
    run.moving_time,
  );

  const duration = formatDuration(
    run.moving_time,
  );

  const heartRate =
    run.average_heartrate != null
      ? `${Math.round(
          run.average_heartrate,
        )} bpm`
      : "—";

  const elevation =
    Math.round(
      run.total_elevation_gain,
    );

  const calories =
    run.calories != null
      ? Math.round(run.calories)
      : null;

  return (
    <Link
      href={`/runs/${run.id}`}
      className="group block"
    >
      <Card className="overflow-hidden border-border/70 bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FC4C02]/30 hover:shadow-md">
        <div className="flex flex-col sm:flex-row">

          {/* Map */}
          <div className="h-44 w-full shrink-0 sm:h-auto sm:w-52">
            <RunMapPreview
              polyline={
                run.map?.summary_polyline
              }
            />
          </div>

          {/* Content */}
          <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">

            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">

                <h3 className="truncate text-base font-semibold tracking-tight">
                  {run.name}
                </h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDate(
                    run.start_date_local,
                  )}
                </p>
              </div>

              <div className="shrink-0 rounded-full bg-[#FFF1EB] px-2.5 py-1 text-[10px] font-semibold text-[#FC4C02]">
                {run.sport_type ||
                  run.type}
              </div>
            </div>

            {/* Main metrics */}
            <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-4">

              {/* Distance */}
              <Metric
                icon={Activity}
                value={`${distance} km`}
                label="Distance"
              />

              {/* Avg Pace */}
              <Metric
                icon={Activity}
                value={`${pace} /km`}
                label="Avg Pace"
              />

              {/* Moving Time */}
              <Metric
                icon={Clock3}
                value={duration}
                label="Time"
              />

              {/* Avg Heart Rate */}
              <Metric
                icon={HeartPulse}
                value={heartRate}
                label="Avg HR"
              />
            </div>

            {/* Secondary metrics */}
            <div className="mt-5 flex flex-wrap items-center gap-5 border-t border-border/60 pt-4 text-xs text-muted-foreground">

              {/* Elevation */}
              <span className="flex items-center gap-1.5">
                <Mountain className="size-3.5" />

                {elevation} m elevation
              </span>

              {/* Calories */}
              {calories != null && (
                <span>
                  {calories} kcal
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

interface MetricProps {
  icon: typeof Activity;
  value: string;
  label: string;
}

function Metric({
  icon: Icon,
  value,
  label,
}: MetricProps) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5">
        <Icon className="size-3.5 text-muted-foreground" />

        <p className="truncate text-sm font-semibold">
          {value}
        </p>
      </div>

      <p className="mt-0.5 text-[10px] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}