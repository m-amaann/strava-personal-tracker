import { cookies } from "next/headers";

import {
  STRAVA_AUTH_COOKIE,
  decryptStravaAuth,
  encryptStravaAuth,
  isAccessTokenExpired,
  refreshStravaAuth,
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
  "https://api-v3.strava.com";

/* -------------------------------------------------------------------------- */
/* Authentication                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Get a valid Strava authentication object.
 *
 * This function:
 *
 * 1. Reads the encrypted authentication cookie.
 * 2. Decrypts the authentication data.
 * 3. Checks the access-token expiration.
 * 4. Refreshes the access token when necessary.
 * 5. Saves the new access/refresh tokens back to the cookie.
 *
 * No database is required.
 */
export async function getStravaAuth() {
  const cookieStore =
    await cookies();

  const authCookie =
    cookieStore.get(
      STRAVA_AUTH_COOKIE,
    )?.value;

  if (!authCookie) {
    return null;
  }

  const auth =
    await decryptStravaAuth(
      authCookie,
    );

  if (!auth) {
    return null;
  }

  /*
   * Access token is still valid.
   */
  if (
    !isAccessTokenExpired(
      auth.expiresAt,
    )
  ) {
    return auth;
  }

  /*
   * Access token is expired or
   * approaching expiration.
   *
   * Get a new access token using
   * the refresh token.
   */
  const refreshed =
    await refreshStravaAuth(
      auth,
    );

  /*
   * Encrypt the new authentication
   * information.
   */
  const encrypted =
    await encryptStravaAuth(
      refreshed,
    );

  /*
   * Save the new authentication
   * back to the browser cookie.
   */
  cookieStore.set({
    name:
      STRAVA_AUTH_COOKIE,

    value:
      encrypted,

    httpOnly:
      true,

    secure:
      process.env.NODE_ENV ===
      "production",

    sameSite:
      "lax",

    path: "/",

    /*
     * Long-lived application cookie.
     *
     * The Strava access token itself
     * still expires normally.
     *
     * getStravaAuth() automatically
     * refreshes it when required.
     */
    maxAge:
      60 *
      60 *
      24 *
      365 *
      10,
  });

  return refreshed;
}

/* -------------------------------------------------------------------------- */
/* Generic Strava Request                                                     */
/* -------------------------------------------------------------------------- */

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
         * Always fetch fresh data
         * from Strava.
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

export async function getAthlete(): Promise<StravaAthlete> {
  return stravaFetch<StravaAthlete>(
    "/athlete",
  );
}

/* -------------------------------------------------------------------------- */
/* Connection                                                                 */
/* -------------------------------------------------------------------------- */

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
    throw new Error("Strava account is not connected.");
  }

  const id = athleteId ?? auth.athleteId;

  if (!id) {
    throw new Error("Strava athlete ID is not available.");
  }

  return stravaFetch<StravaAthleteStats>(
    `/athletes/${encodeURIComponent(
      String(id),
    )}/stats`,
  );
}