import {
  getActivity,
  getAllRuns,
} from "@/lib/strava/api";

import type {
  StravaActivity,
  StravaBestEffort,
} from "./types";

/* -------------------------------------------------------------------------- */
/* Record Types                                                               */
/* -------------------------------------------------------------------------- */

export interface PersonalRecord {
  id: string;

  title: string;

  value: string;

  unit?: string;

  description: string;

  date: string;

  activityId: number;

  type: "effort" | "longest";
}

export interface OtherRecord {
  id: string;

  title: string;

  value: string;

  unit?: string;

  description: string;

  category:
    | "distance"
    | "pace"
    | "elevation"
    | "duration";
}

export interface StravaRecords {
  personalRecords: PersonalRecord[];

  otherRecords: OtherRecord[];
}

/* -------------------------------------------------------------------------- */
/* Effort Progress                                                            */
/* -------------------------------------------------------------------------- */

export interface EffortProgressItem {
  activityId: number;

  date: string;

  timestamp: number;

  time: number;

  formattedTime: string;

  isBest: boolean;
}

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
/* -------------------------------------------------------------------------- */

function formatEffortTime(
  seconds: number,
): string {
  const rounded =
    Math.round(seconds);

  const hours =
    Math.floor(
      rounded / 3600,
    );

  const minutes =
    Math.floor(
      (rounded % 3600) / 60,
    );

  const remaining =
    rounded % 60;

  if (hours > 0) {
    return `${hours}:${minutes
      .toString()
      .padStart(2, "0")}:${remaining
      .toString()
      .padStart(2, "0")}`;
  }

  return `${minutes}:${remaining
    .toString()
    .padStart(2, "0")}`;
}

function formatDistance(
  meters: number,
): string {
  return (
    meters / 1000
  ).toFixed(2);
}

function formatDate(
  value: string,
): string {
  return new Date(
    value,
  ).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );
}

