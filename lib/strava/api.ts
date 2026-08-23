import { cookies } from "next/headers";

import {
  COOKIE_NAME,
  decryptStravaSession,
} from "@/lib/strava/session";

import type {
  StravaActivity,
  StravaActivityStreams,
  StravaAthlete,
} from "@/lib/strava/types";

/* -------------------------------------------------------------------------- */
/* Configuration                                                              */
/* -------------------------------------------------------------------------- */

const STRAVA_API_URL =
  "https://www.strava.com/api/v3";

/* -------------------------------------------------------------------------- */
/* Session                                                                    */
/* -------------------------------------------------------------------------- */

export async function getStravaSession() {
  const cookieStore = await cookies();

  const sessionCookie =
    cookieStore.get(COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return null;
  }

  return decryptStravaSession(
    sessionCookie,
  );
}

/* -------------------------------------------------------------------------- */
/* Generic Strava Request                                                     */
/* -------------------------------------------------------------------------- */

async function stravaFetch<T>(
  endpoint: string,
): Promise<T> {
  const session =
    await getStravaSession();

  if (!session) {
    throw new Error(
      "Strava account is not connected.",
    );
  }

  const response = await fetch(
    `${STRAVA_API_URL}${endpoint}`,
    {
      method: "GET",

      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },

      cache: "no-store",
    },
  );

  if (!response.ok) {
    const details =
      await response.json().catch(
        () => null,
      );

    console.error(
      "Strava API error:",
      {
        status: response.status,
        endpoint,
        details,
      },
    );

    throw new Error(
      details?.message ||
        `Strava API request failed: ${response.status}`,
    );
  }

  return response.json() as Promise<T>;
}

/* -------------------------------------------------------------------------- */
/* Athlete                                                                    */
/* -------------------------------------------------------------------------- */

export async function getAthlete(): Promise<StravaAthlete> {
  return stravaFetch<StravaAthlete>(
    "/athlete",
  );
}

/* -------------------------------------------------------------------------- */
/* Connection                                                                 */
/* -------------------------------------------------------------------------- */

export async function isStravaConnected(): Promise<boolean> {
  const session =
    await getStravaSession();

  return Boolean(session);
}

/* -------------------------------------------------------------------------- */
/* Activities                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Fetch one page of Strava activities.
 *
 * Strava allows a maximum of 200 activities
 * per page.
 */
export async function getActivities(
  page = 1,
  perPage = 200,
): Promise<StravaActivity[]> {
  const query =
    new URLSearchParams({
      page: String(page),
      per_page: String(
        Math.min(perPage, 200),
      ),
    });

  return stravaFetch<StravaActivity[]>(
    `/athlete/activities?${query.toString()}`,
  );
}

/* -------------------------------------------------------------------------- */
/* All Activities                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Fetch the complete activity history.
 *
 * Activities are returned newest first.
 */
export async function getAllActivities(): Promise<
  StravaActivity[]
> {
  const allActivities: StravaActivity[] =
    [];

  let page = 1;

  const perPage = 200;

  while (true) {
    const activities =
      await getActivities(
        page,
        perPage,
      );

    if (
      activities.length === 0
    ) {
      break;
    }

    allActivities.push(
      ...activities,
    );

    /*
     * If fewer than 200 activities were
     * returned, this is the last page.
     */
    if (
      activities.length <
      perPage
    ) {
      break;
    }

    page++;
  }

  return allActivities;
}

/* -------------------------------------------------------------------------- */
/* Year To Date Activities                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Fetch all activities from January 1st
 * of the current year until now.
 *
 * This is used by:
 *
 * - Activity Summary
 * - Yearly distance
 * - Running distance
 * - Cycling distance
 * - Swimming distance
 * - Walking distance
 * - Hiking distance
 * - Yearly longest run
 *
 * Strava returns activities newest first,
 * so we stop when we reach the previous year.
 */
export async function getYearToDateActivities(): Promise<
  StravaActivity[]
> {
  const now = new Date();

  const startOfYear = new Date(
    now.getFullYear(),
    0,
    1,
  );

  const activities: StravaActivity[] =
    [];

  let page = 1;

  const perPage = 200;

  while (true) {
    const pageActivities =
      await getActivities(
        page,
        perPage,
      );

    if (
      pageActivities.length === 0
    ) {
      break;
    }

    let reachedPreviousYear =
      false;

    for (const activity of pageActivities) {
      const activityDate =
        new Date(
          activity.start_date_local,
        );

      if (
        activityDate >=
        startOfYear
      ) {
        activities.push(
          activity,
        );
      } else {
        reachedPreviousYear = true;
        break;
      }
    }

    /*
     * We reached activities from
     * before January 1st.
     */
    if (reachedPreviousYear) {
      break;
    }

    /*
     * Last page.
     */
    if (
      pageActivities.length <
      perPage
    ) {
      break;
    }

    page++;
  }

  return activities;
}

