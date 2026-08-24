import { BarChart3 } from "lucide-react";

import { Card } from "@/components/ui/card";

import { getActivities } from "@/lib/strava/api";

import type { StravaActivity } from "@/lib/strava/types";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

interface WeeklyDistance {
  week: string;
  distance: number;
  start: Date;
}

/* -------------------------------------------------------------------------- */
/* Date helpers                                                               */
/* -------------------------------------------------------------------------- */

function getStartOfWeek(date: Date): Date {
  const result = new Date(date);

  const day = result.getDay();

  // Monday = start of week
  const difference =
    day === 0 ? 6 : day - 1;

  result.setDate(
    result.getDate() - difference,
  );

  result.setHours(0, 0, 0, 0);

  return result;
}

function formatWeekLabel(date: Date): string {
  return `Wk ${getWeekNumber(date)}`;
}

function getWeekNumber(date: Date): number {
  const startOfYear = new Date(
    date.getFullYear(),
    0,
    1,
  );

  const startOfWeek = getStartOfWeek(
    startOfYear,
  );

  const currentWeek = getStartOfWeek(
    date,
  );

  const difference =
    currentWeek.getTime() -
    startOfWeek.getTime();

  return (
    Math.floor(
      difference /
        (7 * 24 * 60 * 60 * 1000),
    ) + 1
  );
}

/* -------------------------------------------------------------------------- */
/* Distance formatter                                                         */
/* -------------------------------------------------------------------------- */

function formatDistance(
  distanceMeters: number,
): string {
  return (
    distanceMeters / 1000
  ).toFixed(1);
}

/* -------------------------------------------------------------------------- */
/* Get last 8 weeks                                                           */
/* -------------------------------------------------------------------------- */

function createLastEightWeeks(): WeeklyDistance[] {
  const currentWeek =
    getStartOfWeek(new Date());

  return Array.from(
    { length: 8 },
    (_, index) => {
      const start = new Date(
        currentWeek,
      );

      start.setDate(
        start.getDate() -
          (7 * (7 - index)),
      );

      return {
        week: formatWeekLabel(start),
        distance: 0,
        start,
      };
    },
  );
}

/* -------------------------------------------------------------------------- */
/* Weekly Distance Chart                                                      */
/* -------------------------------------------------------------------------- */

