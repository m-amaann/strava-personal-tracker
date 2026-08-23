import { MetricCard } from "./metric-card";

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

function getStartOfYear(date: Date) {
  return new Date(
    date.getFullYear(),
    0,
    1,
  );
}

function formatPace(
  movingTime: number,
  distance: number,
) {
  if (
    movingTime <= 0 ||
    distance <= 0
  ) {
    return "—";
  }

  const secondsPerKm =
    movingTime / (distance / 1000);

  const minutes = Math.floor(
    secondsPerKm / 60,
  );

  const seconds = Math.round(
    secondsPerKm % 60,
  );

  if (seconds === 60) {
    return `${minutes + 1}:00`;
  }

  return `${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

function paceInSeconds(
  movingTime: number,
  distance: number,
) {
  if (
    movingTime <= 0 ||
    distance <= 0
  ) {
    return 0;
  }

  return movingTime / (distance / 1000);
}

function formatPaceDifference(
  current: number,
  previous: number,
) {
  if (
    current <= 0 ||
    previous <= 0
  ) {
    return "—";
  }

  const difference =
    current - previous;

  const absolute =
    Math.abs(difference);

  const minutes = Math.floor(
    absolute / 60,
  );

  const seconds = Math.round(
    absolute % 60,
  );

  const formatted =
    `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;

  if (difference < 0) {
    return `-${formatted}`;
  }

  if (difference > 0) {
    return `+${formatted}`;
  }

  return "0:00";
}

function formatHeartRate(
  value: number,
) {
  if (!Number.isFinite(value)) {
    return "—";
  }

  return Math.round(value).toString();
}

function formatElevation(
  meters: number,
) {
  return Math.round(meters).toString();
}

function formatDate(
  value: string,
) {
  return new Date(
    value,
  ).toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "short",
      day: "numeric",
    },
  );
}

