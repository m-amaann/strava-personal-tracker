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
import type { ProgressPoint } from "@/lib/mock/progress";

interface HeartRateProgressChartProps {
  data: ProgressPoint[];
}

export function HeartRateProgressChart({
  data,
}: HeartRateProgressChartProps) {
  return (
    <Card className="border-border/70 p-4 sm:p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Heart Rate
        </p>

        <h2 className="mt-1 text-base font-bold">
          Average heart rate
        </h2>

        <p className="mt-1 text-xs text-muted-foreground">
          Track your cardiovascular response over time.
        </p>
      </div>

      <div className="mt-5 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 8,
              right: 8,
              left: -18,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient
                id="heartRateProgressGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#10B981"
                  stopOpacity={0.2}
                />

                <stop
                  offset="100%"
                  stopColor="#10B981"
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>

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
              domain={["dataMin - 5", "dataMax + 5"]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10 }}
              className="fill-muted-foreground"
            />

            <Tooltip
              formatter={(value) => [
                `${value} bpm`,
                "Heart Rate",
              ]}
              contentStyle={{
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              }}
            />

            <Area
              type="monotone"
              dataKey="heartRate"
              stroke="#10B981"
              strokeWidth={2.5}
              fill="url(#heartRateProgressGradient)"
              dot={false}
              activeDot={{
                r: 5,
                fill: "#10B981",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}