"use client";

import {
  Bike,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Footprints,
  SportShoe,
  Mountain,
  Waves,
} from "lucide-react";

import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";

import type {
  ActivityType,
  CalendarActivity,
  CalendarDayData,
} from "@/lib/strava/calendar";

/* -------------------------------------------------------------------------- */
/* Props                                                                      */
/* -------------------------------------------------------------------------- */

type ActivityCalendarProps = {
  year: number;

  month: number;

  days: CalendarDayData[];
};

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const weekdays = [
  "MON",
  "TUE",
  "WED",
  "THU",
  "FRI",
  "SAT",
  "SUN",
];

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatDistance(
  meters: number,
) {
  return `${(
    meters / 1000
  ).toFixed(2)} km`;
}

function formatMovingTime(
  seconds: number,
) {
  const minutes = Math.round(
    seconds / 60,
  );

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(
    minutes / 60,
  );

  const remainingMinutes =
    minutes % 60;

  if (
    remainingMinutes === 0
  ) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

/* -------------------------------------------------------------------------- */
/* Activity Icon                                                              */
/* -------------------------------------------------------------------------- */

function ActivityIcon({
  type,
}: {
  type: ActivityType;
}) {
  switch (type) {
    case "running":
      return (
        <SportShoe
          className="size-4"
          strokeWidth={2}
        />
      );

    case "cycling":
      return (
        <Bike
          className="size-4"
          strokeWidth={2}
        />
      );

    case "swimming":
      return (
        <Waves
          className="size-4"
          strokeWidth={2}
        />
      );

    case "walking":
      return (
        <Footprints
          className="size-4"
          strokeWidth={2}
        />
      );

    case "hiking":
      return (
        <Mountain
          className="size-4"
          strokeWidth={2}
        />
      );

    case "workout":
      return (
        <Dumbbell
          className="size-4"
          strokeWidth={2}
        />
      );

    case "gym":
      return (
        <Dumbbell
          className="size-4"
          strokeWidth={2}
        />
      );

    default:
      return (
        <Footprints
          className="size-4"
          strokeWidth={2}
        />
      );
  }
}

/* -------------------------------------------------------------------------- */
/* Activity Colors                                                            */
/* -------------------------------------------------------------------------- */

function getActivityStyle(
  type: ActivityType,
) {
  switch (type) {
    case "running":
      return {
        background:
          "bg-[#FC4C02]",
        text:
          "text-white",
      };

    case "cycling":
      return {
        background:
          "bg-blue-500",
        text:
          "text-white",
      };

    case "swimming":
      return {
        background:
          "bg-cyan-500",
        text:
          "text-white",
      };

    case "walking":
      return {
        background:
          "bg-emerald-500",
        text:
          "text-white",
      };

    case "hiking":
      return {
        background:
          "bg-amber-500",
        text:
          "text-white",
      };

    case "workout":
      return {
        background:
          "bg-purple-500",
        text:
          "text-white",
      };

    case "gym":
      return {
        background:
          "bg-violet-500",
        text:
          "text-white",
      };

    default:
      return {
        background:
          "bg-muted",
        text:
          "text-foreground",
      };
  }
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export function ActivityCalendar({
  year,
  month,
  days,
}: ActivityCalendarProps) {
  const router =
    useRouter();

  const monthName =
    monthNames[month] ??
    "";

  /* ------------------------------------------------------------------------ */
  /* Previous Month                                                           */
  /* ------------------------------------------------------------------------ */

  function goToPreviousMonth() {
    const date =
      new Date(
        year,
        month - 1,
        1,
      );

    router.push(
      `/calendar?year=${date.getFullYear()}&month=${date.getMonth()}`,
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Next Month                                                               */
  /* ------------------------------------------------------------------------ */

  function goToNextMonth() {
    const date =
      new Date(
        year,
        month + 1,
        1,
      );

    router.push(
      `/calendar?year=${date.getFullYear()}&month=${date.getMonth()}`,
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Calendar Calculations                                                    */
  /* ------------------------------------------------------------------------ */

  const daysInMonth =
    new Date(
      year,
      month + 1,
      0,
    ).getDate();

  const firstDay =
    new Date(
      year,
      month,
      1,
    ).getDay();

  /*
   * JavaScript:
   *
   * Sunday = 0
   * Monday = 1
   *
   * We want Monday-first.
   */

  const mondayOffset =
    firstDay === 0
      ? 6
      : firstDay - 1;

  /* ------------------------------------------------------------------------ */
  /* Calendar Cells                                                           */
  /* ------------------------------------------------------------------------ */

  const calendarCells:
    Array<number | null> = [];

  for (
    let i = 0;
    i < mondayOffset;
    i++
  ) {
    calendarCells.push(
      null,
    );
  }

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    calendarCells.push(
      day,
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Activity Lookup                                                          */
  /* ------------------------------------------------------------------------ */

  const activitiesByDate =
    new Map<
      string,
      CalendarActivity[]
    >();

  for (const day of days) {
    activitiesByDate.set(
      day.date,
      day.activities,
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Month Activities                                                         */
  /* ------------------------------------------------------------------------ */

  const monthActivities =
    days.flatMap(
      (day) =>
        day.activities,
    );

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <Card
      className="
        overflow-hidden
        border-border/70
        shadow-none
      "
    >
      {/* ================================================================== */}
      {/* Header                                                             */}
      {/* ================================================================== */}

      <div
        className="
          flex
          items-center
          justify-between
          px-5
          pt-5
          sm:px-6
          sm:pt-6
        "
      >
        {/* Previous */}

        <button
          type="button"
          onClick={
            goToPreviousMonth
          }
          aria-label="Previous month"
          className="
            flex
            size-8
            items-center
            justify-center
            rounded-full
            text-muted-foreground
            transition-colors
            hover:bg-muted
            hover:text-foreground
          "
        >
          <ChevronLeft
            className="size-4"
          />
        </button>

        {/* Month */}

        <div className="text-center">
          <h2
            className="
              text-base
              font-bold
              tracking-tight
              sm:text-lg
            "
          >
            {monthName} {year}
          </h2>

          <p
            className="
              mt-0.5
              text-[10px]
              text-muted-foreground
            "
          >
            Strava activities
          </p>
        </div>

        {/* Next */}

        <button
          type="button"
          onClick={
            goToNextMonth
          }
          aria-label="Next month"
          className="
            flex
            size-8
            items-center
            justify-center
            rounded-full
            text-muted-foreground
            transition-colors
            hover:bg-muted
            hover:text-foreground
          "
        >
          <ChevronRight
            className="size-4"
          />
        </button>
      </div>

      {/* ================================================================== */}
      {/* Weekdays                                                            */}
      {/* ================================================================== */}

      <div
        className="
          mt-6
          grid
          grid-cols-7
          px-5
          sm:px-6
        "
      >
        {weekdays.map(
          (weekday) => (
            <div
              key={weekday}
              className="
                text-center
                text-[10px]
                font-medium
                text-muted-foreground
              "
            >
              {weekday}
            </div>
          ),
        )}
      </div>

      {/* ================================================================== */}
      {/* Calendar Grid                                                       */}
      {/* ================================================================== */}

      <div
        className="
          mt-3
          grid
          grid-cols-7
          gap-y-2
          px-5
          pb-5
          sm:gap-y-3
          sm:px-6
          sm:pb-6
        "
      >
        {calendarCells.map(
          (day, index) => {
            if (
              day === null
            ) {
              return (
                <div
                  key={`empty-${index}`}
                  className="
                    h-14
                    sm:h-16
                  "
                />
              );
            }

            const dateKey =
              `${year}-${String(
                month + 1,
              ).padStart(
                2,
                "0",
              )}-${String(
                day,
              ).padStart(
                2,
                "0",
              )}`;

            const activities =
              activitiesByDate.get(
                dateKey,
              ) ?? [];

            const hasActivity =
              activities.length >
              0;

            /*
             * If multiple activities
             * happened on the same day,
             * show the first activity icon.
             *
             * The activity list below
             * still shows every activity.
             */

            const primaryActivity =
              activities[0];

            return (
              <div
                key={dateKey}
                className="
                  flex
                  h-14
                  items-center
                  justify-center
                  sm:h-16
                "
              >
                {hasActivity &&
                primaryActivity ? (
                  <div
                    title={activities
                      .map(
                        (activity) =>
                          activity.name,
                      )
                      .join(", ")}
                    className={`
                      flex
                      size-8
                      items-center
                      justify-center
                      rounded-full
                      shadow-sm
                      ${getActivityStyle(
                        primaryActivity.type,
                      ).background}
                      ${getActivityStyle(
                        primaryActivity.type,
                      ).text}
                    `}
                  >
                    <ActivityIcon
                      type={
                        primaryActivity.type
                      }
                    />
                  </div>
                ) : (
                  <div
                    className="
                      flex
                      size-8
                      items-center
                      justify-center
                      text-xs
                      text-muted-foreground
                    "
                  >
                    {day}
                  </div>
                )}
              </div>
            );
          },
        )}
      </div>

      {/* ================================================================== */}
      {/* Activities                                                          */}
      {/* ================================================================== */}

      <div
        className="
          border-t
          border-border/70
          px-5
          py-5
          sm:px-6
        "
      >
        <p
          className="
            text-xs
            font-semibold
          "
        >
          Activities
        </p>

        {monthActivities.length ===
        0 ? (
          <p
            className="
              mt-4
              text-xs
              text-muted-foreground
            "
          >
            No activities this month.
          </p>
        ) : (
          <div
            className="
              mt-3
              space-y-2
            "
          >
            {monthActivities.map(
              (activity) => {
                const style =
                  getActivityStyle(
                    activity.type,
                  );

                return (
                  <div
                    key={activity.id}
                    className="
                      flex
                      items-center
                      justify-between
                      rounded-xl
                      bg-muted/40
                      px-3
                      py-2.5
                    "
                  >
                    {/* Activity */}

                    <div
                      className="
                        flex
                        min-w-0
                        items-center
                        gap-3
                      "
                    >
                      <div
                        className={`
                          flex
                          size-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          ${style.background}
                          ${style.text}
                        `}
                      >
                        <ActivityIcon
                          type={
                            activity.type
                          }
                        />
                      </div>

                      <div
                        className="
                          min-w-0
                        "
                      >
                        <p
                          className="
                            truncate
                            text-xs
                            font-medium
                          "
                        >
                          {activity.name}
                        </p>

                        <p
                          className="
                            mt-0.5
                            text-[10px]
                            capitalize
                            text-muted-foreground
                          "
                        >
                          {activity.type}
                        </p>
                      </div>
                    </div>

                    {/* Distance */}

                    <div
                      className="
                        ml-4
                        shrink-0
                        text-right
                      "
                    >
                      <p
                        className="
                          text-xs
                          font-semibold
                        "
                      >
                        {formatDistance(
                          activity.distance,
                        )}
                      </p>

                      <p
                        className="
                          mt-0.5
                          text-[10px]
                          text-muted-foreground
                        "
                      >
                        {formatMovingTime(
                          activity.movingTime,
                        )}
                      </p>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        )}
      </div>
    </Card>
  );
}