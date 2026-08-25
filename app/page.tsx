export const dynamic = "force-dynamic";

import { AppShell } from "@/components/layout/app-shell";

import { WeeklySummary } from "@/components/dashboard/weekly-summary";
import { MetricGrid } from "@/components/dashboard/metric-grid";
import { RecentRuns } from "@/components/dashboard/recent-runs";
import { WeeklyDistanceChart } from "@/components/dashboard/weekly-distance-chart";
import { PaceProgressionChart } from "@/components/dashboard/pace-progression-chart";
import { HeartRateChart } from "@/components/dashboard/heart-rate-chart";
import { ActivitySummary } from "@/components/dashboard/activity-summary";
import { Greeting } from "@/components/dashboard/greeting";

import { HeartRateZones } from "@/components/activities/heart-rate-zones";

import {
  getActivityStreams,
  getAllRuns,
} from "@/lib/strava/api";

import type {
  StravaActivity,
  StravaActivityStreams,
} from "@/lib/strava/types";

import type {
  HeartRatePoint,
} from "@/components/dashboard/heart-rate-chart";

import type {
  HeartRateZone,
} from "@/components/activities/heart-rate-zones";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatRunDate(
  dateString: string,
) {
  const date = new Date(dateString);

  if (!Number.isFinite(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
    },
  );
}

function calculatePace(
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

  return (
    movingTime /
    60 /
    (distance / 1000)
  );
}

function isRunningActivity(
  run: StravaActivity,
) {
  const type = (
    run.sport_type ??
    run.type ??
    ""
  ).toLowerCase();

  return (
    type === "run" ||
    type === "running"
  );
}

/* -------------------------------------------------------------------------- */
/* Stream helpers                                                             */
/* -------------------------------------------------------------------------- */

function getNumericStream(
  streams: StravaActivityStreams,
  key: "time" | "heartrate",
): number[] {
  const stream = streams[key];

  if (
    !stream ||
    !Array.isArray(stream.data)
  ) {
    return [];
  }

  return stream.data.filter(
    (
      value,
    ): value is number =>
      typeof value === "number" &&
      Number.isFinite(value),
  );
}

/* -------------------------------------------------------------------------- */
/* Heart-rate zone definitions                                                */
/* -------------------------------------------------------------------------- */

/*
 * Five-zone model:
 *
 * Zone 1 = 50–60%
 * Zone 2 = 60–70%
 * Zone 3 = 70–80%
 * Zone 4 = 80–90%
 * Zone 5 = 90–100%
 *
 * The percentages are based on the maximum HR
 * observed in the available HR streams.
 */

function createHeartRateZones(
  maxHeartRate: number,
): HeartRateZone[] {
  return [
    {
      zone: 1,
      label: "Zone 1",
      min: Math.round(
        maxHeartRate * 0.50,
      ),
      max: Math.round(
        maxHeartRate * 0.60,
      ),
      seconds: 0,
      percentage: 0,
    },

    {
      zone: 2,
      label: "Zone 2",
      min: Math.round(
        maxHeartRate * 0.60,
      ),
      max: Math.round(
        maxHeartRate * 0.70,
      ),
      seconds: 0,
      percentage: 0,
    },

    {
      zone: 3,
      label: "Zone 3",
      min: Math.round(
        maxHeartRate * 0.70,
      ),
      max: Math.round(
        maxHeartRate * 0.80,
      ),
      seconds: 0,
      percentage: 0,
    },

    {
      zone: 4,
      label: "Zone 4",
      min: Math.round(
        maxHeartRate * 0.80,
      ),
      max: Math.round(
        maxHeartRate * 0.90,
      ),
      seconds: 0,
      percentage: 0,
    },

    {
      zone: 5,
      label: "Zone 5",
      min: Math.round(
        maxHeartRate * 0.90,
      ),
      max: Math.round(
        maxHeartRate,
      ),
      seconds: 0,
      percentage: 0,
    },
  ];
}

/* -------------------------------------------------------------------------- */
/* Find HR zone                                                               */
/* -------------------------------------------------------------------------- */

function getHeartRateZone(
  heartRate: number,
  maxHeartRate: number,
) {
  const percentage =
    heartRate / maxHeartRate;

  if (percentage < 0.60) {
    return 1;
  }

  if (percentage < 0.70) {
    return 2;
  }

  if (percentage < 0.80) {
    return 3;
  }

  if (percentage < 0.90) {
    return 4;
  }

  return 5;
}

/* -------------------------------------------------------------------------- */
/* Calculate heart-rate zone time                                             */
/* -------------------------------------------------------------------------- */