async function getRelevantActivities() {
  const now = new Date();

  const currentWeekStart =
    getStartOfWeek(now);

  const previousWeekStart =
    new Date(currentWeekStart);

  previousWeekStart.setDate(
    previousWeekStart.getDate() - 7,
  );

  const yearStart =
    getStartOfYear(now);

  const activities: StravaActivity[] =
    [];

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
     * Strava returns activities
     * newest first.
     *
     * Once we reach activities
     * older than the beginning
     * of this year, there is no
     * reason to fetch more pages.
     */
    const oldestActivity =
      pageActivities[
        pageActivities.length - 1
      ];

    if (
      oldestActivity &&
      new Date(
        oldestActivity.start_date_local,
      ) < yearStart
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

  return {
    activities,
    currentWeekStart,
    previousWeekStart,
    yearStart,
  };
}

function isBetween(
  date: Date,
  start: Date,
  end: Date,
) {
  return (
    date >= start &&
    date < end
  );
}

export async function MetricGrid() {
  let currentRuns: StravaActivity[] =
    [];

  let previousRuns: StravaActivity[] =
    [];

  let yearRuns: StravaActivity[] =
    [];

  try {
    const {
      activities,
      currentWeekStart,
      previousWeekStart,
      yearStart,
    } =
      await getRelevantActivities();

    const currentWeekEnd =
      new Date(
        currentWeekStart,
      );

    currentWeekEnd.setDate(
      currentWeekEnd.getDate() + 7,
    );

    const previousWeekEnd =
      new Date(
        currentWeekStart,
      );

    currentRuns =
      activities.filter(
        (activity) => {
          if (
            !isRunningActivity(
              activity,
            )
          ) {
            return false;
          }

          const date = new Date(
            activity.start_date_local,
          );

          return isBetween(
            date,
            currentWeekStart,
            currentWeekEnd,
          );
        },
      );

    previousRuns =
      activities.filter(
        (activity) => {
          if (
            !isRunningActivity(
              activity,
            )
          ) {
            return false;
          }

          const date = new Date(
            activity.start_date_local,
          );

          return isBetween(
            date,
            previousWeekStart,
            previousWeekEnd,
          );
        },
      );

    yearRuns =
      activities.filter(
        (activity) => {
          if (
            !isRunningActivity(
              activity,
            )
          ) {
            return false;
          }

          const date = new Date(
            activity.start_date_local,
          );

          return date >= yearStart;
        },
      );
  } catch (error) {
    console.error(
      "Failed to fetch dashboard metrics:",
      error,
    );
  }

  /*
   * ------------------------------------------------
   * CURRENT WEEK
   * ------------------------------------------------
   */

  const currentDistance =
    currentRuns.reduce(
      (total, run) =>
        total + run.distance,
      0,
    );

  const currentMovingTime =
    currentRuns.reduce(
      (total, run) =>
        total + run.moving_time,
      0,
    );

  const currentElevation =
    currentRuns.reduce(
      (total, run) =>
        total +
        (run.total_elevation_gain ?? 0),
      0,
    );

  /*
   * ------------------------------------------------
   * PREVIOUS WEEK
   * ------------------------------------------------
   */

  const previousDistance =
    previousRuns.reduce(
      (total, run) =>
        total + run.distance,
      0,
    );

  const previousMovingTime =
    previousRuns.reduce(
      (total, run) =>
        total + run.moving_time,
      0,
    );

  /*
   * ------------------------------------------------
   * AVG PACE
   *
   * Weighted:
   *
   * total moving time
   * -----------------
   * total distance
   *
   * This is better than averaging
   * the pace of individual runs.
   * ------------------------------------------------
   */

  const currentPaceSeconds =
    paceInSeconds(
      currentMovingTime,
      currentDistance,
    );

  const previousPaceSeconds =
    paceInSeconds(
      previousMovingTime,
      previousDistance,
    );

  const currentPace =
    formatPace(
      currentMovingTime,
      currentDistance,
    );

  const paceChange =
    formatPaceDifference(
      currentPaceSeconds,
      previousPaceSeconds,
    );

  /*
   * ------------------------------------------------
   * AVG HEART RATE
   *
   * Weighted by moving time.
   * ------------------------------------------------
   */

  const runsWithHeartRate =
    currentRuns.filter(
      (run) =>
        run.average_heartrate !=
          null &&
        run.moving_time > 0,
    );

  const totalHeartRateTime =
    runsWithHeartRate.reduce(
      (total, run) =>
        total + run.moving_time,
      0,
    );

  const weightedHeartRate =
    runsWithHeartRate.reduce(
      (total, run) =>
        total +
        (run.average_heartrate ?? 0) *
          run.moving_time,
      0,
    );

  const currentHeartRate =
    totalHeartRateTime > 0
      ? weightedHeartRate /
        totalHeartRateTime
      : 0;

  const previousRunsWithHeartRate =
    previousRuns.filter(
      (run) =>
        run.average_heartrate !=
          null &&
        run.moving_time > 0,
    );

  const previousHeartRateTime =
    previousRunsWithHeartRate.reduce(
      (total, run) =>
        total + run.moving_time,
      0,
    );

  const previousWeightedHeartRate =
    previousRunsWithHeartRate.reduce(
      (total, run) =>
        total +
        (run.average_heartrate ?? 0) *
          run.moving_time,
      0,
    );

  const previousHeartRate =
    previousHeartRateTime > 0
      ? previousWeightedHeartRate /
        previousHeartRateTime
      : 0;

  const heartRateDifference =
    currentHeartRate > 0 &&
    previousHeartRate > 0
      ? Math.round(
          currentHeartRate -
            previousHeartRate,
        )
      : 0;

  /*
   * ------------------------------------------------
   * ELEVATION CHANGE
   * ------------------------------------------------
   */

  const previousElevation =
    previousRuns.reduce(
      (total, run) =>
        total +
        (run.total_elevation_gain ?? 0),
      0,
    );

  const elevationDifference =
    Math.round(
      currentElevation -
        previousElevation,
    );

  /*
   * ------------------------------------------------
   * LONGEST RUN THIS YEAR
   * ------------------------------------------------
   */

  const longestRun =
    yearRuns.reduce<
      StravaActivity | null
    >(
      (longest, run) => {
        if (
          !longest ||
          run.distance >
            longest.distance
        ) {
          return run;
        }

        return longest;
      },
      null,
    );

  const longestDistance =
    longestRun
      ? longestRun.distance / 1000
      : 0;

  const longestRunDate =
    longestRun
      ? formatDate(
          longestRun.start_date_local,
        )
      : "No runs";

  /*
   * ------------------------------------------------
   * RENDER
   * ------------------------------------------------
   */

  return (
    <div className="grid grid-cols-2 gap-3">
      <MetricCard
        label="Avg Pace"
        value={currentPace}
        unit="/km"
        change={paceChange}
        changeLabel="vs last week"
        positive={
          currentPaceSeconds > 0 &&
          previousPaceSeconds > 0
            ? currentPaceSeconds <
              previousPaceSeconds
            : true
        }
      />

      <MetricCard
        label="Avg Heart Rate"
        value={formatHeartRate(
          currentHeartRate,
        )}
        unit="bpm"
        change={
          previousHeartRate > 0
            ? `${
                heartRateDifference > 0
                  ? "+"
                  : ""
              }${heartRateDifference} bpm`
            : undefined
        }
        changeLabel={
          previousHeartRate > 0
            ? "vs last week"
            : undefined
        }
        positive={
          heartRateDifference <= 0
        }
      />

      <MetricCard
        label="Elevation"
        value={formatElevation(
          currentElevation,
        )}
        unit="m"
        change={
          previousRuns.length > 0
            ? `${
                elevationDifference > 0
                  ? "+"
                  : ""
              }${elevationDifference} m`
            : undefined
        }
        changeLabel={
          previousRuns.length > 0
            ? "vs last week"
            : undefined
        }
        positive={
          elevationDifference >= 0
        }
      />

      <MetricCard
        label="Longest Run"
        value={
          longestRun
            ? longestDistance.toFixed(2)
            : "0.00"
        }
        unit="km"
        change={
          longestRun
            ? longestRunDate
            : undefined
        }
        changeLabel=""
        positive
      />
    </div>
  );
}