function formatPace(
  activity: StravaActivity,
): string {
  if (
    activity.distance <= 0 ||
    activity.moving_time <= 0
  ) {
    return "—";
  }

  const secondsPerKm =
    activity.moving_time /
    (activity.distance / 1000);

  let minutes =
    Math.floor(
      secondsPerKm / 60,
    );

  let seconds =
    Math.round(
      secondsPerKm % 60,
    );

  if (seconds >= 60) {
    minutes += 1;
    seconds = 0;
  }

  return `${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

/* -------------------------------------------------------------------------- */
/* Best Effort                                                                */
/* -------------------------------------------------------------------------- */

function findBestEffort(
  efforts: StravaBestEffort[],
  names: string[],
): StravaBestEffort | null {
  const matching =
    efforts.filter(
      (effort) =>
        names.includes(
          effort.name,
        ),
    );

  if (
    matching.length === 0
  ) {
    return null;
  }

  return matching.reduce(
    (best, current) =>
      current.elapsed_time <
      best.elapsed_time
        ? current
        : best,
  );
}

/* -------------------------------------------------------------------------- */
/* Longest Run                                                                */
/* -------------------------------------------------------------------------- */

function findLongestRun(
  runs: StravaActivity[],
): StravaActivity | null {
  if (runs.length === 0) {
    return null;
  }

  return runs.reduce(
    (longest, current) =>
      current.distance >
      longest.distance
        ? current
        : longest,
  );
}

/* -------------------------------------------------------------------------- */
/* Detailed Running Activities                                                */
/* -------------------------------------------------------------------------- */

export async function getDetailedRunningActivities(): Promise<
  StravaActivity[]
> {
  const runs =
    await getAllRuns();

  /*
   * Best efforts are available from
   * Strava's detailed activity endpoint.
   *
   * Activities shorter than 1 km cannot
   * contain useful 1K/5K/10K/16K efforts.
   */
  const eligibleRuns =
    runs.filter(
      (run) =>
        run.distance >= 1000,
    );

  const detailedRuns =
    await Promise.all(
      eligibleRuns.map(
        async (run) => {
          try {
            return await getActivity(
              run.id,
            );
          } catch (error) {
            console.error(
              `Failed to fetch detailed activity ${run.id}:`,
              error,
            );

            return null;
          }
        },
      ),
    );

  return detailedRuns.filter(
    (
      activity,
    ): activity is StravaActivity =>
      activity !== null,
  );
}

/* -------------------------------------------------------------------------- */
/* Main Records                                                               */
/* -------------------------------------------------------------------------- */

export async function getStravaRecords(): Promise<StravaRecords> {
  /*
   * Get every running activity.
   *
   * This is required so Longest Run is calculated
   * from the complete running history.
   */
  const runs =
    await getAllRuns();

  /* ---------------------------------------------------------------------- */
  /* Fetch detailed activities                                             */
  /* ---------------------------------------------------------------------- */

  /*
   * Strava's best_efforts are available on the
   * detailed activity response.
   */
  const eligibleRuns =
    runs.filter(
      (run) =>
        run.distance >= 1000,
    );

  /*
   * Fetch detailed activities in parallel.
   */
  const detailedRuns =
    await Promise.all(
      eligibleRuns.map(
        async (run) => {
          try {
            return await getActivity(
              run.id,
            );
          } catch (error) {
            console.error(
              `Failed to fetch detailed activity ${run.id}:`,
              error,
            );

            return null;
          }
        },
      ),
    );

  const validDetailedRuns =
    detailedRuns.filter(
      (
        activity,
      ): activity is StravaActivity =>
        activity !== null,
    );

  /* ---------------------------------------------------------------------- */
  /* Personal Best definitions                                             */
  /* ---------------------------------------------------------------------- */

  const effortDefinitions = [
    {
      id: "1k",

      title: "1K",

      names: [
        "1k",
        "1 km",
        "1K",
      ],
    },

    {
      id: "5k",

      title: "5K",

      names: [
        "5k",
        "5 km",
        "5K",
      ],
    },

    {
      id: "10k",

      title: "10K",

      names: [
        "10k",
        "10 km",
        "10K",
      ],
    },

    {
      id: "16k",

      title: "16K",

      names: [
        "16k",
        "16 km",
        "16K",
      ],
    },
  ];

  /* ---------------------------------------------------------------------- */
  /* Personal Records                                                       */
  /* ---------------------------------------------------------------------- */

  const personalRecords: PersonalRecord[] =
    [];

  for (
    const definition of effortDefinitions
  ) {
    let best:
      | {
          effort: StravaBestEffort;

          activity: StravaActivity;
        }
      | null = null;

    for (
      const activity of validDetailedRuns
    ) {
      const efforts =
        activity.best_efforts ?? [];

      const effort =
        findBestEffort(
          efforts,
          definition.names,
        );

      if (!effort) {
        continue;
      }

      if (
        best === null ||
        effort.elapsed_time <
          best.effort.elapsed_time
      ) {
        best = {
          effort,

          activity,
        };
      }
    }

    if (!best) {
      continue;
    }

    const effortDate =
      best.effort
        .start_date_local ??
      best.effort.start_date ??
      best.activity
        .start_date_local;

    personalRecords.push({
      id: definition.id,

      title: definition.title,

      value:
        formatEffortTime(
          best.effort.elapsed_time,
        ),

      description:
        "Best Effort",

      date:
        formatDate(
          effortDate,
        ),

      activityId:
        best.activity.id,

      type: "effort",
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Longest Run                                                             */
  /* ---------------------------------------------------------------------- */

  const longestRun =
    findLongestRun(runs);

  if (longestRun) {
    personalRecords.push({
      id: "longest-run",

      title: "Longest Run",

      value:
        formatDistance(
          longestRun.distance,
        ),

      unit: "km",

      description:
        "Best Distance",

      date:
        formatDate(
          longestRun.start_date_local,
        ),

      activityId:
        longestRun.id,

      type: "longest",
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Record ordering                                                        */
  /* ---------------------------------------------------------------------- */

  const order: Record<
    string,
    number
  > = {
    "1k": 1,

    "5k": 2,

    "10k": 3,

    "16k": 4,

    "longest-run": 5,
  };

  personalRecords.sort(
    (a, b) =>
      (order[a.id] ?? 99) -
      (order[b.id] ?? 99),
  );

  /* ---------------------------------------------------------------------- */
  /* Other Records                                                          */
  /* ---------------------------------------------------------------------- */

  const totalDistance =
    runs.reduce(
      (total, run) =>
        total + run.distance,
      0,
    );

  const totalElevation =
    runs.reduce(
      (total, run) =>
        total +
        (run.total_elevation_gain ??
          0),
      0,
    );

  const longestDuration =
    runs.length > 0
      ? runs.reduce(
          (longest, current) =>
            current.moving_time >
            longest.moving_time
              ? current
              : longest,
        )
      : null;

  const fastestRun =
    runs
      .filter(
        (run) =>
          run.distance > 0 &&
          run.moving_time > 0,
      )
      .reduce<
        StravaActivity | null
      >(
        (
          fastest,
          current,
        ) => {
          if (!fastest) {
            return current;
          }

          const currentPace =
            current.moving_time /
            current.distance;

          const fastestPace =
            fastest.moving_time /
            fastest.distance;

          return currentPace <
            fastestPace
            ? current
            : fastest;
        },
        null,
      );

  const otherRecords:
    OtherRecord[] = [
      {
        id: "total-distance",

        title: "Total Distance",

        value:
          formatDistance(
            totalDistance,
          ),

        unit: "km",

        description:
          "All running activities",

        category:
          "distance",
      },

      {
        id: "fastest-pace",

        title: "Fastest Pace",

        value:
          fastestRun
            ? formatPace(
                fastestRun,
              )
            : "—",

        unit: "/km",

        description:
          "Best activity pace",

        category:
          "pace",
      },

      {
        id: "elevation",

        title: "Elevation",

        value:
          Math.round(
            totalElevation,
          ).toString(),

        unit: "m",

        description:
          "Total elevation gain",

        category:
          "elevation",
      },

      {
        id: "longest-duration",

        title: "Longest Duration",

        value:
          longestDuration
            ? formatEffortTime(
                longestDuration
                  .moving_time,
              )
            : "—",

        description:
          "Longest moving time",

        category:
          "duration",
      },
    ];

  return {
    personalRecords,

    otherRecords,
  };
}

/* -------------------------------------------------------------------------- */
/* 5K Progress                                                               */
/* -------------------------------------------------------------------------- */

export function build5KProgress(
  activities: StravaActivity[],
): EffortProgressItem[] {
  const progress: EffortProgressItem[] =
    [];

  for (
    const activity of activities
  ) {
    const efforts =
      activity.best_efforts ?? [];

    const fiveK =
      findBestEffort(
        efforts,
        [
          "5k",
          "5 km",
          "5K",
        ],
      );

    if (!fiveK) {
      continue;
    }

    if (
      fiveK.elapsed_time <= 0
    ) {
      continue;
    }

    const date =
      fiveK.start_date_local ??
      fiveK.start_date ??
      activity.start_date_local;

    const timestamp =
      new Date(
        date,
      ).getTime();

    if (
      Number.isNaN(timestamp)
    ) {
      continue;
    }

    progress.push({
      activityId:
        activity.id,

      date,

      timestamp,

      time:
        fiveK.elapsed_time,

      formattedTime:
        formatEffortTime(
          fiveK.elapsed_time,
        ),

      isBest: false,
    });
  }

  /*
   * Oldest → newest.
   */
  progress.sort(
    (a, b) =>
      a.timestamp -
      b.timestamp,
  );

  /*
   * Mark a point as "Best" when it
   * is the fastest 5K achieved up
   * to that date.
   */
  let bestTime =
    Number.POSITIVE_INFINITY;

  return progress.map(
    (item) => {
      const isBest =
        item.time < bestTime;

      if (isBest) {
        bestTime =
          item.time;
      }

      return {
        ...item,
        isBest,
      };
    },
  );
}