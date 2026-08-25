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

export interface ProgressPoint {
  label: string;
  distance: number;
  pace: number;
  heartRate: number;
}

interface DistanceProgressChartProps {
  data: ProgressPoint[];
}

export function DistanceProgressChart({
  data,
}: DistanceProgressChartProps) {
  const hasData = data.length > 0;

  return (
    <Card className="border-border/70 p-4 sm:p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Distance
        </p>

        <h2 className="mt-1 text-base font-bold">
          Running distance
        </h2>

        <p className="mt-1 text-xs text-muted-foreground">
          Your running volume over the selected period.
        </p>
      </div>

      <div className="mt-5 h-64">
        {!hasData ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No running data available.
          </div>
        ) : (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <AreaChart
              data={data}
              margin={{
                top: 8,
                right: 8,
                left: -22,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient
                  id="distanceProgressGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#2563EB"
                    stopOpacity={0.25}
                  />

                  <stop
                    offset="100%"
                    stopColor="#2563EB"
                    stopOpacity={0.03}
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
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10 }}
                className="fill-muted-foreground"
              />

              <Tooltip
                formatter={(value) => [
                  `${Number(value).toFixed(1)} km`,
                  "Distance",
                ]}
                contentStyle={{
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  boxShadow:
                    "0 4px 16px rgba(0,0,0,0.08)",
                }}
              />

              <Area
                type="monotone"
                dataKey="distance"
                stroke="#2563EB"
                strokeWidth={2.5}
                fill="url(#distanceProgressGradient)"
                dot={false}
                activeDot={{
                  r: 5,
                  fill: "#2563EB",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}