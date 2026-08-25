"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { Card } from "@/components/ui/card";

export type HeartRateZone = {
  zone: number;
  label: string;
  min: number;
  max: number;
  seconds: number;
  percentage: number;
};

interface HeartRateZonesProps {
  zones?: HeartRateZone[];
  averageHeartRate?: number | null;
  maxHeartRate?: number | null;
}

const zoneColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function formatDuration(totalSeconds: number) {
  if (
    !Number.isFinite(totalSeconds) ||
    totalSeconds <= 0
  ) {
    return "0:00";
  }

  const seconds = Math.round(totalSeconds);

  const hours = Math.floor(seconds / 3600);

  const minutes = Math.floor(
    (seconds % 3600) / 60,
  );

  const remainingSeconds =
    seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }

  return `${minutes}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

function formatPercentage(
  percentage: number,
) {
  if (
    !Number.isFinite(percentage) ||
    percentage <= 0
  ) {
    return 0;
  }

  return Math.round(percentage);
}

function ZoneTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    payload: HeartRateZone;
  }>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const zone = payload[0]?.payload;

  if (!zone) {
    return null;
  }

  return (
    <div className="rounded-xl border bg-background px-3 py-2 shadow-lg">
      <p className="text-xs font-medium">
        {zone.label}
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        {zone.min}–{zone.max} bpm
      </p>

      <p className="mt-1 text-sm font-semibold">
        {formatDuration(zone.seconds)}
      </p>
    </div>
  );
}

export function HeartRateZones({
  zones = [],
  averageHeartRate = null,
  maxHeartRate = null,
}: HeartRateZonesProps) {
  const validZones = zones.filter(
    (zone) =>
      Number.isFinite(zone.seconds) &&
      zone.seconds > 0,
  );

  const totalTime = zones.reduce(
    (total, zone) =>
      total +
      (Number.isFinite(zone.seconds)
        ? Math.max(zone.seconds, 0)
        : 0),
    0,
  );

  const calculatedZones = zones.map(
    (zone) => ({
      ...zone,
      percentage:
        totalTime > 0
          ? (Math.max(zone.seconds, 0) /
              totalTime) *
            100
          : 0,
    }),
  );

  const hasZoneData =
    validZones.length > 0 &&
    totalTime > 0;

  return (
    <Card className="p-5 shadow-none sm:p-6">
      <div>
        <h2 className="text-base font-semibold tracking-tight">
          Heart Rate Zones
        </h2>

        <p className="mt-1 text-xs text-muted-foreground">
          Time spent in each heart-rate zone
        </p>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <div className="rounded-2xl bg-muted/40 p-3">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Average
          </p>

          <p className="mt-1 text-lg font-semibold">
            {averageHeartRate !== null &&
            Number.isFinite(
              averageHeartRate,
            ) &&
            averageHeartRate > 0 ? (
              <>
                {Math.round(
                  averageHeartRate,
                )}

                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  bpm
                </span>
              </>
            ) : (
              "—"
            )}
          </p>
        </div>

        <div className="rounded-2xl bg-muted/40 p-3">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Max HR
          </p>

          <p className="mt-1 text-lg font-semibold">
            {maxHeartRate !== null &&
            Number.isFinite(
              maxHeartRate,
            ) &&
            maxHeartRate > 0 ? (
              <>
                {Math.round(maxHeartRate)}

                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  bpm
                </span>
              </>
            ) : (
              "—"
            )}
          </p>
        </div>

        <div className="rounded-2xl bg-muted/40 p-3">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Time
          </p>

          <p className="mt-1 text-lg font-semibold">
            {hasZoneData
              ? formatDuration(totalTime)
              : "—"}
          </p>
        </div>
      </div>

      {!hasZoneData ? (
        <div className="flex min-h-60 items-center justify-center">
          <p className="text-sm text-muted-foreground">
            No heart-rate zone data available.
          </p>
        </div>
      ) : (
        <div className="mt-5 grid items-center gap-4 sm:grid-cols-[150px_1fr]">
          <div className="h-45 w-full">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={calculatedZones}
                  dataKey="seconds"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius="58%"
                  outerRadius="82%"
                  paddingAngle={1}
                  stroke="none"
                >
                  {calculatedZones.map(
                    (zone) => (
                      <Cell
                        key={zone.zone}
                        fill={
                          zoneColors[
                            Math.min(
                              zone.zone - 1,
                              zoneColors.length -
                                1,
                            )
                          ]
                        }
                      />
                    ),
                  )}
                </Pie>

                <Tooltip
                  content={<ZoneTooltip />}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {calculatedZones.map(
              (zone) => {
                const colorIndex =
                  Math.min(
                    zone.zone - 1,
                    zoneColors.length - 1,
                  );

                return (
                  <div
                    key={zone.zone}
                    className="flex items-center gap-2"
                  >
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          zoneColors[
                            colorIndex
                          ],
                      }}
                    />

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium">
                        {zone.label}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-semibold">
                        {formatPercentage(
                          zone.percentage,
                        )}
                        %
                      </p>

                      <p className="text-[10px] text-muted-foreground">
                        {formatDuration(
                          zone.seconds,
                        )}
                      </p>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </div>
      )}
    </Card>
  );
}