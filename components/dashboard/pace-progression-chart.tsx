"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card } from "@/components/ui/card";

export type PaceProgressionPoint = {
  run: string;
  pace: number;
};

interface PaceProgressionChartProps {
  data?: PaceProgressionPoint[];
}

function formatPace(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return "—";
  }

  const minutes = Math.floor(value);

  const seconds = Math.round(
    (value - minutes) * 60,
  );

  if (seconds === 60) {
    return `${minutes + 1}:00`;
  }

  return `${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

function PaceTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: PaceProgressionPoint;
  }>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const data = payload[0]?.payload;

  if (!data) {
    return null;
  }

  return (
    <div className="rounded-xl border bg-background px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground">
        {data.run}
      </p>

      <p className="mt-1 text-sm font-bold">
        {formatPace(data.pace)} /km
      </p>
    </div>
  );
}

export function PaceProgressionChart({
  data = [],
}: PaceProgressionChartProps) {
  const validData = data.filter(
    (item) =>
      Number.isFinite(item.pace) &&
      item.pace > 0,
  );

  const hasData = validData.length > 0;

  const latestPace = hasData
    ? validData[validData.length - 1]?.pace ?? null
    : null;

  return (
    <Card className="p-4 shadow-none sm:p-5">
      {/* Header */}
      <div>
        <h2 className="text-base font-semibold tracking-tight">
          Pace Progression
        </h2>

        <p className="mt-1 text-xs text-muted-foreground">
          Your average pace across recent runs
        </p>
      </div>

      {!hasData ? (
        <div className="flex h-57.5 items-center justify-center">
          <p className="text-sm text-muted-foreground">
            No running pace data available.
          </p>
        </div>
      ) : (
        <>
          {/* Chart */}
          <div className="mt-5 h-57.5 w-full min-w-0">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart
                data={validData}
                margin={{
                  top: 8,
                  right: 4,
                  left: -12,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="currentColor"
                  strokeOpacity={0.08}
                />

                <XAxis
                  dataKey="run"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 10,
                    fill: "currentColor",
                    opacity: 0.5,
                  }}
                  tickFormatter={(value) =>
                    String(value).split(" ")[0]
                  }
                  interval="preserveStartEnd"
                />

                <YAxis
                  reversed
                  domain={[
                    "dataMin - 0.1",
                    "dataMax + 0.1",
                  ]}
                  axisLine={false}
                  tickLine={false}
                  width={38}
                  tick={{
                    fontSize: 10,
                    fill: "currentColor",
                    opacity: 0.5,
                  }}
                  tickFormatter={formatPace}
                />

                <Tooltip
                  cursor={{
                    stroke: "currentColor",
                    strokeOpacity: 0.12,
                  }}
                  content={<PaceTooltip />}
                />

                <Line
                  type="monotone"
                  dataKey="pace"
                  stroke="var(--chart-2)"
                  strokeWidth={2.5}
                  dot={{
                    r: 4,
                    strokeWidth: 2,
                    fill: "var(--background)",
                    stroke: "var(--chart-2)",
                  }}
                  activeDot={{
                    r: 6,
                    strokeWidth: 2,
                    fill: "var(--background)",
                    stroke: "var(--chart-2)",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Footer */}
          <div className="mt-3 flex items-center justify-between border-t pt-3">
            <p className="text-xs text-muted-foreground">
              Latest pace
            </p>

            <p className="text-sm font-semibold">
              {latestPace !== null
                ? `${formatPace(latestPace)} /km`
                : "—"}
            </p>
          </div>
        </>
      )}
    </Card>
  );
}