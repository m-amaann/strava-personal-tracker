import { cookies } from "next/headers";

import {
  STRAVA_AUTH_COOKIE,
  decryptStravaAuth,
  refreshStravaAuth,
  type StravaAuth,
} from "@/lib/strava/auth";

import type {
  StravaActivity,
  StravaActivityStreams,
  StravaActivityZone,
  StravaAthlete,
  StravaAthleteStats,
  StravaAthleteZones,
  StravaGear,
} from "@/lib/strava/types";

/* -------------------------------------------------------------------------- */
/* Configuration                                                              */
const STRAVA_API_URL = "https://www.strava.com/api/v3";

/* -------------------------------------------------------------------------- */
/* Authentication                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Get the current Strava authentication.
 *
 * This function only reads the authentication cookie.
 *
 * It does not:
 * - refresh the access token
 * - modify cookies
 * - set cookies
 *
 * Token refreshing is handled separately by the application's
 * authentication flow.
 */
let publicStravaAuth: StravaAuth | null = null;
let publicStravaRefreshPromise: Promise<StravaAuth> | null = null;

async function getPublicStravaAuth(): Promise<StravaAuth> {
  const refreshToken =
    process.env.STRAVA_REFRESH_TOKEN;

  if (!refreshToken) {
    throw new Error(
      "STRAVA_REFRESH_TOKEN is not configured.",
    );
  }

  if (publicStravaAuth) {
    const now = Math.floor(
      Date.now() / 1000,
    );

    if (
      publicStravaAuth.expiresAt >
      now + 60 * 60
    ) {
      return publicStravaAuth;
    }
  }

  if (publicStravaRefreshPromise) {
    return publicStravaRefreshPromise;
  }

  publicStravaRefreshPromise = (async () => {
    try {
      const baseAuth: StravaAuth =
        publicStravaAuth ?? {
          athleteId: 0,
          firstname: "",
          lastname: "",
          accessToken: "",
          refreshToken,
          expiresAt: 0,
          scope:
            "read,activity:read_all",
        };

      const refreshed =
        await refreshStravaAuth(
          baseAuth,
        );

      const athleteResponse =
        await fetch(
          `${STRAVA_API_URL}/athlete`,
          {
            method: "GET",
            headers: {
              Authorization:
                `Bearer ${refreshed.accessToken}`,
              Accept:
                "application/json",
            },
            cache: "no-store",
          },
        );

      const athlete =
        await athleteResponse
          .json()
          .catch(() => null);

      if (!athleteResponse.ok) {
        console.error(
          "Failed to fetch public Strava athlete:",
          {
            status:
              athleteResponse.status,
            data: athlete,
          },
        );

        throw new Error(
          "Unable to load the configured Strava athlete.",
        );
      }

      if (
        typeof athlete?.id !== "number"
      ) {
        throw new Error(
          "Strava returned an invalid athlete.",
        );
      }

      publicStravaAuth = {
        ...refreshed,
        athleteId: athlete.id,
        firstname:
          typeof athlete.firstname ===
          "string"
            ? athlete.firstname
            : "",
        lastname:
          typeof athlete.lastname ===
          "string"
            ? athlete.lastname
            : "",
      };

      return publicStravaAuth;
    } finally {
      publicStravaRefreshPromise =
        null;
    }
  })();

  return publicStravaRefreshPromise;
}

