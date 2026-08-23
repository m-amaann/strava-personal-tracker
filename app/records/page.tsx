export const dynamic = "force-dynamic";

import { AppShell } from "@/components/layout/app-shell";

import { RecordsHeader } from "@/components/records/records-header";
import { RecordsGrid } from "@/components/records/records-grid";
import { RecordsSummary } from "@/components/records/records-summary";
import { EffortProgress } from "@/components/records/effort-progress";

import {
  build5KProgress,
  getDetailedRunningActivities,
  getStravaRecords,
  type EffortProgressItem,
  type OtherRecord,
  type PersonalRecord,
} from "@/lib/strava/records";

export default async function RecordsPage() {
  let personalRecords: PersonalRecord[] = [];
  let otherRecords: OtherRecord[] = [];
  let fiveKProgress: EffortProgressItem[] = [];

  try {
    const records =
      await getStravaRecords();

    personalRecords =
      records.personalRecords;

    otherRecords =
      records.otherRecords;

    const detailedRuns =
      await getDetailedRunningActivities();

    fiveKProgress =
      build5KProgress(
        detailedRuns,
      );
  } catch (error) {
    console.error(
      "Failed to load Strava records:",
      error,
    );
  }

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-5 sm:px-6 lg:px-8 lg:py-8">
        <RecordsHeader />

        {/* Best Efforts */}
        <section className="mt-6">
          <RecordsGrid
            records={personalRecords}
          />
        </section>

        {/* 5K Progress */}
        {fiveKProgress.length > 0 && (
          <section className="mt-4">
            <EffortProgress
              efforts={fiveKProgress}
            />
          </section>
        )}

        {/* Other Records */}
        <section className="mt-8">
          <RecordsSummary
            records={otherRecords}
          />
        </section>
      </main>
    </AppShell>
  );
}