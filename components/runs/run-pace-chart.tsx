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

import type { StravaActivityStreams } from "@/lib/strava/types";

interface RunPaceChartProps {
  streams: StravaActivityStreams | null;
}

function formatPace(
  value: number,
) {
  const minutes =
    Math.floor(value);

  const seconds =
    Math.round(
      (value - minutes) * 60,
    );

  return `${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

export function RunPaceChart({
  streams,
}: RunPaceChartProps) {
  const distance =
    streams?.distance?.data;

  const velocity =
    streams?.velocity_smooth?.data;

  const paceData =
    distance &&
    velocity
      ? distance
          .map((distanceValue, index) => {
            const speed =
              Number(
                velocity[index],
              );

            if (
              !speed ||
              speed <= 0
            ) {
              return null;
            }

            const pace =
              1000 /
              speed /
              60;

            return {
              distance: (
                Number(
                  distanceValue,
                ) / 1000
              ).toFixed(1),
              pace,
            };
          })
          .filter(Boolean)
      : [];

  if (paceData.length === 0) {
    return (
      <Card className="border-border/70 bg-card p-4 sm:p-5">
        <h3 className="text-base font-semibold">
          Pace
        </h3>

        <p className="mt-1 text-xs text-muted-foreground">
          Pace stream data is not
          available for this activity.
        </p>
      </Card>
    );
  }

  return (
    <Card className="border-border/70 bg-card p-4 sm:p-5">
      <div>
        <h3 className="text-base font-semibold">
          Pace
        </h3>

        <p className="mt-1 text-xs text-muted-foreground">
          Pace throughout the run
        </p>
      </div>

      <div className="mt-5 h-56">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <LineChart
            data={paceData}
            margin={{
              top: 8,
              right: 8,
              left: -20,
              bottom: 0,
            }}
          >
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
              reversed
              tickLine={false}
              axisLine={false}
              tick={{
                fontSize: 10,
              }}
              tickFormatter={formatPace}
              className="fill-muted-foreground"
            />

            <Tooltip
              formatter={(value) => [
                `${formatPace(
                  Number(value),
                )} /km`,
                "Pace",
              ]}
            />

            <Line
              type="monotone"
              dataKey="pace"
              stroke="#FC4C02"
              strokeWidth={2.5}
              dot={false}
              activeDot={{
                r: 5,
                fill: "#FC4C02",
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}