"use client";

import Link from "next/link";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card } from "@/components/ui/card";
import { EffortProgressItem } from "@/lib/strava/records";



interface EffortProgressProps {
  efforts?: EffortProgressItem[];
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );
}

function formatTooltipTime(seconds: number) {
  const totalSeconds = Math.round(seconds);

  const minutes = Math.floor(
    totalSeconds / 60,
  );

  const remaining = totalSeconds % 60;

  return `${minutes}:${remaining
    .toString()
    .padStart(2, "0")}`;
}

export function EffortProgress({
  efforts = [],
}: EffortProgressProps) {
  if (efforts.length === 0) {
    return null;
  }

  const sortedEfforts = [...efforts].sort(
    (a, b) =>
      a.timestamp - b.timestamp,
  );

  const chartData = sortedEfforts.map(
    (effort) => ({
      ...effort,
      label: formatDate(
        effort.timestamp,
      ),
    }),
  );

  return (
    <Card className="overflow-hidden border-border/70 p-4 shadow-none sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Performance
          </p>

          <h2 className="mt-1 text-sm font-bold">
            5K Progress
          </h2>
        </div>

        <span className="rounded-full bg-[#FFF1EB] px-2.5 py-1 text-[9px] font-semibold text-[#FC4C02]">
          5K
        </span>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto] gap-4">
        <div className="min-w-0">
          <div className="space-y-3">
            {sortedEfforts.map(
              (effort) => (
                <Link
                  key={`${effort.activityId}-${effort.timestamp}`}
                  href={`/runs/${effort.activityId}`}
                  className="group grid grid-cols-[1fr_auto] items-center gap-3"
                >
                  <span className="truncate text-[10px] text-foreground group-hover:text-[#FC4C02]">
                    {formatDate(
                      effort.timestamp,
                    )}
                  </span>

                  <div className="flex items-center gap-2">
                    {effort.isBest && (
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-[9px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                        Best
                      </span>
                    )}

                    <span className="text-[10px] font-semibold tabular-nums">
                      {effort.formattedTime}
                    </span>
                  </div>
                </Link>
              ),
            )}
          </div>
        </div>

        <div className="h-32 w-32 sm:h-36 sm:w-52">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart
              data={chartData}
              margin={{
                top: 8,
                right: 2,
                bottom: 0,
                left: 2,
              }}
            >
              <XAxis
                dataKey="timestamp"
                hide
              />

              <YAxis
                reversed
                domain={[
                  "auto",
                  "auto",
                ]}
                hide
              />

              <Tooltip
                cursor={false}
                contentStyle={{
                  borderRadius: 8,
                  border:
                    "1px solid #e7e5e4",
                  fontSize: 10,
                }}
                formatter={(value) => [
                  formatTooltipTime(
                    Number(value),
                  ),
                  "5K",
                ]}
                labelFormatter={(value) =>
                  formatDate(
                    Number(value),
                  )
                }
              />

              <Line
                type="monotone"
                dataKey="time"
                stroke="#FC4C02"
                strokeWidth={1.5}
                dot={{
                  r: 2.5,
                  fill: "#FC4C02",
                  strokeWidth: 0,
                }}
                activeDot={{
                  r: 4,
                }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}