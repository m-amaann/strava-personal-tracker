import {
  Gauge,
  Mountain,
  Route,
  Timer,
} from "lucide-react";

import { Card } from "@/components/ui/card";

import type {
  OtherRecord,
} from "@/lib/strava/records";

interface RecordsSummaryProps {
  records: OtherRecord[];
}

/* -------------------------------------------------------------------------- */
/* Icon components                                                             */
/* -------------------------------------------------------------------------- */

function DistanceIcon() {
  return (
    <Route className="size-4" />
  );
}

function PaceIcon() {
  return (
    <Gauge className="size-4" />
  );
}

function ElevationIcon() {
  return (
    <Mountain className="size-4" />
  );
}

function DurationIcon() {
  return (
    <Timer className="size-4" />
  );
}

/* -------------------------------------------------------------------------- */
/* Static mappings                                                             */
/* -------------------------------------------------------------------------- */

const iconMap = {
  distance: DistanceIcon,
  pace: PaceIcon,
  elevation: ElevationIcon,
  duration: DurationIcon,
} as const;

const styles = {
  distance:
    "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",

  pace:
    "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",

  elevation:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",

  duration:
    "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
} as const;

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */

export function RecordsSummary({
  records,
}: RecordsSummaryProps) {
  return (
    <section>
      {/* Header */}
      <div className="mb-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Other Bests
        </p>

        <h2 className="mt-1 text-lg font-bold">
          Best performances
        </h2>
      </div>

      {/* Empty state */}
      {records.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No running data available.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {records.map(
            (record) => {
              const Icon =
                iconMap[
                  record.category
                ];

              const iconStyle =
                styles[
                  record.category
                ];

              return (
                <Card
                  key={record.id}
                  className="
                    border-border/70
                    p-4
                    transition-all
                    duration-200
                    hover:-translate-y-0.5
                    hover:shadow-sm
                    sm:p-5
                  "
                >
                  {/* Icon */}
                  <div
                    className={`
                      flex
                      size-9
                      items-center
                      justify-center
                      rounded-full
                      ${iconStyle}
                    `}
                  >
                    <Icon />
                  </div>

                  {/* Title */}
                  <p className="mt-4 text-xs font-medium text-muted-foreground">
                    {record.title}
                  </p>

                  {/* Value */}
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-xl font-bold tracking-tight sm:text-2xl">
                      {record.value}
                    </span>

                    {record.unit && (
                      <span className="text-xs font-medium text-muted-foreground">
                        {record.unit}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {record.description}
                  </p>
                </Card>
              );
            },
          )}
        </div>
      )}
    </section>
  );
}