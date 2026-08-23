import Link from "next/link";

import { SectionHeader } from "@/components/shared/section-header";
import { RunCard } from "@/components/runs/run-card";

import { getRecentRuns } from "@/lib/strava/api";
import type { StravaActivity } from "@/lib/strava/types";

export async function RecentRuns() {
  let runs: StravaActivity[] = [];

  try {
    runs = await getRecentRuns(3);
  } catch (error) {
    console.error(
      "Failed to fetch recent Strava runs:",
      error,
    );
  }

  return (
    <section className="space-y-3">
      <SectionHeader
        title="Recent Runs"
      />

      {runs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-sm font-medium">
            No runs found
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Your Strava running activities will
            appear here.
          </p>

          <Link
            href="/runs"
            className="mt-4 inline-flex text-xs font-semibold text-[#FC4C02] hover:underline"
          >
            View runs
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {runs.map((run) => (
            <RunCard
              key={run.id}
              run={run}
            />
          ))}
        </div>
      )}
    </section>
  );
}