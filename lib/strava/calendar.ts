import {
  getActivities,
} from "@/lib/strava/api";

import type {
  StravaActivity,
} from "@/lib/strava/types";

/* -------------------------------------------------------------------------- */
/* Activity Types                                                             */
/* -------------------------------------------------------------------------- */

export type ActivityType =
  | "running"
  | "cycling"
  | "swimming"
  | "walking";

/* -------------------------------------------------------------------------- */
/* Calendar Activity                                                          */
/* -------------------------------------------------------------------------- */

export interface CalendarActivity {
  id: number;

  date: string;

  type: ActivityType;

  name: string;

  distance: number;

  movingTime: number;
}

/* -------------------------------------------------------------------------- */
/* Calendar Day                                                               */
/* -------------------------------------------------------------------------- */

export interface CalendarDayData {
  day: number;

  date: string;

  activities: CalendarActivity[];
}

/* -------------------------------------------------------------------------- */
/* Activity Type Mapper                                                       */
/* -------------------------------------------------------------------------- */

function getActivityType(
  activity: StravaActivity,
): ActivityType | null {
  const type = (
    activity.sport_type ??
    activity.type ??
    ""
  ).toLowerCase();

  if (
    type === "run" ||
    type === "running"
  ) {
    return "running";
  }

  if (
    type === "ride" ||
    type === "cycling" ||
    type === "virtualride"
  ) {
    return "cycling";
  }

  if (
    type === "swim" ||
    type === "swimming"
  ) {
    return "swimming";
  }

  if (
    type === "walk" ||
    type === "walking" ||
    type === "hike"
  ) {
    return "walking";
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/* Month Range                                                                */
/* -------------------------------------------------------------------------- */

function getMonthRange(
  year: number,
  month: number,
) {
  const start = new Date(
    year,
    month,
    1,
    0,
    0,
    0,
    0,
  );

  const end = new Date(
    year,
    month + 1,
    1,
    0,
    0,
    0,
    0,
  );

  return {
    start,
    end,
  };
}

/* -------------------------------------------------------------------------- */
/* Fetch Activities For Month                                                */
/* -------------------------------------------------------------------------- */

export async function getCalendarActivities(
  year: number,
  month: number,
): Promise<CalendarActivity[]> {
  const {
    start,
    end,
  } = getMonthRange(
    year,
    month,
  );

  const results: CalendarActivity[] =
    [];

  let page = 1;

  while (true) {
    const activities =
      await getActivities(
        page,
        200,
      );

    if (
      activities.length === 0
    ) {
      break;
    }

    for (
      const activity of activities
    ) {
      const activityDate =
        new Date(
          activity.start_date_local,
        );

      /*
       * Strava returns activities newest
       * first.
       *
       * Once activities are older than
       * the requested month, we can stop
       * fetching additional pages.
       */

      if (
        activityDate < start
      ) {
        return results;
      }

      if (
        activityDate >= start &&
        activityDate < end
      ) {
        const type =
          getActivityType(
            activity,
          );

        if (!type) {
          continue;
        }

        results.push({
          id: activity.id,

          date:
            activity.start_date_local,

          type,

          name:
            activity.name,

          distance:
            activity.distance,

          movingTime:
            activity.moving_time,
        });
      }
    }

    /*
     * If fewer than 200 activities
     * were returned, there are no
     * more pages.
     */

    if (
      activities.length < 200
    ) {
      break;
    }

    page++;
  }

  return results;
}

/* -------------------------------------------------------------------------- */
/* Build Calendar Month                                                       */
/* -------------------------------------------------------------------------- */

export async function getCalendarMonth(
  year: number,
  month: number,
): Promise<CalendarDayData[]> {
  const activities =
    await getCalendarActivities(
      year,
      month,
    );

  const daysInMonth =
    new Date(
      year,
      month + 1,
      0,
    ).getDate();

  const days: CalendarDayData[] =
    [];

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    /*
     * Build YYYY-MM-DD without
     * creating an unused Date object.
     */

    const dateString =
      [
        year,

        String(
          month + 1,
        ).padStart(
          2,
          "0",
        ),

        String(day).padStart(
          2,
          "0",
        ),
      ].join("-");

    const dayActivities =
      activities.filter(
        (activity) =>
          activity.date.startsWith(
            dateString,
          ),
      );

    days.push({
      day,

      date:
        dateString,

      activities:
        dayActivities,
    });
  }

  return days;
}