export async function getStravaAuth() {
  const cookieStore =
    await cookies();

  const authCookie =
    cookieStore.get(
      STRAVA_AUTH_COOKIE,
    )?.value;

  /*
   * Prefer a normal browser authentication cookie
   * when one exists. This keeps the existing OAuth
   * flow working.
   */
  if (authCookie) {
    const auth =
      await decryptStravaAuth(
        authCookie,
      );

    if (auth) {
      return auth;
    }
  }

  /*
   * Public EndrivoIQ mode:
   *
   * If a visitor has no Strava cookie, use the
   * application's STRAVA_REFRESH_TOKEN instead.
   *
   * This means visitors do not need to log in to
   * Strava and no database is required.
   */
  try {
    return await getPublicStravaAuth();
  } catch (error) {
    console.error(
      "Failed to load public Strava authentication:",
      error,
    );

    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* Generic Strava Request                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Make an authenticated request to Strava.
 *
 * All Strava requests go through this function so the access token
 * is handled consistently.
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

          Accept:
            "application/json",
        },

        /*
         * Always fetch fresh Strava data.
         */
        cache: "no-store",
      },
    );

  if (!response.ok) {
    let details:
      | {
          message?: string;
          errors?: unknown;
        }
      | null = null;

    try {
      details =
        await response.json();
    } catch {
      details = null;
    }

    console.error(
      "Strava API error:",
      {
        status:
          response.status,

        endpoint,

        details,
      },
    );

    if (
      response.status === 401
    ) {
      throw new Error(
        "Strava authentication has expired. Please reconnect Strava.",
      );
    }

    if (
      response.status === 403
    ) {
      throw new Error(
        "Strava denied access to this resource. Check your Strava permissions.",
      );
    }

    throw new Error(
      details?.message ??
        `Strava API request failed: ${response.status}`,
    );
  }

  return response.json() as Promise<T>;
}

/* -------------------------------------------------------------------------- */
/* Connection                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Check whether the user has a Strava connection.
 */
export async function isStravaConnected(): Promise<boolean> {
  const auth =
    await getStravaAuth();

  return Boolean(auth);
}

/* -------------------------------------------------------------------------- */
/* Athlete                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Get the currently authenticated Strava athlete.
 *
 * GET /athlete
 */
export async function getAthlete(): Promise<StravaAthlete> {
  return stravaFetch<StravaAthlete>(
    "/athlete",
  );
}

/* -------------------------------------------------------------------------- */
/* Activities                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Fetch one page of Strava activities.
 *
 * Strava allows a maximum of 200 activities per page.
 *
 * Optional:
 * - after  → Unix timestamp
 * - before → Unix timestamp
 */
export async function getActivities(
  page = 1,
  perPage = 200,
  options?: {
    after?: number;
    before?: number;
  },
): Promise<StravaActivity[]> {
  const query =
    new URLSearchParams();

  query.set(
    "page",
    String(
      Math.max(1, page),
    ),
  );

  query.set(
    "per_page",
    String(
      Math.min(
        Math.max(1, perPage),
        200,
      ),
    ),
  );

  if (
    options?.after !==
    undefined
  ) {
    query.set(
      "after",
      String(
        options.after,
      ),
    );
  }

  if (
    options?.before !==
    undefined
  ) {
    query.set(
      "before",
      String(
        options.before,
      ),
    );
  }

  return stravaFetch<
    StravaActivity[]
  >(
    `/athlete/activities?${query.toString()}`,
  );
}

/* -------------------------------------------------------------------------- */
/* All Activities                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Fetch all available Strava activities.
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
     * Less than 200 means there are
     * no more pages.
     */
    if (
      activities.length <
      perPage
    ) {
      break;
    }

    page += 1;
  }

  return allActivities;
}

/* -------------------------------------------------------------------------- */
/* Year To Date Activities                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Fetch all activities from January 1st of the current year.
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

  const after = Math.floor(
    startOfYear.getTime() /
      1000,
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
        {
          after,
        },
      );

    if (
      pageActivities.length ===
      0
    ) {
      break;
    }

    activities.push(
      ...pageActivities,
    );

    if (
      pageActivities.length <
      perPage
    ) {
      break;
    }

    page += 1;
  }

  return activities;
}

/* -------------------------------------------------------------------------- */
/* Running Activities                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Determine whether an activity is a run.
 */
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

/**
 * Fetch all running activities.
 */
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

/**
 * Fetch all running activities
 * from the current year.
 */
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
    Math.max(0, limit),
  );
}

/* -------------------------------------------------------------------------- */
/* Recent Year Runs                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Return the most recent running activities
 * from the current year.
 */
export async function getRecentYearRuns(
  limit = 3,
): Promise<StravaActivity[]> {
  const runs =
    await getYearToDateRuns();

  return runs.slice(
    0,
    Math.max(0, limit),
  );
}

