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

import type { ProgressPoint } from "./distance-progress-chart";

interface HeartRateProgressChartProps {
  data: ProgressPoint[];
}

export function HeartRateProgressChart({
  data,
}: HeartRateProgressChartProps) {
  const hasData = data.length > 0;

  return (
    <Card className="border-border/70 p-4 sm:p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Heart rate
        </p>

        <h2 className="mt-1 text-base font-bold">
          Average heart rate
        </h2>

        <p className="mt-1 text-xs text-muted-foreground">
          Track your cardiovascular response over time.
        </p>
      </div>

      <div className="mt-5 h-64">
        {!hasData ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No heart-rate data available.
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
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10 }}
                className="fill-muted-foreground"
              />

              <Tooltip
                formatter={(value) => [
                  `${Math.round(Number(value))} bpm`,
                  "Heart rate",
                ]}
                contentStyle={{
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  boxShadow:
                    "0 4px 16px rgba(0,0,0,0.08)",
                }}
              />

              <Line
                type="monotone"
                dataKey="heartRate"
                stroke="#F43F5E"
                strokeWidth={2.5}
                dot={false}
                activeDot={{
                  r: 5,
                  fill: "#F43F5E",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}