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

export type HeartRatePoint = {
  run: string;
  heartRate: number;
};

interface HeartRateChartProps {
  data?: HeartRatePoint[];
}

function HeartRateTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: HeartRatePoint;
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
        {data.heartRate} bpm
      </p>
    </div>
  );
}

export function HeartRateChart({
  data = [],
}: HeartRateChartProps) {
  const validData = data.filter(
    (item) =>
      Number.isFinite(item.heartRate) &&
      item.heartRate > 0,
  );

  const hasData = validData.length > 0;

  const latestAverage = hasData
    ? validData[validData.length - 1]?.heartRate ?? null
    : null;

  return (
    <Card className="p-4 shadow-none sm:p-5">
      <div>
        <h2 className="text-base font-semibold tracking-tight">
          Heart Rate
        </h2>

        <p className="mt-1 text-xs text-muted-foreground">
          Average heart rate across recent runs
        </p>
      </div>

      {!hasData ? (
        <div className="flex h-70 items-center justify-center">
          <p className="text-sm text-muted-foreground">
            No heart-rate data available.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-5 h-70 w-full min-w-0">
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
                  domain={[
                    "dataMin - 5",
                    "dataMax + 5",
                  ]}
                  axisLine={false}
                  tickLine={false}
                  width={35}
                  tick={{
                    fontSize: 10,
                    fill: "currentColor",
                    opacity: 0.5,
                  }}
                  tickFormatter={(value) =>
                    String(value)
                  }
                />

                <Tooltip
                  cursor={{
                    stroke: "currentColor",
                    strokeOpacity: 0.12,
                  }}
                  content={<HeartRateTooltip />}
                />

                <Line
                  type="monotone"
                  dataKey="heartRate"
                  stroke="var(--chart-3)"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{
                    r: 5,
                    strokeWidth: 2,
                    fill: "var(--background)",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex items-center justify-between border-t pt-3">
            <p className="text-xs text-muted-foreground">
              Latest average
            </p>

            <p className="text-sm font-semibold">
              {latestAverage !== null
                ? `${Math.round(latestAverage)} bpm`
                : "—"}
            </p>
          </div>
        </>
      )}
    </Card>
  );
}