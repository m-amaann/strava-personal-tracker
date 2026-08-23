import Link from "next/link";

import {
  ArrowLeft,
  MoreHorizontal,
  Share2,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";

import { RunMap } from "@/components/runs/run-map";
import { RunStats } from "@/components/runs/run-stats";
import { RunChartTabs } from "@/components/runs/run-chart-tabs";

import {
  getActivity,
  getActivityStreams,
} from "@/lib/strava/api";

interface RunDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
    },
  );
}

export default async function RunDetailsPage({
  params,
}: RunDetailsPageProps) {
  const { id } = await params;

  let run = null;
  let streams = null;

  try {
    run = await getActivity(id);

    streams = await getActivityStreams(id);
  } catch (error) {
    console.error(
      "Failed to fetch Strava activity:",
      error,
    );
  }

  if (!run) {
    return (
      <AppShell>
        <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <h1 className="text-xl font-semibold">
              Run not found
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              We couldn&apos;t find this
              Strava running activity.
            </p>

            <Link
              href="/runs"
              className="mt-5 inline-flex rounded-full bg-[#FC4C02] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#e64600]"
            >
              Back to Runs
            </Link>
          </div>
        </main>
      </AppShell>
    );
  }

  const activityDate =
    formatDate(run.start_date_local);

  const activityTime =
    formatTime(run.start_date_local);

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-3 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
        {/* Header */}
        <header className="mb-4 sm:mb-5">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/runs"
              aria-label="Back to runs"
              className="flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
            >
              <ArrowLeft className="size-5" />
            </Link>

            <div className="min-w-0 flex-1 text-center sm:text-left">
              <h1 className="truncate text-base font-bold tracking-tight sm:text-2xl">
                {run.name}
              </h1>

              <p className="mt-0.5 truncate text-[10px] text-muted-foreground sm:text-xs">
                {activityDate} · {activityTime}
              </p>
            </div>

            <div className="flex items-center gap-0.5">
              <button
                type="button"
                aria-label="Share run"
                className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Share2 className="size-4" />
              </button>

              <button
                type="button"
                aria-label="More options"
                className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <MoreHorizontal className="size-5" />
              </button>
            </div>
          </div>

          <p className="mt-2 hidden text-sm text-muted-foreground sm:block">
            {run.sport_type || run.type}
          </p>
        </header>

        {/* Real Strava activity statistics */}
        <section>
          <RunStats run={run} />
        </section>

        {/* Real Strava GPS route */}
        <section className="mt-5 sm:mt-6">
            <div className="aspect-[2.4/1] w-full">
              <RunMap
                polyline={
                  run.map?.summary_polyline
                }
              />
            </div>
        </section>

        {/* Real Strava activity streams */}
        <section className="mt-5">
          <RunChartTabs
            streams={streams}
          />
        </section>
      </main>
    </AppShell>
  );
}