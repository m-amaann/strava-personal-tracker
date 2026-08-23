import {
  Activity,
  Clock3,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";

import { Card } from "@/components/ui/card";

import { getActivities } from "@/lib/strava/api";

import { isRunningActivity } from "@/lib/strava/activity-utils";

import type { StravaActivity } from "@/lib/strava/types";

function getStartOfWeek(date: Date) {
  const result = new Date(date);

  const day = result.getDay();
  const difference = day === 0 ? 6 : day - 1;

  result.setDate(
    result.getDate() - difference,
  );

  result.setHours(0, 0, 0, 0);

  return result;
}

function formatDistance(meters: number) {
  if (!Number.isFinite(meters) || meters <= 0) {
    return "0.00";
  }

  return (meters / 1000).toFixed(2);
}

/**
 * Display Strava's moving_time exactly as:
 *
 * 32:40
 * 1:02:35
 *
 * We do NOT remove seconds.
 */
function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const totalSeconds = Math.round(seconds);

  const hours = Math.floor(
    totalSeconds / 3600,
  );

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60,
  );

  const remainingSeconds =
    totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }

  return `${minutes}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

/**
 * Average pace is calculated from Strava's:
 *
 * moving_time / distance
 *
 * Distance is meters.
 * Moving time is seconds.
 *
 * Result:
 * 5.05 km + 1960 seconds
 * => 6:28 /km
 */
function formatPace(
  movingTime: number,
  distance: number,
) {
  if (
    !Number.isFinite(movingTime) ||
    !Number.isFinite(distance) ||
    movingTime <= 0 ||
    distance <= 0
  ) {
    return "—";
  }

  const kilometers = distance / 1000;

  const secondsPerKm =
    movingTime / kilometers;

  const minutes = Math.floor(
    secondsPerKm / 60,
  );

  const seconds = Math.round(
    secondsPerKm % 60,
  );

  /**
   * Handle rounding such as:
   *
   * 5:59.8 -> 6:00
   */
  if (seconds === 60) {
    return `${minutes + 1}:00`;
  }

  return `${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

function percentageChange(
  current: number,
  previous: number,
) {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return (
    ((current - previous) /
      previous) *
    100
  );
}

export async function WeeklySummary() {
  const activities: StravaActivity[] = [];

  try {
    const currentWeekStart =
      getStartOfWeek(new Date());

    const previousWeekStart =
      new Date(currentWeekStart);

    previousWeekStart.setDate(
      previousWeekStart.getDate() -
        7,
    );

    let page = 1;

    while (true) {
      const pageActivities =
        await getActivities(
          page,
          200,
        );

      if (
        pageActivities.length === 0
      ) {
        break;
      }

      activities.push(
        ...pageActivities,
      );

      /**
       * Strava returns activities
       * newest first.
       *
       * Once the oldest activity
       * on this page is older than
       * the previous week, we don't
       * need to fetch more pages.
       */
      const oldest =
        pageActivities[
          pageActivities.length - 1
        ];

      if (
        oldest &&
        new Date(
          oldest.start_date_local,
        ) < previousWeekStart
      ) {
        break;
      }

      if (
        pageActivities.length < 200
      ) {
        break;
      }

      page++;
    }
  } catch (error) {
    console.error(
      "Failed to fetch weekly Strava data:",
      error,
    );
  }

  const currentWeekStart =
    getStartOfWeek(new Date());

  const nextWeekStart =
    new Date(currentWeekStart);

  nextWeekStart.setDate(
    nextWeekStart.getDate() + 7,
  );

  const previousWeekStart =
    new Date(currentWeekStart);

  previousWeekStart.setDate(
    previousWeekStart.getDate() - 7,
  );

  /**
   * Current week runs
   */
  const currentRuns =
    activities.filter(
      (activity) => {
        if (
          !isRunningActivity(activity)
        ) {
          return false;
        }

        const date = new Date(
          activity.start_date_local,
        );

        return (
          date >= currentWeekStart &&
          date < nextWeekStart
        );
      },
    );

  /**
   * Previous week runs
   */
  const previousRuns =
    activities.filter(
      (activity) => {
        if (
          !isRunningActivity(activity)
        ) {
          return false;
        }

        const date = new Date(
          activity.start_date_local,
        );

        return (
          date >= previousWeekStart &&
          date < currentWeekStart
        );
      },
    );

  /**
   * Current week distance.
   *
   * Uses Strava's activity.distance
   * directly in meters.
   */
  const currentDistance =
    currentRuns.reduce(
      (total, activity) =>
        total + activity.distance,
      0,
    );

  /**
   * Previous week distance.
   */
  const previousDistance =
    previousRuns.reduce(
      (total, activity) =>
        total + activity.distance,
      0,
    );

  /**
   * Current week moving time.
   *
   * IMPORTANT:
   * This is Strava's actual
   * moving_time value.
   *
   * Do not calculate this from
   * pace or distance.
   */
  const currentTime =
    currentRuns.reduce(
      (total, activity) =>
        total +
        activity.moving_time,
      0,
    );

  /**
   * Previous week moving time.
   */
  const previousTime =
    previousRuns.reduce(
      (total, activity) =>
        total +
        activity.moving_time,
      0,
    );

  const change =
    percentageChange(
      currentDistance,
      previousDistance,
    );

  const distanceDifference =
    (currentDistance -
      previousDistance) /
    1000;

  /**
   * Average pace for the week.
   *
   * Total moving time / total distance.
   */
  const pace = formatPace(
    currentTime,
    currentDistance,
  );

  /**
   * Keep this available if you later
   * want to show previous-week time.
   */
  void previousTime;

  return (
    <Card className="relative overflow-hidden border border-blue-100 bg-white text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-white">
      <div className="pointer-events-none absolute -right-16 -top-20 size-52 rounded-full bg-blue-500/5 dark:bg-blue-400/5" />

      <div className="relative p-5 sm:p-6 lg:p-7">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
              This Week
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Running distance
            </p>
          </div>

          <div
            className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold ${
              change >= 0
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
            }`}
          >
            {change >= 0 ? (
              <TrendingUp className="size-3.5" />
            ) : (
              <TrendingDown className="size-3.5" />
            )}

            {Math.abs(change).toFixed(1)}%
          </div>
        </div>

        {/* Distance */}
        <div className="mt-5">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold tracking-tight sm:text-5xl">
              {formatDistance(
                currentDistance,
              )}
            </span>

            <span className="text-base font-medium text-slate-500 dark:text-slate-400">
              km
            </span>
          </div>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            {distanceDifference >= 0
              ? "+"
              : ""}
            {distanceDifference.toFixed(2)}{" "}
            km from last week
          </p>
        </div>

        {/* Divider */}
        <div className="my-6 h-px bg-slate-200 dark:bg-white/10" />

        {/* Stats */}
        <div className="grid grid-cols-3">
          {/* Runs */}
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#FFF1EB] text-[#FC4C02] dark:bg-[#FC4C02]/10 dark:text-[#FF7043]">
              <Activity className="size-4" />
            </div>

            <div>
              <p className="text-sm font-bold">
                {currentRuns.length}
              </p>

              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Runs
              </p>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-center gap-2.5 border-l border-slate-200 pl-4 dark:border-white/10 sm:pl-6">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
              <Clock3 className="size-4" />
            </div>

            <div>
              <p className="text-sm font-bold">
                {formatDuration(
                  currentTime,
                )}
              </p>

              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Time
              </p>
            </div>
          </div>

          {/* Pace */}
          <div className="flex items-center gap-2.5 border-l border-slate-200 pl-4 dark:border-white/10 sm:pl-6">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#FFF1EB] text-[#FC4C02] dark:bg-[#FC4C02]/10 dark:text-[#FF7043]">
              <Zap className="size-4" />
            </div>

            <div>
              <p className="text-sm font-bold">
                {pace}
              </p>

              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Avg Pace
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}