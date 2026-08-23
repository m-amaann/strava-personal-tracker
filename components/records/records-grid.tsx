import { Trophy } from "lucide-react";

import { RecordCard } from "@/components/records/record-card";

import type {
  PersonalRecord,
} from "@/lib/strava/records";

interface RecordsGridProps {
  records: PersonalRecord[];
}

export function RecordsGrid({
  records,
}: RecordsGridProps) {
  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Best Efforts
          </p>

          <h2 className="mt-1 text-lg font-bold">
            Personal bests
          </h2>
        </div>

        <div className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
          <Trophy className="size-3.5 text-[#FC4C02]" />

          Running
        </div>
      </div>

      {records.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-sm font-medium">
            No running records found
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Your Strava running activities
            will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {records.map(
            (record) => (
              <RecordCard
                key={record.id}
                record={record}
              />
            ),
          )}
        </div>
      )}
    </section>
  );
}