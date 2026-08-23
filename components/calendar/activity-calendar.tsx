"use client";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  Card,
} from "@/components/ui/card";

import {
  CalendarDay,
} from "@/components/calendar/calendar-day";

import type {
  ActivityType,
  CalendarDayData,
} from "@/lib/strava/calendar";

interface ActivityCalendarProps {
  year: number;
  month: number;
  days: CalendarDayData[];
}

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

const weekDays = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

export function ActivityCalendar({
  year,
  month,
  days,
}: ActivityCalendarProps) {
  const router = useRouter();

  const firstDayOffset = (() => {
    const date = new Date(
      year,
      month,
      1,
    );

    const day = date.getDay();

    return day === 0
      ? 6
      : day - 1;
  })();

  const calendarCells: (
    | CalendarDayData
    | null
  )[] = [
    ...Array<null>(
      firstDayOffset,
    ).fill(null),
    ...days,
  ];

  function navigateMonth(
    targetYear: number,
    targetMonth: number,
  ) {
    const params =
      new URLSearchParams();

    params.set(
      "year",
      String(targetYear),
    );

    params.set(
      "month",
      String(targetMonth),
    );

    router.push(
      `/calendar?${params.toString()}`,
    );
  }

  function goToPreviousMonth() {
    if (month === 0) {
      navigateMonth(
        year - 1,
        11,
      );
      return;
    }

    navigateMonth(
      year,
      month - 1,
    );
  }

  function goToNextMonth() {
    if (month === 11) {
      navigateMonth(
        year + 1,
        0,
      );
      return;
    }

    navigateMonth(
      year,
      month + 1,
    );
  }

  return (
    <Card className="overflow-hidden border-border/70 shadow-none">
      <div className="p-4 sm:p-6">
        {/* Header */}

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={
              goToPreviousMonth
            }
            className="
              flex
              size-9
              items-center
              justify-center
              rounded-full
              text-muted-foreground
              transition-colors
              hover:bg-muted
              hover:text-foreground
            "
            aria-label="Previous month"
          >
            <ChevronLeft className="size-5" />
          </button>

          <div className="text-center">
            <h1 className="text-base font-bold sm:text-lg">
              {monthNames[month]}{" "}
              {year}
            </h1>

            <p className="mt-0.5 text-[10px] text-muted-foreground">
              Strava activities
            </p>
          </div>

          <button
            type="button"
            onClick={
              goToNextMonth
            }
            className="
              flex
              size-9
              items-center
              justify-center
              rounded-full
              text-muted-foreground
              transition-colors
              hover:bg-muted
              hover:text-foreground
            "
            aria-label="Next month"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        {/* Week Header */}

        <div className="mt-6 grid grid-cols-7">
          {weekDays.map(
            (day) => (
              <div
                key={day}
                className="
                  flex
                  h-8
                  items-center
                  justify-center
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-wide
                  text-muted-foreground
                "
              >
                {day}
              </div>
            ),
          )}
        </div>

        {/* Calendar */}

        <div className="grid grid-cols-7">
          {calendarCells.map(
            (cell, index) => {
              if (!cell) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="h-13.5 sm:h-16.5"
                  />
                );
              }

              const activityTypes =
                Array.from(
                  new Set(
                    cell.activities.map(
                      (activity) =>
                        activity.type,
                    ),
                  ),
                ) as ActivityType[];

              return (
                <CalendarDay
                  key={cell.date}
                  day={cell.day}
                  activityTypes={
                    activityTypes
                  }
                  selected={false}
                  onClick={() => {}}
                />
              );
            },
          )}
        </div>

        {/* Activity Details */}

        <div className="mt-5 border-t border-border/70 pt-4">
          {days.some(
            (day) =>
              day.activities.length >
              0,
          ) ? (
            <>
              <p className="text-xs font-semibold">
                Activities
              </p>

              <div className="mt-3 space-y-2">
                {days
                  .filter(
                    (day) =>
                      day.activities
                        .length > 0,
                  )
                  .flatMap(
                    (day) =>
                      day.activities.map(
                        (activity) => (
                          <div
                            key={
                              activity.id
                            }
                            className="
                              flex
                              items-center
                              justify-between
                              gap-3
                              rounded-xl
                              bg-muted/50
                              px-3
                              py-2.5
                            "
                          >
                            <div className="min-w-0">
                              <p className="truncate text-xs font-semibold">
                                {
                                  activity.name
                                }
                              </p>

                              <p className="mt-0.5 text-[10px] capitalize text-muted-foreground">
                                {
                                  activity.type
                                }
                              </p>
                            </div>

                            <div className="shrink-0 text-right">
                              <p className="text-xs font-semibold">
                                {(
                                  activity.distance /
                                  1000
                                ).toFixed(
                                  2,
                                )}{" "}
                                km
                              </p>

                              <p className="text-[10px] text-muted-foreground">
                                {Math.floor(
                                  activity.movingTime /
                                    60,
                                )}
                                m
                              </p>
                            </div>
                          </div>
                        ),
                      ),
                  )}
              </div>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              No activities this month.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}