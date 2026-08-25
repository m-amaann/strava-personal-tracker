import { ProgressClient } from "./progress-client";

import { getAllRuns } from "@/lib/strava/api";

import type { StravaActivity } from "@/lib/strava/types";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  let runs: StravaActivity[] = [];


  try {
    runs = await getAllRuns();
  } catch (error) {
    console.error(
      "Failed to fetch Strava runs:",
      error,
    );


    runs = [];
  }

  return (
    <ProgressClient
      runs={runs}
    />
  );
}