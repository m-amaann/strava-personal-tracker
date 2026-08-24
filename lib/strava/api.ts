import { cookies } from "next/headers";

import {
  STRAVA_AUTH_COOKIE,
  decryptStravaAuth,
} from "@/lib/strava/auth";

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
/* Authentication                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Get the current Strava authentication.
 *
 * IMPORTANT:
 *
 * This function ONLY READS the authentication cookie.
 *
 * It does NOT:
 * - refresh the access token
 * - modify cookies
 * - call cookieStore.set()
 *
 * Server Components are allowed to READ cookies,
 * but they cannot modify them.
 *
 * Token refreshing is handled separately:
 *
 * - proxy.ts handles normal page requests
 * - app/api/strava/route.ts handles API requests
 */
export async function getStravaAuth() {
  const cookieStore = await cookies();

  const authCookie =
    cookieStore.get(
      STRAVA_AUTH_COOKIE,
    )?.value;

  if (!authCookie) {
    return null;
  }

  const auth = await decryptStravaAuth(authCookie);

  if (!auth) {
    return null;
  }

  return auth;
}

/* -------------------------------------------------------------------------- */
/* Generic Strava Request                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Make an authenticated request to the Strava API.
 *
 * This function reads the already-valid authentication
 * from the cookie.
 *
 * It does NOT modify the cookie.
 */
async function stravaFetch<T>(
  endpoint: string,
): Promise<T> {
  const auth =
    await getStravaAuth();

  if (!auth) {
    throw new Error(
      "Strava account is not connected.",
    );
  }

  const response =
    await fetch(
      `${STRAVA_API_URL}${endpoint}`,
      {
        method: "GET",

        headers: {
          Authorization:
            `Bearer ${auth.accessToken}`,

          "Content-Type":
            "application/json",
        },

        /*
         * Always get fresh data from Strava.
         */
        cache: "no-store",
      },
    );

  if (!response.ok) {
    const details =
      await response
        .json()
        .catch(
          () => null,
        );

    console.error(
      "Strava API error:",
      {
        status:
          response.status,

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

/**
 * Get the currently authenticated Strava athlete.
 */
export async function getAthlete(): Promise<StravaAthlete> {
  return stravaFetch<StravaAthlete>(
    "/athlete",
  );
}

/* -------------------------------------------------------------------------- */
/* Connection                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Check whether a Strava authentication cookie exists.
 */
export async function isStravaConnected(): Promise<boolean> {
  const auth =
    await getStravaAuth();

  return Boolean(auth);
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
      page:
        String(page),

      per_page:
        String(
          Math.min(
            perPage,
            200,
          ),
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

    /*
     * No more activities.
     */
    if (
      activities.length ===
      0
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
 * Activities are returned newest first,
 * so we stop when we reach the previous year.
 */
export async function getYearToDateActivities(): Promise<
  StravaActivity[]
> {
  const now =
    new Date();

  const startOfYear =
    new Date(
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

    /*
     * No more activities.
     */
    if (
      pageActivities.length ===
      0
    ) {
      break;
    }

    let reachedPreviousYear =
      false;

    for (
      const activity of
      pageActivities
    ) {
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
        reachedPreviousYear =
          true;

        break;
      }
    }

    /*
     * We reached activities from
     * before January 1st.
     */
    if (
      reachedPreviousYear
    ) {
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
    activity.type ===
      "Run" ||
    activity.sport_type ===
      "Run"
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

  return runs.slice(
    0,
    limit,
  );
}

/* -------------------------------------------------------------------------- */
/* Recent Year Runs                                                           */
/* -------------------------------------------------------------------------- */

export async function getRecentYearRuns(
  limit = 3,
): Promise<StravaActivity[]> {
  const runs =
    await getYearToDateRuns();

  return runs.slice(
    0,
    limit,
  );
}

/* -------------------------------------------------------------------------- */
/* Single Activity                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Fetch a single Strava activity.
 */
export async function getActivity(
  activityId: number | string,
): Promise<StravaActivity> {
  return stravaFetch<StravaActivity>(
    `/activities/${encodeURIComponent(
      String(activityId),
    )}`,
  );
}

/* -------------------------------------------------------------------------- */
/* Activity Streams                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Fetch detailed streams for an activity.
 */
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
      keys:
        keys.join(","),

      key_by_type:
        "true",
    });

  return stravaFetch<StravaActivityStreams>(
    `/activities/${encodeURIComponent(
      String(activityId),
    )}/streams?${query.toString()}`,
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
 * Uses the authenticated athlete ID
 * from the persistent Strava authentication.
 */
export async function getAthleteStats(
  athleteId?: number | string,
): Promise<StravaAthleteStats> {
  const auth =
    await getStravaAuth();

  if (!auth) {
    throw new Error(
      "Strava account is not connected.",
    );
  }

  const id =
    athleteId ??
    auth.athleteId;

  if (!id) {
    throw new Error(
      "Strava athlete ID is not available.",
    );
  }

  return stravaFetch<StravaAthleteStats>(
    `/athletes/${encodeURIComponent(
      String(id),
    )}/stats`,
  );
}