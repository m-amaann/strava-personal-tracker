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

/* -------------------------------------------------------------------------- */
/* Date helpers                                                               */
/* -------------------------------------------------------------------------- */

function getStartOfWeek(date: Date) {
  const result = new Date(date);

  const day = result.getDay();

  const difference =
    day === 0 ? 6 : day - 1;

  result.setDate(
    result.getDate() - difference,
  );

  result.setHours(0, 0, 0, 0);

  return result;
}

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
/* -------------------------------------------------------------------------- */

function formatDistance(meters: number) {
  if (
    !Number.isFinite(meters) ||
    meters <= 0
  ) {
    return "0.00";
  }

  return (meters / 1000).toFixed(2);
}

function formatDuration(seconds: number) {
  if (
    !Number.isFinite(seconds) ||
    seconds < 0
  ) {
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

/* -------------------------------------------------------------------------- */
/* Pace                                                                       */
/* -------------------------------------------------------------------------- */

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

  const kilometers =
    distance / 1000;

  const secondsPerKm =
    movingTime / kilometers;

  let minutes = Math.floor(
    secondsPerKm / 60,
  );

  let seconds = Math.round(
    secondsPerKm % 60,
  );

  if (seconds === 60) {
    minutes += 1;
    seconds = 0;
  }

  return `${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

/* -------------------------------------------------------------------------- */
/* Percentage change                                                          */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Weekly Summary                                                             */
/* -------------------------------------------------------------------------- */

export async function WeeklySummary() {
  const activities: StravaActivity[] = [];

  try {
    const currentWeekStart = getStartOfWeek(new Date());

    const previousWeekStart = new Date(currentWeekStart);

    previousWeekStart.setDate(previousWeekStart.getDate() - 7);

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

      /*
       * Strava returns activities newest
       * first. Once the oldest activity
       * on the current page is older than
       * the previous week, no more pages
       * are required.
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

  /* ------------------------------------------------------------------------ */
  /* Week boundaries                                                          */
  /* ------------------------------------------------------------------------ */

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

  /* ------------------------------------------------------------------------ */
  /* Current week runs                                                        */
  /* ------------------------------------------------------------------------ */

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

  /* ------------------------------------------------------------------------ */
  /* Previous week runs                                                       */
  /* ------------------------------------------------------------------------ */

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

  /* ------------------------------------------------------------------------ */
  /* Distance                                                                 */
  /* ------------------------------------------------------------------------ */

  const currentDistance =
    currentRuns.reduce(
      (total, activity) =>
        total + activity.distance,
      0,
    );

  const previousDistance =
    previousRuns.reduce(
      (total, activity) =>
        total + activity.distance,
      0,
    );

  /* ------------------------------------------------------------------------ */
  /* Moving time                                                              */
  /* ------------------------------------------------------------------------ */

  const currentTime =
    currentRuns.reduce(
      (total, activity) =>
        total +
        activity.moving_time,
      0,
    );

  /* ------------------------------------------------------------------------ */
  /* Comparison                                                               */
  /* ------------------------------------------------------------------------ */

  const change =
    percentageChange(
      currentDistance,
      previousDistance,
    );

  const distanceDifference =
    (currentDistance -
      previousDistance) /
    1000;

  /* ------------------------------------------------------------------------ */
  /* Pace                                                                     */
  /* ------------------------------------------------------------------------ */

  const pace = formatPace(
    currentTime,
    currentDistance,
  );

  /* ------------------------------------------------------------------------ */
  /* UI                                                                       */
  /* ------------------------------------------------------------------------ */

  return (
    <Card
      className="
        relative
        overflow-hidden
        rounded-2xl
        border
        border-border/70
        bg-card
        shadow-none
      "
    >
      {/* Decorative circle */}

      <div
        className="
          pointer-events-none
          absolute
          -right-16
          -top-20
          size-52
          rounded-full
          bg-[#FC4C02]/5
        "
      />

      <div
        className="
          relative
          p-4
          sm:p-5
          md:p-6
        "
      >
        {/* ================================================================ */}
        {/* HEADER                                                           */}
        {/* ================================================================ */}

        <div
          className="
            flex
            items-start
            justify-between
            gap-4
          "
        >
          <div>
            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.16em]
                text-muted-foreground
              "
            >
              This Week
            </p>

            <p
              className="
                mt-1
                text-[11px]
                text-muted-foreground
                sm:text-xs
              "
            >
              Running distance
            </p>
          </div>

          {/* Week comparison */}

          <div
            className={`
              flex
              shrink-0
              items-center
              gap-1
              rounded-full
              px-2.5
              py-1.5
              text-[10px]
              font-semibold
              ${
                change >= 0
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                  : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
              }
            `}
          >
            {change >= 0 ? (
              <TrendingUp className="size-3" />
            ) : (
              <TrendingDown className="size-3" />
            )}

            {Math.abs(change).toFixed(
              1,
            )}
            %
          </div>
        </div>

        {/* ================================================================ */}
        {/* DISTANCE                                                          */}
        {/* ================================================================ */}

        <div className="mt-5">
          <div className="flex items-baseline gap-2">
            <span
              className="
                text-4xl
                font-bold
                tracking-[-0.04em]
                text-foreground
                sm:text-5xl
              "
            >
              {formatDistance(
                currentDistance,
              )}
            </span>

            <span
              className="
                text-sm
                font-medium
                text-muted-foreground
              "
            >
              km
            </span>
          </div>

          <p
            className="
              mt-1
              text-[11px]
              text-muted-foreground
              sm:text-xs
            "
          >
            {distanceDifference >= 0
              ? "+"
              : ""}
            {distanceDifference.toFixed(
              2,
            )}{" "}
            km from last week
          </p>
        </div>

        {/* ================================================================ */}
        {/* DIVIDER                                                           */}
        {/* ================================================================ */}

        <div
          className="
            my-5
            h-px
            bg-border/70
            sm:my-6
          "
        />

        {/* ================================================================ */}
        {/* STATS                                                             */}
        {/* ================================================================ */}

        <div className="grid grid-cols-3">
          {/* ---------------------------------------------------------------- */}
          {/* Runs                                                              */}
          {/* ---------------------------------------------------------------- */}

          <div
            className="
              flex
              items-center
              gap-2
              sm:gap-3
            "
          >
            <div
              className="
                flex
                size-8
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-[#FFF1EB]
                text-[#FC4C02]
                sm:size-9
              "
            >
              <Activity
                className="
                  size-3.5
                  sm:size-4
                "
              />
            </div>

            <div className="min-w-0">
              <p
                className="
                  truncate
                  text-xs
                  font-bold
                  sm:text-sm
                "
              >
                {currentRuns.length}
              </p>

              <p
                className="
                  text-[9px]
                  text-muted-foreground
                  sm:text-[10px]
                "
              >
                Runs
              </p>
            </div>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* Time                                                              */}
          {/* ---------------------------------------------------------------- */}

          <div
            className="
              flex
              items-center
              gap-2
              border-l
              border-border/70
              pl-3
              sm:gap-3
              sm:pl-5
            "
          >
            <div
              className="
                flex
                size-8
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-violet-50
                text-violet-600
                dark:bg-violet-500/10
                dark:text-violet-400
                sm:size-9
              "
            >
              <Clock3
                className="
                  size-3.5
                  sm:size-4
                "
              />
            </div>

            <div className="min-w-0">
              <p
                className="
                  truncate
                  text-xs
                  font-bold
                  sm:text-sm
                "
              >
                {formatDuration(
                  currentTime,
                )}
              </p>

              <p
                className="
                  text-[9px]
                  text-muted-foreground
                  sm:text-[10px]
                "
              >
                Time
              </p>
            </div>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* Pace                                                              */}
          {/* ---------------------------------------------------------------- */}

          <div
            className="
              flex
              items-center
              gap-2
              border-l
              border-border/70
              pl-3
              sm:gap-3
              sm:pl-5
            "
          >
            <div
              className="
                flex
                size-8
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-[#FFF1EB]
                text-[#FC4C02]
                sm:size-9
              "
            >
              <Zap
                className="
                  size-3.5
                  sm:size-4
                "
              />
            </div>

            <div className="min-w-0">
              <p
                className="
                  truncate
                  text-xs
                  font-bold
                  sm:text-sm
                "
              >
                {pace}
              </p>

              <p
                className="
                  text-[9px]
                  text-muted-foreground
                  sm:text-[10px]
                "
              >
                Avg Pace
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}