export async function WeeklyDistanceChart() {
  const activities: StravaActivity[] = [];

  try {
    /*
     * Fetch enough Strava activities
     * to cover the previous 8 weeks.
     */
    let page = 1;

    const eightWeeksAgo =
      getStartOfWeek(new Date());

    eightWeeksAgo.setDate(
      eightWeeksAgo.getDate() - 7 * 7,
    );

    while (true) {
      const pageActivities =
        await getActivities(
          page,
          200,
        );

      if (
        pageActivities.length === 0
      ) {
        break;
      }

      activities.push(
        ...pageActivities,
      );

      /*
       * Strava returns activities from
       * newest to oldest.
       *
       * Once the oldest activity on the
       * page is older than our required
       * range, there is no reason to
       * request more pages.
       */
      const oldestActivity =
        pageActivities[
          pageActivities.length - 1
        ];

      if (oldestActivity) {
        const oldestDate =
          new Date(
            oldestActivity.start_date_local,
          );

        if (
          oldestDate < eightWeeksAgo
        ) {
          break;
        }
      }

      if (
        pageActivities.length < 200
      ) {
        break;
      }

      page += 1;
    }
  } catch (error) {
    console.error(
      "Failed to fetch weekly distance data:",
      error,
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Build eight-week dataset                                                 */
  /* ------------------------------------------------------------------------ */

  const weeklyData =
    createLastEightWeeks();

  for (const activity of activities) {
    /*
     * Only running activities.
     */
    if (
      activity.type?.toLowerCase() !==
      "run"
    ) {
      continue;
    }

    const activityDate =
      new Date(
        activity.start_date_local,
      );

    const activityWeek =
      getStartOfWeek(
        activityDate,
      );

    const matchingWeek =
      weeklyData.find(
        (week) =>
          week.start.getTime() ===
          activityWeek.getTime(),
      );

    if (matchingWeek) {
      matchingWeek.distance +=
        activity.distance;
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Current week                                                             */
  /* ------------------------------------------------------------------------ */

  const currentWeek =
    weeklyData[
      weeklyData.length - 1
    ];

  const currentDistance =
    currentWeek?.distance ?? 0;

  /* ------------------------------------------------------------------------ */
  /* Previous week                                                            */
  /* ------------------------------------------------------------------------ */

  const previousWeek =
    weeklyData[
      weeklyData.length - 2
    ];

  const previousDistance =
    previousWeek?.distance ?? 0;

  /* ------------------------------------------------------------------------ */
  /* Percentage change                                                        */
  /* ------------------------------------------------------------------------ */

  let percentageChange = 0;

  if (previousDistance > 0) {
    percentageChange =
      ((currentDistance -
        previousDistance) /
        previousDistance) *
      100;
  } else if (
    currentDistance > 0
  ) {
    percentageChange = 100;
  }

  /* ------------------------------------------------------------------------ */
  /* Maximum chart value                                                      */
  /* ------------------------------------------------------------------------ */

  const maxDistance = Math.max(
    ...weeklyData.map(
      (item) => item.distance,
    ),
    1000,
  );

  /*
   * Round chart maximum so the
   * scale looks clean.
   */
  const chartMax =
    Math.ceil(
      maxDistance / 5000,
    ) * 5000;

  /* ------------------------------------------------------------------------ */
  /* Average                                                                  */
  /* ------------------------------------------------------------------------ */

  const totalDistance =
    weeklyData.reduce(
      (total, item) =>
        total + item.distance,
      0,
    );

  const averageDistance =
    totalDistance /
    weeklyData.length;

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <Card
      className="
        overflow-hidden
        rounded-2xl
        border-border/70
        bg-card
        p-4
        shadow-none
        sm:p-5
      "
    >
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                              */}
      {/* ------------------------------------------------------------------ */}

      <div
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div
              className="
                flex
                size-7
                shrink-0
                items-center
                justify-center
                rounded-lg
                bg-[#FFF1EB]
                text-[#FC4C02]
              "
            >
              <BarChart3 className="size-3.5" />
            </div>

            <h2
              className="
                truncate
                text-sm
                font-semibold
                tracking-tight
                sm:text-base
              "
            >
              Weekly Distance
            </h2>
          </div>

          <p
            className="
              mt-1
              text-[11px]
              text-muted-foreground
              sm:text-xs
            "
          >
            Running volume over the
            last 8 weeks
          </p>
        </div>

        <div
          className="
            shrink-0
            text-right
          "
        >
          <p
            className="
              text-[10px]
              text-muted-foreground
            "
          >
            Average
          </p>

          <p
            className="
              text-sm
              font-bold
            "
          >
            {formatDistance(
              averageDistance,
            )}{" "}
            <span
              className="
                text-[10px]
                font-medium
                text-muted-foreground
              "
            >
              km
            </span>
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Chart                                                               */}
      {/* ------------------------------------------------------------------ */}

      <div
        className="
          mt-5
          rounded-xl
          bg-muted/20
          px-2
          pb-2
          pt-4
          sm:px-3
        "
      >
        <div
          className="
            flex
            h-44
            gap-2
            sm:h-48
            sm:gap-3
          "
        >
          {/* Y axis */}

          <div
            className="
              flex
              w-7
              shrink-0
              flex-col
              justify-between
              pb-6
              text-right
            "
          >
            <span
              className="
                text-[9px]
                text-muted-foreground
              "
            >
              {Math.round(
                chartMax / 1000,
              )}
            </span>

            <span
              className="
                text-[9px]
                text-muted-foreground
              "
            >
              {Math.round(
                chartMax /
                  1000 /
                  2,
              )}
            </span>

            <span
              className="
                text-[9px]
                text-muted-foreground
              "
            >
              0
            </span>
          </div>

          {/* Bars */}

          <div
            className="
              relative
              flex
              min-w-0
              flex-1
              items-end
              justify-between
              gap-1
              border-b
              border-border/70
            "
          >
            {/* Horizontal grid lines */}

            <div
              className="
                pointer-events-none
                absolute
                inset-x-0
                top-0
                border-t
                border-border/40
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                inset-x-0
                top-1/2
                border-t
                border-border/30
              "
            />

            {weeklyData.map(
              (item) => {
                const height =
                  chartMax > 0
                    ? Math.max(
                        (item.distance /
                          chartMax) *
                          100,
                        item.distance >
                          0
                          ? 4
                          : 0,
                      )
                    : 0;

                const isCurrent =
                  item.start.getTime() ===
                  currentWeek?.start.getTime();

                return (
                  <div
                    key={item.start.toISOString()}
                    className="
                      relative
                      flex
                      h-full
                      min-w-0
                      flex-1
                      items-end
                      justify-center
                    "
                  >
                    {/* Bar */}

                    <div
                      className={`
                        group
                        relative
                        w-full
                        max-w-7
                        rounded-t-md
                        transition-all
                        duration-300
                        sm:max-w-8
                        ${
                          isCurrent
                            ? "bg-[#FC4C02]"
                            : "bg-[#FC4C02]/85"
                        }
                        hover:bg-[#FC4C02]
                      `}
                      style={{
                        height: `${height}%`,
                      }}
                    >
                      {/* Tooltip */}

                      <div
                        className="
                          pointer-events-none
                          absolute
                          bottom-full
                          left-1/2
                          z-20
                          mb-2
                          -translate-x-1/2
                          whitespace-nowrap
                          rounded-lg
                          border
                          border-border
                          bg-background
                          px-2
                          py-1.5
                          text-[10px]
                          opacity-0
                          shadow-lg
                          transition-opacity
                          group-hover:opacity-100
                        "
                      >
                        <p className="font-semibold">
                          {formatDistance(
                            item.distance,
                          )}{" "}
                          km
                        </p>

                        <p className="text-muted-foreground">
                          {item.week}
                        </p>
                      </div>
                    </div>

                    {/* Label */}

                    <span
                      className="
                        absolute
                        -bottom-5
                        left-1/2
                        -translate-x-1/2
                        whitespace-nowrap
                        text-[9px]
                        text-muted-foreground
                      "
                    >
                      {item.week}
                    </span>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Current week                                                        */}
      {/* ------------------------------------------------------------------ */}

      <div
        className="
          mt-7
          flex
          items-center
          justify-between
          border-t
          border-border/70
          pt-3
        "
      >
        <div>
          <p
            className="
              text-[10px]
              font-medium
              text-muted-foreground
            "
          >
            Current week
          </p>

          <p
            className="
              mt-0.5
              text-xs
              text-muted-foreground
            "
          >
            Compared with last week
          </p>
        </div>

        <div className="text-right">
          <p
            className="
              text-sm
              font-bold
            "
          >
            {formatDistance(
              currentDistance,
            )}{" "}
            km
          </p>

          <p
            className={`
              text-[10px]
              font-medium
              ${
                percentageChange >=
                0
                  ? "text-emerald-600"
                  : "text-red-500"
              }
            `}
          >
            {percentageChange >= 0
              ? "↑"
              : "↓"}{" "}
            {Math.abs(
              percentageChange,
            ).toFixed(1)}
            %
          </p>
        </div>
      </div>
    </Card>
  );
}