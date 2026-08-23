export const dynamic = "force-dynamic";

import { AppShell } from "@/components/layout/app-shell";

import { WeeklySummary } from "@/components/dashboard/weekly-summary";
import { MetricGrid } from "@/components/dashboard/metric-grid";
import { RecentRuns } from "@/components/dashboard/recent-runs";
import { WeeklyDistanceChart } from "@/components/dashboard/weekly-distance-chart";
import { PaceProgressionChart } from "@/components/dashboard/pace-progression-chart";
import { HeartRateChart } from "@/components/dashboard/heart-rate-chart";
import { ActivitySummary } from "@/components/dashboard/activity-summary";

export default function Home() {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        {/* Header */}
        <header className="mb-6">
          <p className="text-sm font-medium text-muted-foreground">
            Good evening, Amaan
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Your performance
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Here&apos;s how your training is going.
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

        {/* Running Charts */}
        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <PaceProgressionChart />
          <HeartRateChart />
        </section>

        {/* Recent Runs */}
        <section className="mt-8">
          <RecentRuns />
        </section>
      </div>
    </AppShell>
  );
}