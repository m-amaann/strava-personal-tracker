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

import type { StravaActivityStreams } from "@/lib/strava/types";

interface RunHeartRateChartProps {
  streams: StravaActivityStreams | null;
}

export function RunHeartRateChart({
  streams,
}: RunHeartRateChartProps) {
  const distance =
    streams?.distance?.data;

  const heartRate =
    streams?.heartrate?.data;

  const chartData =
    distance &&
    heartRate
      ? distance
          .map(
            (
              distanceValue,
              index,
            ) => {
              const hr =
                heartRate[index];

              if (
                hr == null
              ) {
                return null;
              }

              return {
                distance: (
                  Number(
                    distanceValue,
                  ) / 1000
                ).toFixed(1),

                heartRate:
                  Number(hr),
              };
            },
          )
          .filter(Boolean)
      : [];

  if (chartData.length === 0) {
    return (
      <Card className="border-border/70 bg-card p-4 sm:p-5">
        <h3 className="text-base font-semibold">
          Heart Rate
        </h3>

        <p className="mt-1 text-xs text-muted-foreground">
          Heart-rate stream data is
          not available for this
          activity.
        </p>
      </Card>
    );
  }

  const heartRates =
    chartData.map(
      (item) =>
        item!.heartRate,
    );

  const minHeartRate =
    Math.floor(
      Math.min(
        ...heartRates,
      ) - 5,
    );

  const maxHeartRate =
    Math.ceil(
      Math.max(
        ...heartRates,
      ) + 5,
    );

  return (
    <Card className="border-border/70 bg-card p-4 sm:p-5">
      <div>
        <h3 className="text-base font-semibold">
          Heart Rate
        </h3>

        <p className="mt-1 text-xs text-muted-foreground">
          Heart rate throughout the
          run
        </p>
      </div>

      <div className="mt-5 h-56">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <AreaChart
            data={chartData}
            margin={{
              top: 8,
              right: 8,
              left: -20,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient
                id="heartRateGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#FC4C02"
                  stopOpacity={0.22}
                />

                <stop
                  offset="100%"
                  stopColor="#FC4C02"
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="currentColor"
              className="text-border"
            />

            <XAxis
              dataKey="distance"
              tickLine={false}
              axisLine={false}
              tick={{
                fontSize: 10,
              }}
              className="fill-muted-foreground"
            />

            <YAxis
              domain={[
                minHeartRate,
                maxHeartRate,
              ]}
              tickLine={false}
              axisLine={false}
              tick={{
                fontSize: 10,
              }}
              className="fill-muted-foreground"
            />

            <Tooltip
              formatter={(value) => [
                `${value} bpm`,
                "Heart Rate",
              ]}
            />

            <Area
              type="monotone"
              dataKey="heartRate"
              stroke="#FC4C02"
              strokeWidth={2.5}
              fill="url(#heartRateGradient)"
              dot={false}
              activeDot={{
                r: 5,
                fill: "#FC4C02",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}