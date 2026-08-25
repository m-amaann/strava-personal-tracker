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

interface PacePoint {
  distance: number;
  pace: number;
}

function formatPace(
  value: number,
): string {
  if (
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return "—";
  }

  const totalSeconds = Math.round(
    value * 60,
  );

  const minutes = Math.floor(
    totalSeconds / 60,
  );

  const seconds =
    totalSeconds % 60;

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

  if (
    !distance ||
    !velocity ||
    distance.length === 0 ||
    velocity.length === 0
  ) {
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

  const length = Math.min(
    distance.length,
    velocity.length,
  );

  const paceData: PacePoint[] = [];

  for (
    let index = 0;
    index < length;
    index += 1
  ) {
    const distanceValue =
      Number(distance[index]);

    const speed =
      Number(velocity[index]);

    if (
      !Number.isFinite(
        distanceValue,
      ) ||
      !Number.isFinite(speed) ||
      speed <= 0
    ) {
      continue;
    }

    const pace =
      1000 /
      speed /
      60;

    /*
     * Ignore clearly invalid stream
     * values caused by pauses/GPS issues.
     *
     * 20 min/km is enough to represent
     * a very slow run while preventing
     * giant 50-80 min/km spikes.
     */
    if (
      !Number.isFinite(pace) ||
      pace <= 0 ||
      pace > 20
    ) {
      continue;
    }

    paceData.push({
      distance:
        distanceValue / 1000,
      pace,
    });
  }

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

      <div className="mt-5 h-56 w-full min-w-0">
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
              strokeOpacity={0.12}
            />

            <XAxis
              dataKey="distance"
              type="number"
              domain={[
                "dataMin",
                "dataMax",
              ]}
              tickLine={false}
              axisLine={false}
              tick={{
                fontSize: 10,
              }}
              tickFormatter={(value) =>
                Number(value).toFixed(1)
              }
              className="fill-muted-foreground"
            />

            <YAxis
              reversed
              domain={[
                "dataMin - 0.25",
                "dataMax + 0.25",
              ]}
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
              labelFormatter={(value) =>
                `${Number(value).toFixed(
                  2,
                )} km`
              }
            />

            <Line
              type="monotone"
              dataKey="pace"
              stroke="#FC4C02"
              strokeWidth={2.5}
              dot={false}
              connectNulls={false}
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