/* -------------------------------------------------------------------------- */
/* Running Activities                                                         */
/* -------------------------------------------------------------------------- */

export function isRunningActivity(
  activity: StravaActivity,
): boolean {
  return (
    activity.type === "Run" ||
    activity.sport_type === "Run"
  );
}

/* -------------------------------------------------------------------------- */
/* All Running Activities                                                     */
/* -------------------------------------------------------------------------- */

export async function getAllRuns(): Promise<
  StravaActivity[]
> {
  const activities =
    await getAllActivities();

  return activities.filter(
    isRunningActivity,
  );
}

/* -------------------------------------------------------------------------- */
/* Year To Date Running Activities                                            */
/* -------------------------------------------------------------------------- */

export async function getYearToDateRuns(): Promise<
  StravaActivity[]
> {
  const activities =
    await getYearToDateActivities();

  return activities.filter(
    isRunningActivity,
  );
}

/* -------------------------------------------------------------------------- */
/* Recent Runs                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Return the most recent running activities.
 */
export async function getRecentRuns(
  limit = 3,
): Promise<StravaActivity[]> {
  const runs =
    await getAllRuns();

  return runs.slice(0, limit);
}

/* -------------------------------------------------------------------------- */
/* Recent Year Runs                                                           */
/* -------------------------------------------------------------------------- */

export async function getRecentYearRuns(
  limit = 3,
): Promise<StravaActivity[]> {
  const runs =
    await getYearToDateRuns();

  return runs.slice(0, limit);
}

/* -------------------------------------------------------------------------- */
/* Single Activity                                                            */
/* -------------------------------------------------------------------------- */

export async function getActivity(
  activityId: number | string,
): Promise<StravaActivity> {
  return stravaFetch<StravaActivity>(`/activities/${activityId}`,);
}

/* -------------------------------------------------------------------------- */
/* Activity Streams                                                           */
/* -------------------------------------------------------------------------- */

export async function getActivityStreams(
  activityId: number | string,
): Promise<StravaActivityStreams> {
  const keys = [
    "time",
    "distance",
    "latlng",
    "altitude",
    "velocity_smooth",
    "heartrate",
    "cadence",
  ];

  const query =
    new URLSearchParams({
      keys: keys.join(","),
      key_by_type: "true",
    });

  return stravaFetch<StravaActivityStreams>(
    `/activities/${activityId}/streams?${query.toString()}`,
  );
}

/* -------------------------------------------------------------------------- */
/* Athlete Stats                                                              */
/* -------------------------------------------------------------------------- */

export interface StravaActivityTotals {
  count?: number;
  distance?: number;
  moving_time?: number;
  elapsed_time?: number;
  elevation_gain?: number;
  achievement_count?: number;
}

export interface StravaAthleteStats {
  biggest_ride_distance?: number;
  biggest_climb_elevation_gain?: number;

  recent_ride_totals?: StravaActivityTotals;
  recent_run_totals?: StravaActivityTotals;
  recent_swim_totals?: StravaActivityTotals;

  ytd_ride_totals?: StravaActivityTotals;
  ytd_run_totals?: StravaActivityTotals;
  ytd_swim_totals?: StravaActivityTotals;

  all_ride_totals?: StravaActivityTotals;
  all_run_totals?: StravaActivityTotals;
  all_swim_totals?: StravaActivityTotals;
}

/**
 * Fetch Strava's athlete statistics.
 *
 * Useful when you want Strava's own
 * calculated YTD running/ride/swim totals.
 */
export async function getAthleteStats(
  athleteId?: number | string,
): Promise<StravaAthleteStats> {
  const session =
    await getStravaSession();

  if (!session) {
    throw new Error(
      "Strava account is not connected.",
    );
  }

  const id =
    athleteId ?? session.athleteId;

  if (!id) {
    throw new Error(
      "Strava athlete ID is not available.",
    );
  }

  return stravaFetch<StravaAthleteStats>(
    `/athletes/${id}/stats`,
  );
}