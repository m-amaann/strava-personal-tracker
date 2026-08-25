"use client";

import type { StravaActivityStreams } from "@/lib/strava/types";

interface RunWorkoutAnalysisProps {
  streams: StravaActivityStreams | null;
}

interface WorkoutSegment {
  kilometer: number;
  pace: number;
  elevation: number;
}

function formatPace(
  minutesPerKm: number,
) {
  if (
    !Number.isFinite(minutesPerKm) ||
    minutesPerKm <= 0
  ) {
    return "—";
  }

  const totalSeconds =
    Math.round(minutesPerKm * 60);

  const minutes = Math.floor(
    totalSeconds / 60,
  );

  const seconds =
    totalSeconds % 60;

  return `${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

function calculateSegments(
  streams: StravaActivityStreams | null,
): WorkoutSegment[] {
  const distance =
    streams?.distance?.data;

  const time =
    streams?.time?.data;

  if (
    !distance ||
    !time ||
    distance.length < 2 ||
    time.length !== distance.length
  ) {
    return [];
  }

  const altitude =
    streams?.altitude?.data;

  const segments: WorkoutSegment[] =
    [];

  let previousDistance =
    Number(distance[0]);

  let previousTime =
    Number(time[0]);

  let splitStartDistance =
    previousDistance;

  let splitStartTime =
    previousTime;

  let elevationGain = 0;

  let segmentNumber = 1;

  for (
    let index = 1;
    index < distance.length;
    index++
  ) {
    const currentDistance =
      Number(distance[index]);

    const currentTime =
      Number(time[index]);

    if (
      !Number.isFinite(currentDistance) ||
      !Number.isFinite(currentTime)
    ) {
      continue;
    }

    if (
      altitude &&
      altitude[index] !== undefined &&
      altitude[index - 1] !== undefined
    ) {
      const previousAltitude =
        Number(
          altitude[index - 1],
        );

      const currentAltitude =
        Number(altitude[index]);

      if (
        Number.isFinite(
          previousAltitude,
        ) &&
        Number.isFinite(
          currentAltitude,
        )
      ) {
        const change =
          currentAltitude -
          previousAltitude;

        if (change > 0) {
          elevationGain +=
            change;
        }
      }
    }

    const boundary =
      splitStartDistance + 1000;

    if (
      currentDistance >= boundary &&
      currentDistance >
        previousDistance
    ) {
      const ratio =
        (boundary -
          previousDistance) /
        (currentDistance -
          previousDistance);

      const boundaryTime =
        previousTime +
        (currentTime -
          previousTime) *
          ratio;

      const duration =
        boundaryTime -
        splitStartTime;

      const pace =
        duration / 60;

      if (
        Number.isFinite(pace) &&
        pace > 0
      ) {
        segments.push({
          kilometer:
            segmentNumber,
          pace,
          elevation:
            elevationGain,
        });
      }

      segmentNumber += 1;

      splitStartDistance =
        boundary;

      splitStartTime =
        boundaryTime;

      elevationGain = 0;
    }

    previousDistance =
      currentDistance;

    previousTime =
      currentTime;
  }

  /*
   * Final partial kilometer.
   *
   * Ignore very small GPS leftovers.
   */
  const remainingDistance =
    previousDistance -
    splitStartDistance;

  const remainingTime =
    previousTime -
    splitStartTime;

  if (
    remainingDistance >= 50 &&
    remainingTime > 0
  ) {
    const distanceKm =
      remainingDistance / 1000;

    const pace =
      remainingTime /
      60 /
      distanceKm;

    if (
      Number.isFinite(pace) &&
      pace > 0
    ) {
      segments.push({
        kilometer:
          segmentNumber,
        pace,
        elevation:
          elevationGain,
      });
    }
  }

  return segments;
}

function buildElevationPath(
  streams: StravaActivityStreams | null,
) {
  const distance =
    streams?.distance?.data;

  const altitude =
    streams?.altitude?.data;

  if (
    !distance ||
    !altitude ||
    distance.length < 2 ||
    distance.length !==
      altitude.length
  ) {
    return null;
  }

  const points: Array<{
    x: number;
    y: number;
  }> = [];

  const validAltitude =
    altitude
      .map((value, index) => ({
        distance:
          Number(distance[index]),
        altitude:
          Number(value),
      }))
      .filter(
        (point) =>
          Number.isFinite(
            point.distance,
          ) &&
          Number.isFinite(
            point.altitude,
          ),
      );

  if (validAltitude.length < 2) {
    return null;
  }

  const minDistance =
    validAltitude[0].distance;

  const maxDistance =
    validAltitude[
      validAltitude.length - 1
    ].distance;

  const minAltitude =
    Math.min(
      ...validAltitude.map(
        (point) => point.altitude,
      ),
    );

  const maxAltitude =
    Math.max(
      ...validAltitude.map(
        (point) => point.altitude,
      ),
    );

  const distanceRange =
    Math.max(
      maxDistance -
        minDistance,
      1,
    );

  const altitudeRange =
    Math.max(
      maxAltitude -
        minAltitude,
      1,
    );

  for (
    const point of validAltitude
  ) {
    const x =
      ((point.distance -
        minDistance) /
        distanceRange) *
      100;

    const y =
      100 -
      ((point.altitude -
        minAltitude) /
        altitudeRange) *
        100;

    points.push({
      x,
      y,
    });
  }

  if (points.length < 2) {
    return null;
  }

  const line = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${
          point.x
        } ${point.y}`,
    )
    .join(" ");

  const area =
    `${line} L 100 100 L 0 100 Z`;

  return {
    line,
    area,
  };
}