/* -------------------------------------------------------------------------- */
/* Single Activity                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Fetch a single detailed Strava activity.
 *
 * This endpoint is important for:
 *
 * - device_name
 * - gear_id
 * - gear
 * - heart rate
 * - detailed activity information
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
 * Fetch detailed activity streams.
 *
 * Includes:
 * - time
 * - distance
 * - GPS
 * - altitude
 * - speed
 * - heart rate
 * - cadence
 * - power
 * - temperature
 * - moving
 * - grade
 */
export async function getActivityStreams(
  activityId: number | string,
): Promise<StravaActivityStreams> {
  const keys = 
  [
    "time",
    "distance",
    "latlng",
    "altitude",
    "velocity_smooth",
    "heartrate",
    "cadence",
    "watts",
    "temp",
    "moving",
    "grade_smooth",
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
/* Athlete Heart Rate Zones                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Fetch the authenticated athlete's configured
 * heart-rate and power zones directly from Strava.
 *
 * GET /athlete/zones
 *
 * This does not calculate zones locally.
 */
export async function getAthleteZones(): Promise<StravaAthleteZones> {
  return stravaFetch<StravaAthleteZones>(
    "/athlete/zones",
  );
}


/* -------------------------------------------------------------------------- */
/* Activity Heart Rate Zones                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Fetch Strava's own heart-rate zone distribution
 * for a specific activity.
 *
 * GET /activities/{id}/zones
 */
export async function getActivityZones(
  activityId: number | string,
): Promise<StravaActivityZone[]> {
  return stravaFetch<StravaActivityZone[]>(
    `/activities/${encodeURIComponent(
      String(activityId),
    )}/zones`,
  );
}


/* -------------------------------------------------------------------------- */
/* Gear                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Fetch detailed Strava gear.
 *
 * GET /gear/{id}
 */

export async function getGear(gearId: string): Promise<StravaGear> {
  return stravaFetch<StravaGear>(
    `/gear/${encodeURIComponent(
      gearId,
    )}`,
  );
}

/* -------------------------------------------------------------------------- */
/* Activity Gear                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Get the gear used for a specific activity.
 *
 * First checks the detailed activity's `gear`.
 *
 * If that is not available but `gear_id`
 * exists, it fetches the gear separately.
 */
export async function getActivityGear(
  activityId: number | string,
): Promise<StravaGear | null> {
  const activity =
    await getActivity(
      activityId,
    );

  if (activity.gear) {
    return activity.gear;
  }

  if (
    !activity.gear_id
  ) {
    return null;
  }

  return getGear(
    activity.gear_id,
  );
}

/* -------------------------------------------------------------------------- */
/* Running Gear                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Get unique gear used by running activities.
 *
 * This is used by the Progress page:
 *
 * Gear & data sources
 *
 * - Running shoes
 */
export async function getRunningGear(): Promise<
  StravaGear[]
> {
  const runs =
    await getAllRuns();

  const gearIds =
    new Set<string>();

  /*
   * Collect unique gear IDs.
   */
  for (const run of runs) {
    if (run.gear_id) {
      gearIds.add(
        run.gear_id,
      );
    }

    if (run.gear?.id) {
      gearIds.add(
        run.gear.id,
      );
    }
  }

  if (
    gearIds.size === 0
  ) {
    return [];
  }

  const gear =
    await Promise.all(
      Array.from(
        gearIds,
      ).map(
        async (gearId) => {
          try {
            return await getGear(
              gearId,
            );
          } catch (error) {
            console.error(
              `Failed to fetch Strava gear ${gearId}:`,
              error,
            );

            return null;
          }
        },
      ),
    );

  return gear.filter(
    (
      item,
    ): item is StravaGear =>
      item !== null,
  );
}

/* -------------------------------------------------------------------------- */
/* Device / Watch                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Find the recording device used by the athlete's running activities.
 *
 * Example:
 *
 *
 * The device appearing most frequently is returned.
 */
export async function getRunningDevice(): Promise<
  string | null
> {
  const runs =
    await getAllRuns();

  const deviceCounts =
    new Map<
      string,
      number
    >();

  for (const run of runs) {
    const device =
      run.device_name?.trim();

    if (!device) {
      continue;
    }

    deviceCounts.set(
      device,
      (deviceCounts.get(
        device,
      ) ?? 0) + 1,
    );
  }

  if (
    deviceCounts.size === 0
  ) {
    return null;
  }

  const sorted =
    Array.from(
      deviceCounts.entries(),
    ).sort(
      (a, b) =>
        b[1] - a[1],
    );

  return sorted[0]?.[0] ??
    null;
}

/* -------------------------------------------------------------------------- */
/* Running Equipment                                                          */
/* -------------------------------------------------------------------------- */

export interface StravaEquipment {
  watch: {
    name: string;
    status?: string;
  } | null;

  shoes: {
    name: string;
    status?: string;
    distance?: number;
  }[];

  dataSources: {
    name: string;
    status?: string;
  }[];
}

/**
 * Fetch all equipment information needed by the Progress page.
 *
 * This does NOT create mock data.
 *
 * Data comes from the authenticated Strava account:
 *
 * Watch
 *   activity.device_name
 *
 * Shoes
 *   activity.gear_id
 *   GET /gear/{id}
 *
 *   Strava OAuth connection
 */
export async function getRunningEquipment(): Promise<
  StravaEquipment
> {
  const connected =
    await isStravaConnected();

  if (!connected) {
    return {
      watch: null,
      shoes: [],
      dataSources: [],
    };
  }

  const runs =
    await getAllRuns();

  /* ------------------------------------------------------------------------ */
  /* Watch                                                                     */
  /* ------------------------------------------------------------------------ */

  const deviceCounts =
    new Map<
      string,
      number
    >();

  for (const run of runs) {
    const device =
      run.device_name?.trim();

    if (!device) {
      continue;
    }

    deviceCounts.set(
      device,
      (deviceCounts.get(
        device,
      ) ?? 0) + 1,
    );
  }

  let watch:
    StravaEquipment["watch"] =
    null;

  if (
    deviceCounts.size > 0
  ) {
    const sortedDevices =
      Array.from(
        deviceCounts.entries(),
      ).sort(
        (a, b) =>
          b[1] - a[1],
      );

    const [
      deviceName,
      count,
    ] =
      sortedDevices[0];

    watch = {
      name: deviceName,
      status:
        `${count} ${
          count === 1
            ? "run"
            : "runs"
        } recorded`,
    };
  }

  /* ------------------------------------------------------------------------ */
  /* Shoes                                                                     */
  /* ------------------------------------------------------------------------ */

  const gearIds =
    new Set<string>();

  for (const run of runs) {
    if (run.gear_id) {
      gearIds.add(
        run.gear_id,
      );
    }

    if (run.gear?.id) {
      gearIds.add(
        run.gear.id,
      );
    }
  }

  const shoes: StravaEquipment["shoes"] =
    [];

  if (
    gearIds.size > 0
  ) {
    const gearResults =
      await Promise.all(
        Array.from(
          gearIds,
        ).map(
          async (gearId) => {
            try {
              return await getGear(
                gearId,
              );
            } catch (error) {
              console.error(
                `Failed to fetch Strava gear ${gearId}:`,
                error,
              );

              return null;
            }
          },
        ),
      );

    for (const gear of gearResults) {
      if (!gear) {
        continue;
      }

      const brand =
        gear.brand_name?.trim() ??
        "";

      const model =
        gear.model_name?.trim() ??
        "";

      const description =
        gear.description?.trim() ??
        "";

      const name =
        `${brand} ${model}`.trim() ||
        description ||
        gear.name?.trim() ||
        "Running shoes";

      const distance =
        typeof gear.distance ===
          "number"
          ? gear.distance / 1000
          : undefined;

      shoes.push({
        name,

        distance,

        status:
          distance !== undefined
            ? `${distance.toFixed(0)} km`
            : "Strava gear",
      });
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Data source                                                               */
  /* ------------------------------------------------------------------------ */

  const dataSources =
    connected
      ? [
          {
            name: "Strava",
            status: "Connected",
          },
        ]
      : [];

  return {
    watch,
    shoes,
    dataSources,
  };
}

/* -------------------------------------------------------------------------- */
/* Athlete Stats                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Fetch Strava athlete statistics.
 *
 * GET /athletes/{id}/stats
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