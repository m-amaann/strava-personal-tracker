import { AppShell } from "@/components/layout/app-shell";

import { RunsHeader } from "@/components/runs/runs-header";
import { RunsFilter } from "@/components/runs/runs-filter";
import { RunList } from "@/components/runs/run-list";

import { getAllRuns } from "@/lib/strava/api";
import type { StravaActivity } from "@/lib/strava/types";

interface RunsPageProps {
  searchParams: Promise<{
    filter?: string;
  }>;
}

function startOfWeek(date: Date) {
  const result = new Date(date);

  const day = result.getDay();
  const difference = day === 0 ? 6 : day - 1;

  result.setDate(
    result.getDate() - difference,
  );

  result.setHours(0, 0, 0, 0);

  return result;
}

function startOfMonth(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    1,
  );
}

function filterRuns(
  runs: StravaActivity[],
  filter: string,
): StravaActivity[] {
  switch (filter) {
    case "week": {
      const start = startOfWeek(new Date());

      return runs.filter(
        (run) =>
          new Date(run.start_date_local) >=
          start,
      );
    }

    case "month": {
      const start = startOfMonth(new Date());

      return runs.filter(
        (run) =>
          new Date(run.start_date_local) >=
          start,
      );
    }

    case "long":
      return runs.filter(
        (run) => run.distance >= 10000,
      );

    default:
      return runs;
  }
}

export default async function RunsPage({
  searchParams,
}: RunsPageProps) {
  const { filter = "all" } =
    await searchParams;

  let runs: StravaActivity[] = [];

  try {
    runs = await getAllRuns();
  } catch (error) {
    console.error(
      "Failed to fetch Strava runs:",
      error,
    );
  }

  const filteredRuns = filterRuns(
    runs,
    filter,
  );

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <RunsHeader
          totalRuns={filteredRuns.length}
        />

        <div className="mt-5">
          <RunsFilter />
        </div>

        <section className="mt-5">
          <RunList runs={filteredRuns} />
        </section>
      </main>
    </AppShell>
  );
}