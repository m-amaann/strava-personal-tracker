import {
  getPublicStravaAuth,
  refreshPublicStravaAuth,
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

/* ============================================================================
 * Configuration
 * ========================================================================== */

const STRAVA_API_URL =
  "https://www.strava.com/api/v3";

/*
 * Maximum number of pages used by the
 * "get all" helper functions.
 */
const MAX_ACTIVITY_PAGES =
  50;

/*
 * Strava's maximum per_page value.
 */
const MAX_PER_PAGE =
  200;

/* ============================================================================
 * Errors
 * ========================================================================== */

export class StravaApiError
  extends Error {
  readonly status: number;
  readonly endpoint: string;
  readonly details: unknown;

  constructor(
    message: string,
    status: number,
    endpoint: string,
    details?: unknown,
  ) {
    super(message);

    this.name =
      "StravaApiError";

    this.status =
      status;

    this.endpoint =
      endpoint;

    this.details =
      details;
  }
}

export class StravaAuthenticationError
  extends StravaApiError {
  constructor(
    endpoint: string,
    details?: unknown,
  ) {
    super(
      "STRAVA_AUTH_EXPIRED",
      401,
      endpoint,
      details,
    );

    this.name =
      "StravaAuthenticationError";
  }
}

export class StravaPermissionError
  extends StravaApiError {
  constructor(
    endpoint: string,
    details?: unknown,
  ) {
    super(
      "STRAVA_PERMISSION_DENIED",
      403,
      endpoint,
      details,
    );

    this.name =
      "StravaPermissionError";
  }
}

/* ============================================================================
 * Authentication
 * ========================================================================== */

/*
 * Get the server-side Strava authentication.
 *
 * IMPORTANT:
 *
 * We intentionally use public authentication here.
 *
 * This means:
 *
 * Normal browser  -> works
 * Incognito       -> works
 * Another browser -> works
 * Another visitor -> works
 *
 * The browser does NOT need to have the OAuth cookie.
 */
async function getStravaAuth(): Promise<StravaAuth> {
  try {
    return await getPublicStravaAuth();
  } catch (error) {
    if (
      error instanceof Error
    ) {
      throw error;
    }

    throw new Error(
      "STRAVA_AUTH_UNAVAILABLE",
    );
  }
}

/* ============================================================================
 * Low-level Fetch
 * ========================================================================== */

async function fetchStrava<T>(
  endpoint: string,
  accessToken: string,
): Promise<{
  response: Response;
  data: T | null;
}> {
  let response: Response;

  try {
    response =
      await fetch(
        `${STRAVA_API_URL}${endpoint}`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${accessToken}`,

            Accept:
              "application/json",
          },

          cache: "no-store",
        },
      );
  } catch {
    throw new StravaApiError(
      "STRAVA_NETWORK_ERROR",
      0,
      endpoint,
    );
  }

  const data =
    await response
      .json()
      .catch(() => null);

  return {
    response,
    data,
  };
}

/* ============================================================================
 * Generic Strava Request
 * ========================================================================== */

async function stravaFetch<T>(
  endpoint: string,
): Promise<T> {
  let auth =
    await getStravaAuth();

  /*
   * ----------------------------------------------------------
   * First request
   * ----------------------------------------------------------
   */

  let result =
    await fetchStrava<T>(
      endpoint,
      auth.accessToken,
    );

  /*
   * ----------------------------------------------------------
   * 401 handling
   * ----------------------------------------------------------
   *
   * The access token may have expired/revoked.
   *
   * Refresh once and retry once.
   *
   * We NEVER retry indefinitely.
   * ----------------------------------------------------------
   */

  if (
    result.response.status ===
    401
  ) {
    try {
      auth =
        await refreshPublicStravaAuth();

      result =
        await fetchStrava<T>(
          endpoint,
          auth.accessToken,
        );
    } catch (error) {
      /*
       * Do not expose token values.
       */
      console.error(
        "Unable to refresh Strava authentication.",
        error,
      );

      throw new StravaAuthenticationError(
        endpoint,
      );
    }
  }

  /*
   * ----------------------------------------------------------
   * Successful response
   * ----------------------------------------------------------
   */

  if (
    result.response.ok
  ) {
    return result.data as T;
  }

  /*
   * ----------------------------------------------------------
   * Authentication failure after retry
   * ----------------------------------------------------------
   */

  if (
    result.response.status ===
    401
  ) {
    throw new StravaAuthenticationError(
      endpoint,
      result.data,
    );
  }

  /*
   * ----------------------------------------------------------
   * Permission failure
   * ----------------------------------------------------------
   */

  if (
    result.response.status ===
    403
  ) {
    throw new StravaPermissionError(
      endpoint,
      result.data,
    );
  }

  /*
   * ----------------------------------------------------------
   * Rate limit
   * ----------------------------------------------------------
   */

  if (
    result.response.status ===
    429
  ) {
    throw new StravaApiError(
      "STRAVA_RATE_LIMIT",
      429,
      endpoint,
      result.data,
    );
  }

  /*
   * ----------------------------------------------------------
   * Other API error
   * ----------------------------------------------------------
   */

  const message =
    typeof (
      result.data as {
        message?: unknown;
      } | null
    )?.message ===
    "string"
      ? (
          result.data as {
            message: string;
          }
        ).message
      : `STRAVA_API_ERROR_${result.response.status}`;

  throw new StravaApiError(
    message,
    result.response.status,
    endpoint,
    result.data,
  );
}

/* ============================================================================
 * Connection
 * ========================================================================== */

export async function isStravaConnected(): Promise<boolean> {
  try {
    await getStravaAuth();

    return true;
  } catch {
    return false;
  }
}

/* ============================================================================
 * Athlete
 * ========================================================================== */

export async function getAthlete(): Promise<StravaAthlete> {
  return stravaFetch<StravaAthlete>(
    "/athlete",
  );
}

/* ============================================================================
 * Activities
 * ========================================================================== */

export interface GetActivitiesOptions {
  after?: number;
  before?: number;
}

export async function getActivities(
  page = 1,
  perPage = 200,
  options?: GetActivitiesOptions,
): Promise<StravaActivity[]> {
  const safePage =
    Number.isFinite(page)
      ? Math.max(
          1,
          Math.floor(page),
        )
      : 1;

  const safePerPage =
    Number.isFinite(perPage)
      ? Math.min(
          MAX_PER_PAGE,
          Math.max(
            1,
            Math.floor(perPage),
          ),
        )
      : MAX_PER_PAGE;

  const query =
    new URLSearchParams();

  query.set(
    "page",
    String(safePage),
  );

  query.set(
    "per_page",
    String(safePerPage),
  );

  if (
    options?.after !==
    undefined &&
    Number.isFinite(
      options.after,
    )
  ) {
    query.set(
      "after",
      String(
        Math.floor(
          options.after,
        ),
      ),
    );
  }

  if (
    options?.before !==
    undefined &&
    Number.isFinite(
      options.before,
    )
  ) {
    query.set(
      "before",
      String(
        Math.floor(
          options.before,
        ),
      ),
    );
  }

  return stravaFetch<
    StravaActivity[]
  >(
    `/athlete/activities?${query.toString()}`,
  );
}

/* ============================================================================
 * All Activities
 * ========================================================================== */

export async function getAllActivities(): Promise<
  StravaActivity[]
> {
  const allActivities:
    StravaActivity[] =
    [];

  for (
    let page = 1;
    page <=
    MAX_ACTIVITY_PAGES;
    page++
  ) {
    const activities =
      await getActivities(
        page,
        MAX_PER_PAGE,
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
     * Last page.
     */
    if (
      activities.length <
      MAX_PER_PAGE
    ) {
      break;
    }
  }

  return allActivities;
}

/* ============================================================================
 * Year-to-Date Activities
 * ========================================================================== */

export async function getYearToDateActivities(): Promise<
  StravaActivity[]
> {
  const now =
    new Date();

  /*
   * Start of current year.
   *
   * This represents local server time.
   */
  const startOfYear =
    new Date(
      now.getFullYear(),
      0,
      1,
      0,
      0,
      0,
      0,
    );

  const after =
    Math.floor(
      startOfYear.getTime() /
        1000,
    );

  const activities:
    StravaActivity[] =
    [];

  for (
    let page = 1;
    page <=
    MAX_ACTIVITY_PAGES;
    page++
  ) {
    const pageActivities =
      await getActivities(
        page,
        MAX_PER_PAGE,
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
      MAX_PER_PAGE
    ) {
      break;
    }
  }

  return activities;
}

/* ============================================================================
 * Running Activities
 * ========================================================================== */

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

export async function getAllRuns(): Promise<
  StravaActivity[]
> {
  const activities =
    await getAllActivities();

  return activities.filter(
    isRunningActivity,
  );
}

export async function getYearToDateRuns(): Promise<
  StravaActivity[]
> {
  const activities =
    await getYearToDateActivities();

  return activities.filter(
    isRunningActivity,
  );
}

/* ============================================================================
 * Recent Runs
 * ========================================================================== */

export async function getRecentRuns(
  limit = 3,
): Promise<StravaActivity[]> {
  const safeLimit =
    Number.isFinite(limit)
      ? Math.max(
          0,
          Math.floor(limit),
        )
      : 3;

  const runs =
    await getAllRuns();

  return runs.slice(
    0,
    safeLimit,
  );
}

export async function getRecentYearRuns(
  limit = 3,
): Promise<StravaActivity[]> {
  const safeLimit =
    Number.isFinite(limit)
      ? Math.max(
          0,
          Math.floor(limit),
        )
      : 3;

  const runs =
    await getYearToDateRuns();

  return runs.slice(
    0,
    safeLimit,
  );
}

/* ============================================================================
 * Activity
 * ========================================================================== */

export async function getActivity(
  activityId:
    | number
    | string,
): Promise<StravaActivity> {
  const id =
    String(activityId).trim();

  if (!id) {
    throw new Error(
      "STRAVA_ACTIVITY_ID_REQUIRED",
    );
  }

  return stravaFetch<StravaActivity>(
    `/activities/${encodeURIComponent(id)}`,
  );
}

/* ============================================================================
 * Activity Streams
 * ========================================================================== */

export async function getActivityStreams(
  activityId:
    | number
    | string,
): Promise<StravaActivityStreams> {
  const id =
    String(activityId).trim();

  if (!id) {
    throw new Error(
      "STRAVA_ACTIVITY_ID_REQUIRED",
    );
  }

  const keys = [
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
    `/activities/${encodeURIComponent(id)}/streams?${query.toString()}`,
  );
}

/* ============================================================================
 * Athlete Heart Rate Zones
 * ========================================================================== */

export async function getAthleteZones(): Promise<StravaAthleteZones> {
  return stravaFetch<StravaAthleteZones>(
    "/athlete/zones",
  );
}

/* ============================================================================
 * Activity Zones
 * ========================================================================== */

export async function getActivityZones(
  activityId:
    | number
    | string,
): Promise<StravaActivityZone[]> {
  const id =
    String(activityId).trim();

  if (!id) {
    throw new Error(
      "STRAVA_ACTIVITY_ID_REQUIRED",
    );
  }

  return stravaFetch<
    StravaActivityZone[]
  >(
    `/activities/${encodeURIComponent(id)}/zones`,
  );
}

/* ============================================================================
 * Gear
 * ========================================================================== */

export async function getGear(
  gearId: string,
): Promise<StravaGear> {
  const id =
    String(gearId).trim();

  if (!id) {
    throw new Error(
      "STRAVA_GEAR_ID_REQUIRED",
    );
  }

  return stravaFetch<StravaGear>(
    `/gear/${encodeURIComponent(id)}`,
  );
}

/* ============================================================================
 * Activity Gear
 * ========================================================================== */

export async function getActivityGear(
  activityId:
    | number
    | string,
): Promise<StravaGear | null> {
  const activity =
    await getActivity(
      activityId,
    );

  if (
    activity.gear
  ) {
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

/* ============================================================================
 * Running Gear
 * ========================================================================== */

export async function getRunningGear(): Promise<
  StravaGear[]
> {
  const runs =
    await getAllRuns();

  const gearIds =
    new Set<string>();

  for (
    const run of runs
  ) {
    if (
      run.gear_id
    ) {
      gearIds.add(
        run.gear_id,
      );
    }

    if (
      run.gear?.id
    ) {
      gearIds.add(
        run.gear.id,
      );
    }
  }

  if (
    gearIds.size ===
    0
  ) {
    return [];
  }

  const results =
    await Promise.all(
      Array.from(
        gearIds,
      ).map(
        async (
          gearId,
        ) => {
          try {
            return await getGear(
              gearId,
            );
          } catch {
            return null;
          }
        },
      ),
    );

  return results.filter(
    (
      gear,
    ): gear is StravaGear =>
      gear !== null,
  );
}

/* ============================================================================
 * Running Equipment
 * ========================================================================== */

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

export async function getRunningEquipment(): Promise<
  StravaEquipment
> {
  try {
    const runs =
      await getAllRuns();

    const deviceCounts =
      new Map<
        string,
        number
      >();

    for (
      const run of runs
    ) {
      const device =
        run.device_name?.trim();

      if (!device) {
        continue;
      }

      deviceCounts.set(
        device,
        (
          deviceCounts.get(
            device,
          ) ?? 0
        ) + 1,
      );
    }

    let watch:
      StravaEquipment["watch"] =
      null;

    if (
      deviceCounts.size >
      0
    ) {
      const sorted =
        Array.from(
          deviceCounts.entries(),
        ).sort(
          (
            a,
            b,
          ) =>
            b[1] - a[1],
        );

      const first =
        sorted[0];

      if (first) {
        const [
          deviceName,
          count,
        ] = first;

        watch = {
          name:
            deviceName,

          status:
            `${count} ${
              count === 1
                ? "run"
                : "runs"
            } recorded`,
        };
      }
    }

    const gearIds =
      new Set<string>();

    for (
      const run of runs
    ) {
      if (
        run.gear_id
      ) {
        gearIds.add(
          run.gear_id,
        );
      }

      if (
        run.gear?.id
      ) {
        gearIds.add(
          run.gear.id,
        );
      }
    }

    const shoes:
      StravaEquipment["shoes"] =
      [];

    if (
      gearIds.size >
      0
    ) {
      const gearResults =
        await Promise.all(
          Array.from(
            gearIds,
          ).map(
            async (
              gearId,
            ) => {
              try {
                return await getGear(
                  gearId,
                );
              } catch {
                return null;
              }
            },
          ),
        );

      for (
        const gear of
          gearResults
      ) {
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
            ? gear.distance /
              1000
            : undefined;

        shoes.push({
          name,

          distance,

          status:
            distance !==
            undefined
              ? `${distance.toFixed(
                  0,
                )} km`
              : "Strava gear",
        });
      }
    }

    return {
      watch,

      shoes,

      dataSources: [
        {
          name:
            "Strava",

          status:
            "Connected",
        },
      ],
    };
  } catch {
    /*
     * Return a safe empty state instead of
     * crashing the settings page.
     */
    return {
      watch: null,

      shoes: [],

      dataSources: [],
    };
  }
}

/* ============================================================================
 * Athlete Statistics
 * ========================================================================== */

export async function getAthleteStats(
  athleteId?:
    | number
    | string,
): Promise<StravaAthleteStats> {
  const auth =
    await getStravaAuth();

  const id =
    athleteId ??
    auth.athleteId;

  if (
    !id
  ) {
    throw new Error(
      "STRAVA_ATHLETE_ID_REQUIRED",
    );
  }

  return stravaFetch<StravaAthleteStats>(
    `/athletes/${encodeURIComponent(
      String(id),
    )}/stats`,
  );
}