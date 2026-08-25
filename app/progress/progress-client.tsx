"use client";

import { useMemo, useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { ProgressHeader } from "@/components/progress/progress-header";
import { ProgressPeriodFilter } from "@/components/progress/progress-period-filter";
import { ProgressSummary } from "@/components/progress/progress-summary";
import { DistanceProgressChart } from "@/components/progress/distance-progress-chart";
import { PaceProgressChart } from "@/components/progress/pace-progress-chart";
import { HeartRateProgressChart } from "@/components/progress/heart-rate-progress-chart";

import type {
  ProgressPeriod,
  ProgressPoint,
} from "@/lib/progress";

import type {
  StravaActivity,
} from "@/lib/strava/types";

/* -------------------------------------------------------------------------- */
/* Props                                                                      */
/* -------------------------------------------------------------------------- */

interface ProgressClientProps {
  runs: StravaActivity[];
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function isRunningActivity(
  activity: StravaActivity,
): boolean {
  const activityType = (
    activity.sport_type ??
    activity.type ??
    ""
  ).toLowerCase();

  return (
    activityType === "run" ||
    activityType === "running"
  );
}

function metersToKilometers(
  meters: number,
): number {
  return meters / 1000;
}

function calculatePace(
  distanceMeters: number,
  movingTimeSeconds: number,
): number {
  if (
    !Number.isFinite(distanceMeters) ||
    !Number.isFinite(movingTimeSeconds) ||
    distanceMeters <= 0 ||
    movingTimeSeconds <= 0
  ) {
    return 0;
  }

  /*
   * Strava distance:
   * meters
   *
   * Strava moving time:
   * seconds
   *
   * Result:
   * minutes per kilometre
   */

  return (
    movingTimeSeconds /
    60 /
    (distanceMeters / 1000)
  );
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export function ProgressClient({
  runs,
}: ProgressClientProps) {
  const [period, setPeriod] =
    useState<ProgressPeriod>(
      "4-weeks",
    );

  /* ------------------------------------------------------------------------ */
  /* Progress chart data                                                      */
  /* ------------------------------------------------------------------------ */

  const data = useMemo<ProgressPoint[]>(
    () => {
      const now = new Date();

      const daysByPeriod: Record<
        ProgressPeriod,
        number
      > = {
        "4-weeks": 28,
        "12-weeks": 84,
        "6-months": 183,
        "1-year": 365,
      };

      const cutoffDate =
        new Date(now);

      cutoffDate.setDate(
        cutoffDate.getDate() -
          daysByPeriod[period],
      );

      return runs
        /* Only running activities */
        .filter(isRunningActivity)

        /* Only activities in selected period */
        .filter((run) => {
          const runDate =
            new Date(
              run.start_date,
            );

          return (
            Number.isFinite(
              runDate.getTime(),
            ) &&
            runDate >= cutoffDate
          );
        })

        /* Oldest -> newest */
        .sort(
          (a, b) =>
            new Date(
              a.start_date,
            ).getTime() -
            new Date(
              b.start_date,
            ).getTime(),
        )

        /* Convert Strava activity to chart point */
        .map((run) => {
          const date =
            new Date(
              run.start_date_local ??
                run.start_date,
            );

          return {
            label:
              date.toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                },
              ),

            distance:
              metersToKilometers(
                run.distance,
              ),

            pace:
              calculatePace(
                run.distance,
                run.moving_time,
              ),

            /*
             * Activities without HR
             * receive 0 and are ignored
             * when calculating average HR.
             */
            heartRate:
              run.average_heartrate ??
              0,
          };
        });
    },
    [runs, period],
  );

  /* ------------------------------------------------------------------------ */
  /* Summary                                                                  */
  /* ------------------------------------------------------------------------ */

  const summary = useMemo(() => {
    if (data.length === 0) {
      return {
        distance: null,
        pace: null,
        heartRate: null,
        distanceChange: null,
        trend: null,
      };
    }

    /* Total distance */

    const distance =
      data.reduce(
        (total, item) =>
          total + item.distance,
        0,
      );

    /* Average pace */

    const paceValues =
      data.filter(
        (item) =>
          Number.isFinite(
            item.pace,
          ) &&
          item.pace > 0,
      );

    const pace =
      paceValues.length > 0
        ? paceValues.reduce(
            (total, item) =>
              total + item.pace,
            0,
          ) / paceValues.length
        : null;

    /* Average heart rate */

    const heartRateValues =
      data.filter(
        (item) =>
          Number.isFinite(
            item.heartRate,
          ) &&
          item.heartRate > 0,
      );

    const heartRate =
      heartRateValues.length > 0
        ? Math.round(
            heartRateValues.reduce(
              (total, item) =>
                total +
                item.heartRate,
              0,
            ) /
              heartRateValues.length,
          )
        : null;

    return {
      distance,
      pace,
      heartRate,

      /*
       * Previous-period comparison
       * can be added later.
       */
      distanceChange: null,

      /*
       * Don't display a fake trend.
       */
      trend: null,
    };
  }, [data]);

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <AppShell>
      <main
        className="
          mx-auto
          w-full
          max-w-7xl
          px-4
          pb-24
          pt-5
          sm:px-6
          lg:px-8
          lg:py-8
        "
      >
        {/* ---------------------------------------------------------------- */}
        {/* Header                                                           */}
        {/* ---------------------------------------------------------------- */}

        <ProgressHeader />

        {/* ---------------------------------------------------------------- */}
        {/* Period filter                                                    */}
        {/* ---------------------------------------------------------------- */}

        <section className="mt-5">
          <ProgressPeriodFilter
            value={period}
            onChange={setPeriod}
          />
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Summary                                                          */}
        {/* ---------------------------------------------------------------- */}

        <section className="mt-5">
          <ProgressSummary
            distance={
              summary.distance
            }
            pace={summary.pace}
            heartRate={
              summary.heartRate
            }
            distanceChange={
              summary.distanceChange
            }
            trend={summary.trend}
          />
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Charts                                                           */}
        {/* ---------------------------------------------------------------- */}

        <section
          className="
            mt-6
            grid
            gap-5
            lg:grid-cols-2
          "
        >
          <DistanceProgressChart
            data={data}
          />

          <PaceProgressChart
            data={data}
          />

          <HeartRateProgressChart
            data={data}
          />
        </section>
      </main>
    </AppShell>
  );
}