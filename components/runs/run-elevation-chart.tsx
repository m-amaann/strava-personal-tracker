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

interface RunElevationChartProps {
  streams: StravaActivityStreams | null;
}

export function RunElevationChart({
  streams,
}: RunElevationChartProps) {
  const distance = streams?.distance?.data;
  const altitude = streams?.altitude?.data;

  const chartData =
    distance && altitude
      ? distance
          .map((distanceValue, index) => {
            const elevation = altitude[index];

            if (elevation == null) {
              return null;
            }

            return {
              distance: (
                Number(distanceValue) / 1000
              ).toFixed(1),
              elevation: Number(elevation),
            };
          })
          .filter(Boolean)
      : [];

  if (chartData.length === 0) {
    return (
      <Card className="border-border/70 bg-card p-4 sm:p-5">
        <h3 className="text-base font-semibold">
          Elevation
        </h3>

        <p className="mt-1 text-xs text-muted-foreground">
          Elevation stream data is not available
          for this activity.
        </p>
      </Card>
    );
  }

  const elevations = chartData.map(
    (item) => item!.elevation,
  );

  const minElevation = Math.floor(
    Math.min(...elevations) - 5,
  );

  const maxElevation = Math.ceil(
    Math.max(...elevations) + 5,
  );

  return (
    <Card className="border-border/70 bg-card p-4 sm:p-5">
      <div>
        <h3 className="text-base font-semibold">
          Elevation
        </h3>

        <p className="mt-1 text-xs text-muted-foreground">
          Elevation throughout the run
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
                id="elevationGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#FC4C02"
                  stopOpacity={0.25}
                />

                <stop
                  offset="100%"
                  stopColor="#FC4C02"
                  stopOpacity={0.03}
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
              tickFormatter={(value) =>
                `${value} km`
              }
            />

            <YAxis
              domain={[
                minElevation,
                maxElevation,
              ]}
              tickLine={false}
              axisLine={false}
              tick={{
                fontSize: 10,
              }}
              className="fill-muted-foreground"
              tickFormatter={(value) =>
                `${value}m`
              }
            />

            <Tooltip
              formatter={(value) => [
                `${Number(value).toFixed(0)} m`,
                "Elevation",
              ]}
              labelFormatter={(label) =>
                `${label} km`
              }
            />

            <Area
              type="monotone"
              dataKey="elevation"
              stroke="#FC4C02"
              strokeWidth={2.5}
              fill="url(#elevationGradient)"
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