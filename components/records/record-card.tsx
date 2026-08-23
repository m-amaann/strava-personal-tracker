import Link from "next/link";

import {
  Clock3,
  Trophy,
  Route,
} from "lucide-react";

import { Card } from "@/components/ui/card";

import type {
  PersonalRecord,
} from "@/lib/strava/records";

interface RecordCardProps {
  record: PersonalRecord;
}

/* -------------------------------------------------------------------------- */
/* Record Icon                                                                 */
/* -------------------------------------------------------------------------- */

function RecordIcon({
  type,
}: {
  type: PersonalRecord["type"];
}) {
  if (type === "longest") {
    return (
      <Route className="size-5" />
    );
  }

  return (
    <Trophy className="size-5" />
  );
}

/* -------------------------------------------------------------------------- */
/* Record Card                                                                 */
/* -------------------------------------------------------------------------- */

export function RecordCard({
  record,
}: RecordCardProps) {
  return (
    <Link
      href={`/runs/${record.activityId}`}
      className="group block"
    >
      <Card
        className="
          relative
          overflow-hidden
          border-border/70
          bg-card
          p-4
          transition-all
          duration-200
          hover:-translate-y-0.5
          hover:border-[#FC4C02]/30
          hover:shadow-md
          sm:p-5
        "
      >
        {/* Decorative background */}
        <div
          className="
            pointer-events-none
            absolute
            -right-8
            -top-8
            size-24
            rounded-full
            bg-[#FC4C02]/5
          "
        />

        <div className="relative">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div
              className="
                flex
                size-10
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-[#FFF1EB]
                text-[#FC4C02]
                dark:bg-[#FC4C02]/10
                dark:text-[#FF7043]
              "
            >
              <RecordIcon
                type={record.type}
              />
            </div>

            <span
              className="
                rounded-full
                bg-muted
                px-2.5
                py-1
                text-[10px]
                font-semibold
                text-muted-foreground
              "
            >
              Running
            </span>
          </div>

          {/* Record title */}
          <p className="mt-5 text-xs font-medium text-muted-foreground">
            {record.title}
          </p>

          {/* Record value */}
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight sm:text-3xl">
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

          {/* Date */}
          <div className="mt-4 flex items-center gap-1.5 border-t border-border/60 pt-3">
            <Clock3 className="size-3.5 text-muted-foreground" />

            <span className="text-[10px] text-muted-foreground">
              {record.date}
            </span>
          </div>

          {/* Hover action */}
          <div
            className="
              mt-3
              text-[10px]
              font-semibold
              text-[#FC4C02]
              opacity-0
              transition-opacity
              group-hover:opacity-100
            "
          >
            View activity →
          </div>
        </div>
      </Card>
    </Link>
  );
}