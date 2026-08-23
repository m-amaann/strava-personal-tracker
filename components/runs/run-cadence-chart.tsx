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

interface RunCadenceChartProps {
  streams: StravaActivityStreams | null;
}

export function RunCadenceChart({
  streams,
}: RunCadenceChartProps) {
  const distance = streams?.distance?.data;
  const cadence = streams?.cadence?.data;

  const chartData =
    distance && cadence
      ? distance
          .map((distanceValue, index) => {
            const cadenceValue = cadence[index];

            if (cadenceValue == null) {
              return null;
            }

            return {
              distance: (
                Number(distanceValue) / 1000
              ).toFixed(1),
              cadence: Number(cadenceValue),
            };
          })
          .filter(Boolean)
      : [];

  if (chartData.length === 0) {
    return (
      <Card className="border-border/70 bg-card p-4 sm:p-5">
        <h3 className="text-base font-semibold">
          Cadence
        </h3>

        <p className="mt-1 text-xs text-muted-foreground">
          Cadence stream data is not available
          for this activity.
        </p>
      </Card>
    );
  }

  const cadences = chartData.map(
    (item) => item!.cadence,
  );

  const minCadence = Math.floor(
    Math.min(...cadences) - 5,
  );

  const maxCadence = Math.ceil(
    Math.max(...cadences) + 5,
  );

  return (
    <Card className="border-border/70 bg-card p-4 sm:p-5">
      <div>
        <h3 className="text-base font-semibold">
          Cadence
        </h3>

        <p className="mt-1 text-xs text-muted-foreground">
          Cadence throughout the run
        </p>
      </div>

      <div className="mt-5 h-56">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <LineChart
            data={chartData}
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
              tickFormatter={(value) =>
                `${value} km`
              }
            />

            <YAxis
              domain={[
                minCadence,
                maxCadence,
              ]}
              tickLine={false}
              axisLine={false}
              tick={{
                fontSize: 10,
              }}
              className="fill-muted-foreground"
              tickFormatter={(value) =>
                `${value}`
              }
            />

            <Tooltip
              formatter={(value) => [
                `${Number(value).toFixed(0)} spm`,
                "Cadence",
              ]}
              labelFormatter={(label) =>
                `${label} km`
              }
            />

            <Line
              type="monotone"
              dataKey="cadence"
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