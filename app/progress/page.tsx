"use client";

import { useMemo, useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { ProgressHeader } from "@/components/progress/progress-header";
import { ProgressPeriodFilter } from "@/components/progress/progress-period-filter";
import { ProgressSummary } from "@/components/progress/progress-summary";
import { DistanceProgressChart } from "@/components/progress/distance-progress-chart";
import { PaceProgressChart } from "@/components/progress/pace-progress-chart";
import { HeartRateProgressChart } from "@/components/progress/heart-rate-progress-chart";

import {
  progressData,
  type ProgressPeriod,
} from "@/lib/mock/progress";

export default function ProgressPage() {
  const [period, setPeriod] =
    useState<ProgressPeriod>("4-weeks");

  const data = progressData[period];

  const summary = useMemo(() => {
    if (!data.length) {
      return {
        distance: 0,
        pace: 0,
        heartRate: 0,
      };
    }

    const distance = data[data.length - 1].distance;

    const pace =
      data.reduce((total, item) => total + item.pace, 0) /
      data.length;

    const heartRate = Math.round(
      data.reduce(
        (total, item) => total + item.heartRate,
        0,
      ) / data.length,
    );

    return {
      distance,
      pace,
      heartRate,
    };
  }, [data]);

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-5 sm:px-6 lg:px-8 lg:py-8">
        {/* Header */}
        <ProgressHeader />

        {/* Period filter */}
        <section className="mt-5">
          <ProgressPeriodFilter
            value={period}
            onChange={setPeriod}
          />
        </section>

        {/* Summary */}
        <section className="mt-5">
          <ProgressSummary
            distance={summary.distance}
            pace={summary.pace}
            heartRate={summary.heartRate}
          />
        </section>

        {/* Charts */}
        <section className="mt-6 grid gap-5 lg:grid-cols-2">
          <DistanceProgressChart data={data} />

          <PaceProgressChart data={data} />

          <HeartRateProgressChart data={data} />
        </section>
      </main>
    </AppShell>
  );
}