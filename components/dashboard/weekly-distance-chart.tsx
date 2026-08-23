"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card } from "@/components/ui/card";
import { weeklyDistanceData } from "@/lib/mock/weekly";

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: {
      week: string;
      distance: number;
      runs: number;
    };
  }>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div className="rounded-xl border bg-background px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-muted-foreground">
        Week of {data.week}
      </p>

      <p className="mt-1 text-sm font-bold">
        {data.distance.toFixed(2)} km
      </p>

      <p className="text-xs text-muted-foreground">
        {data.runs} runs
      </p>
    </div>
  );
}

export function WeeklyDistanceChart() {
  const average =
    weeklyDistanceData.reduce(
      (total, item) => total + item.distance,
      0,
    ) / weeklyDistanceData.length;

  return (
    <Card className="overflow-hidden p-4 shadow-none sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight">
            Weekly Distance
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Your running volume over the last 8 weeks
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-xs text-muted-foreground">
            Average
          </p>

          <p className="text-sm font-semibold">
            {average.toFixed(1)} km
          </p>
        </div>
      </div>

      <div className="mt-5 h-57.5 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={weeklyDistanceData}
            margin={{
              top: 8,
              right: 4,
              left: -20,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient
                id="distanceGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0.28}
                />

                <stop
                  offset="100%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={false}
              stroke="currentColor"
              strokeOpacity={0.08}
            />

            <XAxis
              dataKey="week"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 10,
                fill: "currentColor",
                opacity: 0.5,
              }}
              tickFormatter={(value) =>
                value.split(" ")[0]
              }
              interval="preserveStartEnd"
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 10,
                fill: "currentColor",
                opacity: 0.5,
              }}
              width={35}
              tickFormatter={(value) => `${value}`}
            />

            <Tooltip
              cursor={{
                stroke: "currentColor",
                strokeOpacity: 0.12,
              }}
              content={<ChartTooltip />}
            />

            <Area
              type="monotone"
              dataKey="distance"
              stroke="var(--chart-1)"
              strokeWidth={2.5}
              fill="url(#distanceGradient)"
              dot={false}
              activeDot={{
                r: 5,
                strokeWidth: 2,
                fill: "var(--background)",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center justify-between border-t pt-3">
        <p className="text-xs text-muted-foreground">
          Current week
        </p>

        <p className="text-sm font-semibold">
          18.42 km
        </p>
      </div>
    </Card>
  );
}