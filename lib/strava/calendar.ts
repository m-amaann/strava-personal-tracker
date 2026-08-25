import { getActivities } from "@/lib/strava/api";

import type { StravaActivity } from "@/lib/strava/types";

/* -------------------------------------------------------------------------- */
/* Activity Types                                                             */
/* -------------------------------------------------------------------------- */

export type ActivityType =
  | "running"
  | "cycling"
  | "swimming"
  | "walking"
  | "hiking"
  | "workout"
  | "gym";

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
  )
    .trim()
    .toLowerCase();

  /* ------------------------------------------------------------------------ */
  /* Running                                                                  */
  /* ------------------------------------------------------------------------ */

  if (
    type === "run" ||
    type === "running"
  ) {
    return "running";
  }

  /* ------------------------------------------------------------------------ */
  /* Cycling                                                                  */
  /* ------------------------------------------------------------------------ */

  if (
    type === "ride" ||
    type === "cycling" ||
    type === "virtualride" ||
    type === "virtual ride" ||
    type === "ebikeride" ||
    type === "e-bike ride"
  ) {
    return "cycling";
  }

  /* ------------------------------------------------------------------------ */
  /* Swimming                                                                 */
  /* ------------------------------------------------------------------------ */

  if (
    type === "swim" ||
    type === "swimming"
  ) {
    return "swimming";
  }

  /* ------------------------------------------------------------------------ */
  /* Walking                                                                  */
  /* ------------------------------------------------------------------------ */

  if (
    type === "walk" ||
    type === "walking"
  ) {
    return "walking";
  }

  /* ------------------------------------------------------------------------ */
  /* Hiking                                                                   */
  /* ------------------------------------------------------------------------ */

  if (
    type === "hike" ||
    type === "hiking"
  ) {
    return "hiking";
  }

  /* ------------------------------------------------------------------------ */
  /* Gym                                                                       */
  /* ------------------------------------------------------------------------ */

  if (
    type === "weighttraining" ||
    type === "weight training" ||
    type === "gym"
  ) {
    return "gym";
  }

  /* ------------------------------------------------------------------------ */
  /* General Workout                                                          */
  /* ------------------------------------------------------------------------ */

  if (
    type === "workout" ||
    type === "training"
  ) {
    return "workout";
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

  const results: CalendarActivity[] = [];

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

      if (
        !Number.isFinite(
          activityDate.getTime(),
        )
      ) {
        continue;
      }

      /*
       * Strava normally returns activities
       * newest first.
       *
       * If we have moved before the requested
       * month, there is no reason to request
       * older pages.
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

        /*
         * Ignore unsupported Strava
         * activity types.
         */

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
            Number.isFinite(
              activity.distance,
            )
              ? activity.distance
              : 0,

          movingTime:
            Number.isFinite(
              activity.moving_time,
            )
              ? activity.moving_time
              : 0,
        });
      }
    }

    /*
     * Fewer than 200 means there are
     * no more pages.
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

  const days: CalendarDayData[] = [];

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
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