export function RunWorkoutAnalysis({
  streams,
}: RunWorkoutAnalysisProps) {
  const segments =
    calculateSegments(streams);

  const elevationPath =
    buildElevationPath(streams);

  if (segments.length === 0) {
    return (
      <div className="flex h-full flex-col rounded-2xl border border-border/70 bg-card p-4 sm:p-5">
        <h2 className="text-lg font-bold tracking-tight">
          Workout Analysis
        </h2>

        <p className="mt-1 text-xs text-muted-foreground">
          Pace and elevation throughout
          your run.
        </p>

        <div className="flex min-h-56 flex-1 items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Workout analysis data is not
            available for this activity.
          </p>
        </div>
      </div>
    );
  }

  const fastestPace =
    Math.min(
      ...segments.map(
        (segment) => segment.pace,
      ),
    );

  const slowestPace =
    Math.max(
      ...segments.map(
        (segment) => segment.pace,
      ),
    );

  const paceRange =
    Math.max(
      slowestPace -
        fastestPace,
      0.01,
    );

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border/70 bg-card p-4 sm:p-5">
      <div>
        <h2 className="text-lg font-bold tracking-tight">
          Workout Analysis
        </h2>

        <p className="mt-1 text-xs text-muted-foreground">
          Pace and elevation throughout
          your run.
        </p>
      </div>

      <div className="mt-6 flex-1">
        {/* Chart */}
        <div className="relative h-70 overflow-hidden rounded-xl bg-muted/20">
          {/* Grid */}
          <div className="pointer-events-none absolute inset-x-0 top-0 bottom-8">
            <div className="absolute inset-x-0 top-[10%] border-t border-border/60" />
            <div className="absolute inset-x-0 top-[30%] border-t border-border/60" />
            <div className="absolute inset-x-0 top-[50%] border-t border-border/60" />
            <div className="absolute inset-x-0 top-[70%] border-t border-border/60" />
            <div className="absolute inset-x-0 top-[90%] border-t border-border/60" />
          </div>

          {/* Pace labels */}
          <div className="absolute left-2 top-1 text-[10px] text-muted-foreground">
            {formatPace(fastestPace)}
          </div>

          <div className="absolute left-2 bottom-10 text-[10px] text-muted-foreground">
            {formatPace(slowestPace)}
          </div>

          {/* Elevation */}
          {elevationPath && (
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-x-0 top-3 h-[calc(100%-44px)] w-full opacity-30"
              aria-hidden="true"
            >
              <path
                d={elevationPath.area}
                fill="currentColor"
                className="text-muted-foreground"
              />

              <path
                d={elevationPath.line}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
                className="text-muted-foreground"
              />
            </svg>
          )}

          {/* Pace bars */}
          <div className="absolute inset-x-4 bottom-8 top-4 flex items-end gap-1">
            {segments.map(
              (segment) => {
                /*
                 * Faster pace =
                 * taller bar.
                 */
                const normalized =
                  (slowestPace -
                    segment.pace) /
                  paceRange;

                const height =
                  48 +
                  normalized * 44;

                return (
                  <div
                    key={
                      segment.kilometer
                    }
                    className="flex min-w-0 flex-1 items-end"
                  >
                    <div
                      className="w-full rounded-t-lg bg-[#1368CE]/85 transition-all"
                      style={{
                        height: `${Math.min(
                          height,
                          94,
                        )}%`,
                      }}
                      title={`Km ${
                        segment.kilometer
                      }: ${formatPace(
                        segment.pace,
                      )} /km`}
                    />
                  </div>
                );
              },
            )}
          </div>

          {/* Average pace line */}
          {segments.length > 0 && (
            <AveragePaceLine
              segments={segments}
            />
          )}

          {/* Kilometer labels */}
          <div className="absolute inset-x-4 bottom-1 flex gap-1">
            {segments.map(
              (segment) => (
                <div
                  key={
                    segment.kilometer
                  }
                  className="min-w-0 flex-1 text-center text-[9px] text-muted-foreground"
                >
                  {segment.kilometer}
                </div>
              ),
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <div>
            <p className="text-xs text-muted-foreground">
              Splits
            </p>

            <p className="text-sm font-semibold">
              {segments.length}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-muted-foreground">
              Best pace
            </p>

            <p className="text-sm font-semibold">
              {formatPace(
                fastestPace,
              )}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                /km
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AveragePaceLine({
  segments,
}: {
  segments: WorkoutSegment[];
}) {
  const averagePace =
    segments.reduce(
      (sum, segment) =>
        sum + segment.pace,
      0,
    ) / segments.length;

  const fastestPace =
    Math.min(
      ...segments.map(
        (segment) => segment.pace,
      ),
    );

  const slowestPace =
    Math.max(
      ...segments.map(
        (segment) => segment.pace,
      ),
    );

  const range =
    Math.max(
      slowestPace -
        fastestPace,
      0.01,
    );

  const position =
    ((slowestPace -
      averagePace) /
      range) *
    100;

  return (
    <div
      className="pointer-events-none absolute inset-x-4"
      style={{
        bottom: `calc(8px + ${
          Math.max(
            8,
            Math.min(
              92,
              position,
            ),
          )
        }% * 0.01 * (100% - 32px))`,
      }}
    >
      <div className="border-t-2 border-dashed border-foreground/50" />
    </div>
  );
}