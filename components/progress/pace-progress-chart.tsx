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

import type { ProgressPoint } from "@/lib/progress";

interface PaceProgressChartProps {
  data: ProgressPoint[];
}

function formatPace(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return "--:--";
  }

  const totalSeconds = Math.round(value * 60);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

export function PaceProgressChart({
  data,
}: PaceProgressChartProps) {
  const hasData = data.length > 0;

  return (
    <Card className="border-border/70 p-4 sm:p-5">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Pace
        </p>

        <h2 className="mt-1 text-base font-bold">
          Average pace
        </h2>

        <p className="mt-1 text-xs text-muted-foreground">
          See how your running pace has changed.
        </p>
      </div>

      {/* Chart */}
      <div className="mt-5 h-64">
        {!hasData ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">
              No running data available.
            </p>
          </div>
        ) : (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart
              data={data}
              margin={{
                top: 8,
                right: 8,
                left: -18,
                bottom: 0,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                className="text-border"
              />

              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10 }}
                className="fill-muted-foreground"
              />

              <YAxis
                reversed
                domain={[
                  "dataMin - 0.2",
                  "dataMax + 0.2",
                ]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10 }}
                tickFormatter={formatPace}
                className="fill-muted-foreground"
              />

              <Tooltip
                formatter={(value) => [
                  `${formatPace(Number(value))} /km`,
                  "Pace",
                ]}
                contentStyle={{
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "white",
                  boxShadow:
                    "0 4px 16px rgba(0,0,0,0.08)",
                }}
              />

              <Line
                type="monotone"
                dataKey="pace"
                stroke="#7C3AED"
                strokeWidth={2.5}
                dot={false}
                activeDot={{
                  r: 5,
                  fill: "#7C3AED",
                }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}