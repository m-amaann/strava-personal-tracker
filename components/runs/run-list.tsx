import type { StravaActivity } from "@/lib/strava/types";

import { RunCard } from "@/components/runs/run-card";

interface RunListProps {
  runs: StravaActivity[];
}

export function RunList({
  runs,
}: RunListProps) {
  if (runs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-10 text-center">
        <p className="text-sm font-medium">
          No runs found
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          Your running activities will
          appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {runs.map((run) => (
        <RunCard
          key={run.id}
          run={run}
        />
      ))}
    </div>
  );
}