function calculateHeartRateZoneTime(
  streamsList: StravaActivityStreams[],
  maxHeartRate: number,
) {
  const zones =
    createHeartRateZones(
      maxHeartRate,
    );

  let totalSeconds = 0;

  for (const streams of streamsList) {
    const times =
      getNumericStream(
        streams,
        "time",
      );

    const heartRates =
      getNumericStream(
        streams,
        "heartrate",
      );

    const length =
      Math.min(
        times.length,
        heartRates.length,
      );

    if (length < 2) {
      continue;
    }

    for (
      let i = 0;
      i < length - 1;
      i++
    ) {
      const currentTime =
        times[i];

      const nextTime =
        times[i + 1];

      const heartRate =
        heartRates[i];

      if (
        typeof currentTime !==
          "number" ||
        typeof nextTime !==
          "number" ||
        typeof heartRate !==
          "number"
      ) {
        continue;
      }

      const delta =
        nextTime -
        currentTime;

      /*
       * Ignore invalid/very large gaps.
       *
       * A large gap usually means the watch
       * was paused or there is missing stream
       * data. We don't want to count that
       * missing period as HR zone time.
       */

      if (
        delta <= 0 ||
        delta > 10
      ) {
        continue;
      }

      if (
        heartRate <= 0 ||
        !Number.isFinite(
          heartRate,
        )
      ) {
        continue;
      }

      const zoneNumber =
        getHeartRateZone(
          heartRate,
          maxHeartRate,
        );

      const zone =
        zones.find(
          (item) =>
            item.zone ===
            zoneNumber,
        );

      if (!zone) {
        continue;
      }

      zone.seconds += delta;

      totalSeconds += delta;
    }
  }

  /*
   * Calculate percentages after all
   * activities have been processed.
   */

  if (totalSeconds > 0) {
    for (const zone of zones) {
      zone.percentage =
        (zone.seconds /
          totalSeconds) *
        100;
    }
  }

  return {
    zones,
    totalSeconds,
  };
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default async function Home() {
  let runs: StravaActivity[] = [];

  try {
    runs = await getAllRuns();
  } catch (error) {
    console.error(
      "Failed to fetch dashboard runs:",
      error,
    );

    runs = [];
  }

  /* ------------------------------------------------------------------------ */
  /* Running activities                                                       */
  /* ------------------------------------------------------------------------ */

  const runningActivities =
    runs.filter(
      isRunningActivity,
    );

  /* ------------------------------------------------------------------------ */
  /* Pace progression                                                         */
  /* ------------------------------------------------------------------------ */

  const chartRuns =
    runningActivities
      .filter(
        (run) =>
          Number.isFinite(
            run.distance,
          ) &&
          run.distance > 0 &&
          Number.isFinite(
            run.moving_time,
          ) &&
          run.moving_time > 0,
      )
      .slice(0, 10)
      .reverse();

  const paceProgressionData =
    chartRuns.map((run) => ({
      run: formatRunDate(
        run.start_date_local ??
          run.start_date,
      ),

      pace: calculatePace(
        run.moving_time,
        run.distance,
      ),
    }));

  /* ------------------------------------------------------------------------ */
  /* Heart-rate chart                                                          */
  /* ------------------------------------------------------------------------ */

  const heartRateData: HeartRatePoint[] =
    runningActivities
      .filter(
        (run) =>
          typeof run.average_heartrate ===
            "number" &&
          Number.isFinite(
            run.average_heartrate,
          ) &&
          run.average_heartrate > 0,
      )
      .slice(0, 10)
      .reverse()
      .map((run) => ({
        run: formatRunDate(
          run.start_date_local ??
            run.start_date,
        ),

        heartRate:
          run.average_heartrate!,
      }));

  /* ------------------------------------------------------------------------ */
  /* Fetch actual HR streams                                                  */
  /* ------------------------------------------------------------------------ */

  /*
   * Use the same recent running activities
   * that are used for the dashboard charts.
   *
   * This prevents the zone card from making
   * hundreds of Strava API requests.
   */

  const streamRuns =
    runningActivities
      .filter(
        (run) =>
          Number.isFinite(
            run.id,
          ) &&
          run.id > 0,
      )
      .slice(0, 10);

  const heartRateStreams: StravaActivityStreams[] =
    [];

  for (const run of streamRuns) {
    try {
      const streams =
        await getActivityStreams(
          run.id,
        );

      const heartRates =
        getNumericStream(
          streams,
          "heartrate",
        );

      const times =
        getNumericStream(
          streams,
          "time",
        );

      /*
       * Only keep activities that
       * actually contain HR stream data.
       */

      if (
        heartRates.length > 1 &&
        times.length > 1
      ) {
        heartRateStreams.push(
          streams,
        );
      }
    } catch (error) {
      console.error(
        `Failed to fetch HR streams for activity ${run.id}:`,
        error,
      );
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Actual maximum HR from streams                                           */
  /* ------------------------------------------------------------------------ */

  let maxHeartRate = 0;

  for (const streams of heartRateStreams) {
    const heartRates =
      getNumericStream(
        streams,
        "heartrate",
      );

    for (const heartRate of heartRates) {
      if (
        heartRate > maxHeartRate
      ) {
        maxHeartRate =
          heartRate;
      }
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Fallback max HR                                                          */
  /* ------------------------------------------------------------------------ */

  /*
   * If streams are unavailable, fall back
   * to the activity average HR values.
   *
   * This allows the card to still display
   * average/max information, but zone time
   * will remain unavailable because we don't
   * have actual second-by-second HR data.
   */

  if (maxHeartRate <= 0) {
    const activityHeartRates =
      runningActivities
        .map(
          (run) =>
            run.average_heartrate,
        )
        .filter(
          (
            value,
          ): value is number =>
            typeof value ===
              "number" &&
            Number.isFinite(
              value,
            ) &&
            value > 0,
        );

    if (
      activityHeartRates.length >
      0
    ) {
      maxHeartRate =
        Math.max(
          ...activityHeartRates,
        );
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Weighted average heart rate                                              */
  /* ------------------------------------------------------------------------ */

  const heartRateRuns =
    runningActivities.filter(
      (run) =>
        typeof run.average_heartrate ===
          "number" &&
        Number.isFinite(
          run.average_heartrate,
        ) &&
        run.average_heartrate > 0 &&
        Number.isFinite(
          run.moving_time,
        ) &&
        run.moving_time > 0,
    );

  let averageHeartRate:
    | number
    | null = null;

  if (
    heartRateRuns.length > 0
  ) {
    const weightedTotal =
      heartRateRuns.reduce(
        (total, run) =>
          total +
          run.average_heartrate! *
            run.moving_time,
        0,
      );

    const totalTime =
      heartRateRuns.reduce(
        (total, run) =>
          total +
          run.moving_time,
        0,
      );

    if (totalTime > 0) {
      averageHeartRate =
        Math.round(
          weightedTotal /
            totalTime,
        );
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Heart-rate zones                                                         */
  /* ------------------------------------------------------------------------ */

  let heartRateZones:
    HeartRateZone[] = [];

  if (
    maxHeartRate > 0 &&
    heartRateStreams.length > 0
  ) {
    const zoneResult =
      calculateHeartRateZoneTime(
        heartRateStreams,
        maxHeartRate,
      );

    heartRateZones =
      zoneResult.zones;
  }

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <AppShell>
      <div
        className="
          mx-auto
          w-full
          max-w-7xl
          px-4
          py-5
          sm:px-6
          lg:px-8
          lg:py-8
        "
      >
        {/* Header */}

        <header className="mb-6">
          <p className="text-sm font-medium text-muted-foreground">
            <Greeting />
          </p>

          <h1
            className="
              mt-1
              text-2xl
              font-bold
              tracking-tight
              sm:text-3xl
            "
          >
            Your training overview
          </h1>

          <p
            className="
              mt-2
              text-sm
              text-muted-foreground
            "
          >
            A quick look at your recent
            activity and performance.
          </p>
        </header>

        {/* This Year — All Activities */}

        <section>
          <ActivitySummary />
        </section>

        {/* This Week — Running */}

        <section className="mt-6">
          <WeeklySummary />
        </section>

        {/* Running Metrics */}

        <section className="mt-4">
          <MetricGrid />
        </section>

        {/* Running Distance */}

        <section className="mt-6">
          <WeeklyDistanceChart />
        </section>

        {/* Pace + Heart Rate */}

        <section
          className="
            mt-6
            grid
            gap-6
            lg:grid-cols-2
          "
        >
          <PaceProgressionChart
            data={
              paceProgressionData
            }
          />

          <HeartRateChart
            data={
              heartRateData
            }
          />
        </section>

        {/* Heart Rate Zones */}

        <section className="mt-6">
          <HeartRateZones
            zones={
              heartRateZones
            }
            averageHeartRate={
              averageHeartRate
            }
            maxHeartRate={
              maxHeartRate > 0
                ? maxHeartRate
                : null
            }
          />
        </section>

        {/* Recent Runs */}

        <section className="mt-8">
          <RecentRuns />
        </section>
      </div>
    </AppShell>
  );
}