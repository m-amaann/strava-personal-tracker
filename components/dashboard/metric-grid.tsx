import { MetricCard } from "./metric-card";

import { getActivities } from "@/lib/strava/api";

import { isRunningActivity } from "@/lib/strava/activity-utils";

import type { StravaActivity } from "@/lib/strava/types";

/* -------------------------------------------------------------------------- */
/* Configuration                                                              */
/* -------------------------------------------------------------------------- */

/*
 * Dashboard metric window.
 *
 * The cards use the last 4 weeks rather than the current
 * Monday-Sunday week.
 *
 * This prevents the cards from becoming empty just because
 * the user has not run yet in the current calendar week.
 */
const METRIC_WINDOW_DAYS = 28;

/* -------------------------------------------------------------------------- */
/* Date helpers                                                               */
/* -------------------------------------------------------------------------- */

function getStartOfDay(date: Date) {
  const result = new Date(date);

  result.setHours(
    0,
    0,
    0,
    0,
  );

  return result;
}

function getDaysAgo(
  date: Date,
  days: number,
) {
  const result = new Date(date);

  result.setDate(
    result.getDate() - days,
  );

  return result;
}

function getStartOfYear(date: Date) {
  return new Date(
    date.getFullYear(),
    0,
    1,
    0,
    0,
    0,
    0,
  );
}

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
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

  if (kilometers <= 0) {
    return "—";
  }

  const secondsPerKm =
    movingTime / kilometers;

  if (
    !Number.isFinite(
      secondsPerKm,
    ) ||
    secondsPerKm <= 0
  ) {
    return "—";
  }

  const roundedSeconds =
    Math.round(secondsPerKm);

  const minutes =
    Math.floor(
      roundedSeconds / 60,
    );

  const seconds =
    roundedSeconds % 60;

  return `${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

function paceInSeconds(
  movingTime: number,
  distance: number,
) {
  if (
    !Number.isFinite(movingTime) ||
    !Number.isFinite(distance) ||
    movingTime <= 0 ||
    distance <= 0
  ) {
    return 0;
  }

  const kilometers =
    distance / 1000;

  if (kilometers <= 0) {
    return 0;
  }

  return (
    movingTime / kilometers
  );
}

function formatPaceDifference(
  current: number,
  previous: number,
) {
  if (
    current <= 0 ||
    previous <= 0
  ) {
    return undefined;
  }

  const difference =
    current - previous;

  const absolute =
    Math.abs(difference);

  const roundedSeconds =
    Math.round(absolute);

  const minutes =
    Math.floor(
      roundedSeconds / 60,
    );

  const seconds =
    roundedSeconds % 60;

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
  value: number | null,
) {
  if (
    value === null ||
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return "—";
  }

  return Math.round(value).toString();
}

function formatElevation(
  meters: number | null,
) {
  if (
    meters === null ||
    !Number.isFinite(meters) ||
    meters <= 0
  ) {
    return "—";
  }

  return Math.round(
    meters,
  ).toString();
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

/* -------------------------------------------------------------------------- */
/* Activity fetching                                                          */
/* -------------------------------------------------------------------------- */

async function getRelevantActivities() {
  const now = new Date();

  const todayStart =
    getStartOfDay(now);

  /*
   * Current metric window:
   *
   * Last 28 days including today.
   */
  const currentWindowStart =
    getDaysAgo(
      todayStart,
      METRIC_WINDOW_DAYS - 1,
    );

  /*
   * End of current window:
   * tomorrow at midnight.
   */
  const currentWindowEnd =
    new Date(todayStart);

  currentWindowEnd.setDate(
    currentWindowEnd.getDate() + 1,
  );

  /*
   * Previous 28-day comparison window.
   */
  const previousWindowEnd =
    currentWindowStart;

  const previousWindowStart =
    getDaysAgo(
      todayStart,
      METRIC_WINDOW_DAYS * 2 - 1,
    );

  /*
   * Year start is used only for Longest Run.
   */
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
     * Strava returns activities newest first.
     *
     * Once the oldest activity on the page
     * is older than the beginning of the
     * previous comparison window, we do
     * not need additional pages.
     */
    const oldestActivity =
      pageActivities[
        pageActivities.length - 1
      ];

    if (
      oldestActivity
    ) {
      const oldestDate =
        new Date(
          oldestActivity.start_date_local,
        );

      if (
        Number.isFinite(
          oldestDate.getTime(),
        ) &&
        oldestDate <
          previousWindowStart
      ) {
        break;
      }
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
    currentWindowStart,
    currentWindowEnd,
    previousWindowStart,
    previousWindowEnd,
    yearStart,
  };
}

/* -------------------------------------------------------------------------- */
/* Date filter                                                                */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

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
      currentWindowStart,
      currentWindowEnd,
      previousWindowStart,
      previousWindowEnd,
      yearStart,
    } =
      await getRelevantActivities();

    /* ---------------------------------------------------------------------- */
    /* Current 4 weeks                                                        */
    /* ---------------------------------------------------------------------- */

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

          const date =
            new Date(
              activity.start_date_local,
            );

          if (
            !Number.isFinite(
              date.getTime(),
            )
          ) {
            return false;
          }

          return isBetween(
            date,
            currentWindowStart,
            currentWindowEnd,
          );
        },
      );

    /* ---------------------------------------------------------------------- */
    /* Previous 4 weeks                                                       */
    /* ---------------------------------------------------------------------- */

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

          const date =
            new Date(
              activity.start_date_local,
            );

          if (
            !Number.isFinite(
              date.getTime(),
            )
          ) {
            return false;
          }

          return isBetween(
            date,
            previousWindowStart,
            previousWindowEnd,
          );
        },
      );

    /* ---------------------------------------------------------------------- */
    /* Year-to-date runs                                                      */
    /* ---------------------------------------------------------------------- */

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

          const date =
            new Date(
              activity.start_date_local,
            );

          if (
            !Number.isFinite(
              date.getTime(),
            )
          ) {
            return false;
          }

          return date >= yearStart;
        },
      );
  } catch (error) {
    console.error(
      "Failed to fetch dashboard metrics:",
      error,
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Current window totals                                                    */
  /* ------------------------------------------------------------------------ */

  /*
   * Only activities with valid distance
   * and moving time contribute to pace.
   */
  const paceRuns =
    currentRuns.filter(
      (run) =>
        Number.isFinite(
          run.distance,
        ) &&
        run.distance > 0 &&
        Number.isFinite(
          run.moving_time,
        ) &&
        run.moving_time > 0,
    );

  /*
   * Total distance for weighted pace.
   */
  const currentDistance =
    paceRuns.reduce(
      (total, run) =>
        total + run.distance,
      0,
    );

  /*
   * Total moving time for weighted pace.
   */
  const currentMovingTime =
    paceRuns.reduce(
      (total, run) =>
        total + run.moving_time,
      0,
    );

  /*
   * Total elevation.
   *
   * Elevation is calculated independently
   * from pace and heart rate.
   */
  const currentElevation =
    currentRuns.reduce(
      (total, run) => {
        const elevation =
          run.total_elevation_gain;

        if (
          !Number.isFinite(
            elevation,
          ) ||
          elevation <= 0
        ) {
          return total;
        }

        return (
          total + elevation
        );
      },
      0,
    );

  /* ------------------------------------------------------------------------ */
  /* Previous window totals                                                   */
  /* ------------------------------------------------------------------------ */

  const previousPaceRuns =
    previousRuns.filter(
      (run) =>
        Number.isFinite(
          run.distance,
        ) &&
        run.distance > 0 &&
        Number.isFinite(
          run.moving_time,
        ) &&
        run.moving_time > 0,
    );

  const previousDistance =
    previousPaceRuns.reduce(
      (total, run) =>
        total + run.distance,
      0,
    );

  const previousMovingTime =
    previousPaceRuns.reduce(
      (total, run) =>
        total + run.moving_time,
      0,
    );

  const previousElevation =
    previousRuns.reduce(
      (total, run) => {
        const elevation =
          run.total_elevation_gain;

        if (
          !Number.isFinite(
            elevation,
          ) ||
          elevation <= 0
        ) {
          return total;
        }

        return (
          total + elevation
        );
      },
      0,
    );

  /* ------------------------------------------------------------------------ */
  /* Average Pace                                                             */
  /* ------------------------------------------------------------------------ */

  /*
   * Correct weighted calculation:
   *
   * total moving time
   * -----------------
   * total distance
   *
   * This prevents a short run and a long run
   * from receiving equal weight.
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

  /* ------------------------------------------------------------------------ */
  /* Average Heart Rate                                                       */
  /* ------------------------------------------------------------------------ */

  /*
   * Only runs that actually have HR data
   * are included.
   *
   * HR is weighted by moving time.
   */
  const runsWithHeartRate =
    currentRuns.filter(
      (run) =>
        Number.isFinite(
          run.average_heartrate,
        ) &&
        Number(
          run.average_heartrate,
        ) > 0 &&
        Number.isFinite(
          run.moving_time,
        ) &&
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
        Number(
          run.average_heartrate,
        ) *
          run.moving_time,
      0,
    );

  const currentHeartRate =
    totalHeartRateTime > 0
      ? weightedHeartRate /
        totalHeartRateTime
      : null;

  /*
   * Previous period HR.
   */
  const previousRunsWithHeartRate =
    previousRuns.filter(
      (run) =>
        Number.isFinite(
          run.average_heartrate,
        ) &&
        Number(
          run.average_heartrate,
        ) > 0 &&
        Number.isFinite(
          run.moving_time,
        ) &&
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
        Number(
          run.average_heartrate,
        ) *
          run.moving_time,
      0,
    );

  const previousHeartRate =
    previousHeartRateTime > 0
      ? previousWeightedHeartRate /
        previousHeartRateTime
      : null;

  const heartRateDifference =
    currentHeartRate !== null &&
    previousHeartRate !== null
      ? Math.round(
          currentHeartRate -
            previousHeartRate,
        )
      : null;

  /* ------------------------------------------------------------------------ */
  /* Elevation difference                                                     */
  /* ------------------------------------------------------------------------ */

  const elevationDifference =
    previousRuns.length > 0
      ? Math.round(
          currentElevation -
            previousElevation,
        )
      : null;

  /* ------------------------------------------------------------------------ */
  /* Longest Run                                                              */
  /* ------------------------------------------------------------------------ */

  const longestRun =
    yearRuns.reduce<
      StravaActivity | null
    >(
      (longest, run) => {
        if (
          !Number.isFinite(
            run.distance,
          ) ||
          run.distance <= 0
        ) {
          return longest;
        }

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
      : null;

  const longestRunDate =
    longestRun
      ? formatDate(
          longestRun.start_date_local,
        )
      : undefined;

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <section>
      {/* ------------------------------------------------------------------ */}
      {/* Metric window explanation                                           */}
      {/* ------------------------------------------------------------------ */}

      <p
        className="
          mb-2
          px-1
          text-[10px]
          leading-5
          text-muted-foreground
          sm:text-xs
        "
      >
        Based on your running activities
        from the last 4 weeks.
      </p>

      {/* ------------------------------------------------------------------ */}
      {/* Metrics                                                             */}
      {/* ------------------------------------------------------------------ */}

      <div
        className="
          grid
          grid-cols-1
          gap-3
          sm:grid-cols-2
        "
      >
        {/* Avg Pace */}

        <MetricCard
          label="Avg Pace"
          value={currentPace}
          unit="/km"
          change={
            paceChange
          }
          changeLabel={
            paceChange
              ? "vs previous 4 weeks"
              : undefined
          }
          positive={
            currentPaceSeconds > 0 &&
            previousPaceSeconds > 0
              ? currentPaceSeconds <
                previousPaceSeconds
              : true
          }
        />

        {/* Avg Heart Rate */}

        <MetricCard
          label="Avg Heart Rate"
          value={formatHeartRate(
            currentHeartRate,
          )}
          unit="bpm"
          change={
            heartRateDifference !==
            null
              ? `${
                  heartRateDifference >
                  0
                    ? "+"
                    : ""
                }${heartRateDifference} bpm`
              : undefined
          }
          changeLabel={
            heartRateDifference !==
            null
              ? "vs previous 4 weeks"
              : undefined
          }
          positive={
            heartRateDifference ===
            null
              ? true
              : heartRateDifference <=
                0
          }
        />

        {/* Total Elevation */}

        <MetricCard
          label="Total Elevation"
          value={formatElevation(
            currentElevation,
          )}
          unit="m"
          change={
            elevationDifference !==
            null
              ? `${
                  elevationDifference >
                  0
                    ? "+"
                    : ""
                }${elevationDifference} m`
              : undefined
          }
          changeLabel={
            elevationDifference !==
            null
              ? "vs previous 4 weeks"
              : undefined
          }
          positive={
            elevationDifference ===
            null
              ? true
              : elevationDifference >=
                0
          }
        />

        {/* Longest Run */}

        <MetricCard
          label="Longest Run"
          value={
            longestDistance !==
            null
              ? longestDistance.toFixed(
                  2,
                )
              : "—"
          }
          unit="km"
          change={
            longestRunDate
          }
          changeLabel={
            longestRunDate
              ? ""
              : undefined
          }
          positive
        />
      </div>
    </section>
  );
}