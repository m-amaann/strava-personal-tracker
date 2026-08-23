import {
  NextRequest,
  NextResponse,
} from "next/server";

import { cookies } from "next/headers";

import {
  STRAVA_AUTH_COOKIE,
  decryptStravaAuth,
  encryptStravaAuth,
  isAccessTokenExpired,
  refreshStravaAuth,
} from "@/lib/strava/auth";

export const dynamic = "force-dynamic";

const STRAVA_API_BASE = "https://api-v3.strava.com";

type Resource =
  | "athlete"
  | "activities"
  | "activity"
  | "streams"
  | "stats";

/* -------------------------------------------------------------------------- */
/* Get valid Strava authentication                                             */
/* -------------------------------------------------------------------------- */

async function getValidAuth() {
  const cookieStore =
    await cookies();

  const token =
    cookieStore.get(
      STRAVA_AUTH_COOKIE,
    )?.value;

  if (!token) {
    return null;
  }

  const auth =
    await decryptStravaAuth(token);

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
   * has one hour or less remaining.
   */
  const refreshed =
    await refreshStravaAuth(
      auth,
    );

  /*
   * Encrypt the new access token,
   * refresh token and expiration time.
   */
  const encrypted =
    await encryptStravaAuth(
      refreshed,
    );

  /*
   * Persist the refreshed authentication.
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
     * Keep the authentication cookie
     * for a long period.
     *
     * The Strava access token itself
     * still expires normally and is
     * automatically refreshed above.
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
/* Strava API fetch                                                            */
/* -------------------------------------------------------------------------- */

async function stravaFetch(
  path: string,
  accessToken: string,
  options?: RequestInit,
) {
  const response =
    await fetch(
      `${STRAVA_API_BASE}${path}`,
      {
        ...options,

        headers: {
          Authorization:
            `Bearer ${accessToken}`,

          "Content-Type":
            "application/json",

          ...options?.headers,
        },

        cache: "no-store",
      },
    );

  const data =
    await response
      .json()
      .catch(
        () => null,
      );

  if (!response.ok) {
    return {
      ok: false,
      status:
        response.status,
      data,
    };
  }

  return {
    ok: true,
    status:
      response.status,
    data,
  };
}

/* -------------------------------------------------------------------------- */
/* GET /api/strava                                                             */
/* -------------------------------------------------------------------------- */

export async function GET(
  request: NextRequest,
) {
  try {
    /*
     * This is the only authentication
     * function required here.
     *
     * It automatically refreshes the
     * Strava token when necessary.
     */
    const auth =
      await getValidAuth();

    if (!auth) {
      return NextResponse.json(
        {
          connected: false,
          error:
            "Strava account is not connected.",
        },
        {
          status: 401,
        },
      );
    }

    const {
      searchParams,
    } = request.nextUrl;

    const resource =
      searchParams.get(
        "resource",
      ) as Resource | null;

    if (!resource) {
      return NextResponse.json(
        {
          error:
            "Missing resource. Use athlete, activities, activity, streams, or stats.",
        },
        {
          status: 400,
        },
      );
    }

    switch (resource) {
      /* -------------------------------------------------------------------- */
      /* Athlete                                                              */
      /* -------------------------------------------------------------------- */

      case "athlete": {
        const result =
          await stravaFetch(
            "/athlete",
            auth.accessToken,
          );

        if (!result.ok) {
          return NextResponse.json(
            {
              error:
                "Failed to fetch athlete.",

              details:
                result.data,
            },
            {
              status:
                result.status,
            },
          );
        }

        return NextResponse.json({
          connected: true,
          athlete:
            result.data,
        });
      }

      /* -------------------------------------------------------------------- */
      /* Activities                                                           */
      /* -------------------------------------------------------------------- */

      case "activities": {
        const page =
          searchParams.get(
            "page",
          ) ?? "1";

        const perPage =
          searchParams.get(
            "per_page",
          ) ?? "30";

        const before =
          searchParams.get(
            "before",
          );

        const after =
          searchParams.get(
            "after",
          );

        const params =
          new URLSearchParams();

        params.set(
          "page",
          page,
        );

        params.set(
          "per_page",
          perPage,
        );

        if (before) {
          params.set(
            "before",
            before,
          );
        }

        if (after) {
          params.set(
            "after",
            after,
          );
        }

        const result =
          await stravaFetch(
            `/athlete/activities?${params.toString()}`,
            auth.accessToken,
          );

        if (!result.ok) {
          return NextResponse.json(
            {
              error:
                "Failed to fetch activities.",

              details:
                result.data,
            },
            {
              status:
                result.status,
            },
          );
        }

        return NextResponse.json({
          connected: true,

          activities:
            result.data,

          page:
            Number(page),

          perPage:
            Number(perPage),
        });
      }

      /* -------------------------------------------------------------------- */
      /* Activity                                                             */
      /* -------------------------------------------------------------------- */

      case "activity": {
        const id =
          searchParams.get(
            "id",
          );

        if (!id) {
          return NextResponse.json(
            {
              error:
                "Missing activity id.",
            },
            {
              status: 400,
            },
          );
        }

        const result =
          await stravaFetch(
            `/activities/${encodeURIComponent(
              id,
            )}`,
            auth.accessToken,
          );

        if (!result.ok) {
          return NextResponse.json(
            {
              error:
                "Failed to fetch activity.",

              details:
                result.data,
            },
            {
              status:
                result.status,
            },
          );
        }

        return NextResponse.json({
          connected: true,

          activity:
            result.data,
        });
      }

      /* -------------------------------------------------------------------- */
      /* Streams                                                              */
      /* -------------------------------------------------------------------- */

      case "streams": {
        const id =
          searchParams.get(
            "id",
          );

        if (!id) {
          return NextResponse.json(
            {
              error:
                "Missing activity id.",
            },
            {
              status: 400,
            },
          );
        }

        const keys =
          searchParams.get(
            "keys",
          ) ??
          [
            "time",
            "distance",
            "latlng",
            "altitude",
            "velocity_smooth",
            "heartrate",
            "cadence",
            "watts",
            "grade_smooth",
          ].join(",");

        const params =
          new URLSearchParams();

        params.set(
          "keys",
          keys,
        );

        params.set(
          "key_by_type",
          "true",
        );

        const result =
          await stravaFetch(
            `/activities/${encodeURIComponent(
              id,
            )}/streams?${params.toString()}`,
            auth.accessToken,
          );

        if (!result.ok) {
          return NextResponse.json(
            {
              error:
                "Failed to fetch activity streams.",

              details:
                result.data,
            },
            {
              status:
                result.status,
            },
          );
        }

        return NextResponse.json({
          connected: true,

          activityId:
            Number(id),

          streams:
            result.data,
        });
      }

      /* -------------------------------------------------------------------- */
      /* Stats                                                                */
      /* -------------------------------------------------------------------- */

      case "stats": {
        const result =
          await stravaFetch(
            `/athletes/${encodeURIComponent(
              auth.athleteId,
            )}/stats`,
            auth.accessToken,
          );

        if (!result.ok) {
          return NextResponse.json(
            {
              error:
                "Failed to fetch athlete stats.",

              details:
                result.data,
            },
            {
              status:
                result.status,
            },
          );
        }

        return NextResponse.json({
          connected: true,

          stats:
            result.data,
        });
      }

      /* -------------------------------------------------------------------- */
      /* Invalid resource                                                     */
      /* -------------------------------------------------------------------- */

      default:
        return NextResponse.json(
          {
            error:
              `Unsupported resource: ${resource}`,
          },
          {
            status: 400,
          },
        );
    }
  } catch (error) {
    console.error(
      "Strava API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Internal server error.",
      },
      {
        status: 500,
      },
    );
  }
}