"use client";

import type { StravaActivityStreams } from "@/lib/strava/types";

interface RunSplitsProps {
  streams: StravaActivityStreams | null;
}

interface Split {
  kilometer: number;
  distance: number;
  duration: number;
  pace: number;
  elevation: number | null;
  heartRate: number | null;
}

function formatPace(minutesPerKm: number) {
  if (
    !Number.isFinite(minutesPerKm) ||
    minutesPerKm <= 0
  ) {
    return "—";
  }

  const totalSeconds = Math.round(
    minutesPerKm * 60,
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

function calculateSplits(
  streams: StravaActivityStreams | null,
): Split[] {
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

  const heartRate =
    streams?.heartrate?.data;

  const splits: Split[] = [];

  let previousDistance =
    Number(distance[0]);

  let previousTime =
    Number(time[0]);

  let previousAltitude =
    altitude &&
    altitude.length > 0
      ? Number(altitude[0])
      : null;

  let splitStartDistance =
    previousDistance;

  let splitStartTime =
    previousTime;

  let splitElevation = 0;

  let heartRateSum = 0;
  let heartRateCount = 0;

  let splitNumber = 1;

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

    const segmentDistance =
      currentDistance -
      previousDistance;

    const segmentTime =
      currentTime -
      previousTime;

    if (
      segmentDistance < 0 ||
      segmentTime < 0
    ) {
      previousDistance =
        currentDistance;

      previousTime =
        currentTime;

      continue;
    }

    /*
     * Calculate positive elevation gain.
     */
    if (
      altitude &&
      altitude[index] !== undefined &&
      previousAltitude !== null
    ) {
      const currentAltitude =
        Number(altitude[index]);

      if (
        Number.isFinite(currentAltitude)
      ) {
        const elevationChange =
          currentAltitude -
          previousAltitude;

        if (elevationChange > 0) {
          splitElevation +=
            elevationChange;
        }

        previousAltitude =
          currentAltitude;
      }
    }

    /*
     * Calculate average heart rate
     * for this split.
     */
    if (
      heartRate &&
      heartRate[index] !== undefined
    ) {
      const hr =
        Number(heartRate[index]);

      if (
        Number.isFinite(hr) &&
        hr > 0
      ) {
        heartRateSum += hr;
        heartRateCount += 1;
      }
    }

    /*
     * Check whether the current
     * stream point crossed the next
     * 1 km boundary.
     */
    const splitEndDistance =
      splitStartDistance + 1000;

    while (
      currentDistance >=
        splitEndDistance &&
      currentDistance >
        previousDistance
    ) {
      const boundaryDistance =
        splitEndDistance;

      const ratio =
        (boundaryDistance -
          previousDistance) /
        (currentDistance -
          previousDistance);

      const boundaryTime =
        previousTime +
        (currentTime -
          previousTime) *
          ratio;

      const splitDuration =
        boundaryTime -
        splitStartTime;

      const pace =
        splitDuration / 60;

      if (
        Number.isFinite(pace) &&
        pace > 0
      ) {
        splits.push({
          kilometer: splitNumber,
          distance: 1,
          duration: splitDuration,
          pace,
          elevation:
            splitElevation > 0
              ? splitElevation
              : 0,
          heartRate:
            heartRateCount > 0
              ? heartRateSum /
                heartRateCount
              : null,
        });
      }

      splitNumber += 1;

      splitStartDistance =
        boundaryDistance;

      splitStartTime =
        boundaryTime;

      splitElevation = 0;

      heartRateSum = 0;
      heartRateCount = 0;
    }

    previousDistance =
      currentDistance;

    previousTime =
      currentTime;
  }

  /*
   * Add the final partial split.
   *
   * Ignore tiny GPS leftovers under
   * 50 meters.
   */
  const finalDistance =
    previousDistance -
    splitStartDistance;

  const finalDuration =
    previousTime -
    splitStartTime;

  if (
    finalDistance >= 50 &&
    finalDuration > 0
  ) {
    const distanceKm =
      finalDistance / 1000;

    const pace =
      finalDuration /
      60 /
      distanceKm;

    if (
      Number.isFinite(pace) &&
      pace > 0
    ) {
      splits.push({
        kilometer: splitNumber,
        distance: distanceKm,
        duration: finalDuration,
        pace,
        elevation:
          splitElevation > 0
            ? splitElevation
            : 0,
        heartRate:
          heartRateCount > 0
            ? heartRateSum /
              heartRateCount
            : null,
      });
    }
  }

  return splits;
}

export function RunSplits({
  streams,
}: RunSplitsProps) {
  const splits =
    calculateSplits(streams);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border/70 bg-card p-4 sm:p-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold tracking-tight">
          Splits
        </h2>

        <p className="mt-1 text-xs text-muted-foreground">
          Automatic 1 km splits calculated
          from your Strava activity data.
        </p>
      </div>

      {/* Empty state */}
      {splits.length === 0 ? (
        <div className="flex min-h-56 flex-1 items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Split data is not available for
            this activity.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <div className="min-w-135">
            {/* Table header */}
            <div
              className="
                grid
                grid-cols-[60px_minmax(0,1fr)_100px_60px]
                items-center
                gap-4
                border-b
                border-border
                pb-3
                text-xs
                font-medium
                text-muted-foreground
              "
            >
              <span>Km</span>

              <span>Pace</span>

              <span className="text-right">
                Elev
              </span>

              <span className="text-right">
                HR
              </span>
            </div>

            {/* Split rows */}
            <div>
              {splits.map((split) => {
                const fastestPace =
                  Math.min(
                    ...splits.map(
                      (item) => item.pace,
                    ),
                  );

                const slowestPace =
                  Math.max(
                    ...splits.map(
                      (item) => item.pace,
                    ),
                  );

                const range =
                  slowestPace -
                  fastestPace;

                /*
                 * Faster pace = longer blue
                 * bar.
                 */
                const barWidth =
                  range > 0
                    ? 25 +
                      ((slowestPace -
                        split.pace) /
                        range) *
                        75
                    : 100;

                return (
                  <div
                    key={split.kilometer}
                    className="
                      grid
                      grid-cols-[60px_minmax(0,1fr)_100px_60px]
                      items-center
                      gap-4
                      border-b
                      border-border/70
                      py-3
                      last:border-b-0
                    "
                  >
                    {/* Kilometer */}
                    <span className="text-sm font-medium">
                      {split.kilometer}
                    </span>

                    {/* Pace + blue bar */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="w-10 shrink-0 text-sm font-medium">
                          {formatPace(
                            split.pace,
                          )}
                        </span>

                        <div className="h-5 min-w-0 flex-1 overflow-hidden rounded-r-md">
                          <div
                            className="h-full rounded-r-md bg-[#1368CE] transition-all"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(
                                  25,
                                  barWidth,
                                ),
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Elevation */}
                    <span className="text-right text-sm text-muted-foreground">
                      {split.elevation !==
                      null
                        ? `${
                            split.elevation >=
                            0
                              ? "+"
                              : ""
                          }${Math.round(
                            split.elevation,
                          )}`
                        : "—"}
                    </span>

                    {/* Heart rate */}
                    <span className="text-right text-sm text-muted-foreground">
                      {split.heartRate !==
                      null
                        ? Math.round(
                            split.heartRate,
                          )
                        : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}