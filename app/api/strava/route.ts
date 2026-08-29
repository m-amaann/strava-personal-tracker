import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getActivities,
  getActivity,
  getActivityStreams,
  getAthlete,
  getAthleteStats,
  getAthleteZones,
  getActivityZones,
} from "@/lib/strava/api";

export const dynamic =
  "force-dynamic";

type Resource =
  | "athlete"
  | "activities"
  | "activity"
  | "streams"
  | "stats"
  | "zones"
  | "activity-zones";

function jsonError(
  message: string,
  status: number,
) {
  return NextResponse.json(
    {
      connected: false,
      error: message,
    },
    { status },
  );
}

function parsePositiveInteger(
  value: string | null,
  fallback: number,
  max?: number,
): number {
  const parsed =
    Number(value);

  if (
    !Number.isFinite(parsed) ||
    parsed < 1
  ) {
    return fallback;
  }

  const integer =
    Math.floor(parsed);

  if (
    max !== undefined
  ) {
    return Math.min(
      integer,
      max,
    );
  }

  return integer;
}

function parseOptionalTimestamp(
  value: string | null,
): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed =
    Number(value);

  if (
    !Number.isFinite(parsed)
  ) {
    return undefined;
  }

  return Math.floor(parsed);
}

export async function GET(
  request: NextRequest,
) {
  const searchParams =
    request.nextUrl.searchParams;

  const resource =
    searchParams.get(
      "resource",
    ) as Resource | null;

  if (!resource) {
    return jsonError(
      "Missing resource. Use athlete, activities, activity, streams, stats, zones, or activity-zones.",
      400,
    );
  }

  try {
    switch (resource) {
      /* ======================================================================
       * Athlete
       * ==================================================================== */

      case "athlete": {
        const athlete =
          await getAthlete();

        return NextResponse.json({
          connected: true,
          athlete,
        });
      }

      /* ======================================================================
       * Activities
       * ==================================================================== */

      case "activities": {
        const page =
          parsePositiveInteger(
            searchParams.get(
              "page",
            ),
            1,
          );

        const perPage =
          parsePositiveInteger(
            searchParams.get(
              "per_page",
            ),
            30,
            200,
          );

        const after =
          parseOptionalTimestamp(
            searchParams.get(
              "after",
            ),
          );

        const before =
          parseOptionalTimestamp(
            searchParams.get(
              "before",
            ),
          );

        const activities =
          await getActivities(
            page,
            perPage,
            {
              after,
              before,
            },
          );

        return NextResponse.json({
          connected: true,
          activities,
          page,
          perPage,
        });
      }

      /* ======================================================================
       * Activity
       * ==================================================================== */

      case "activity": {
        const id =
          searchParams.get(
            "id",
          );

        if (!id) {
          return jsonError(
            "Missing activity id.",
            400,
          );
        }

        const activity =
          await getActivity(id);

        return NextResponse.json({
          connected: true,
          activity,
        });
      }

      /* ======================================================================
       * Streams
       * ==================================================================== */

      case "streams": {
        const id =
          searchParams.get(
            "id",
          );

        if (!id) {
          return jsonError(
            "Missing activity id.",
            400,
          );
        }

        const streams =
          await getActivityStreams(
            id,
          );

        return NextResponse.json({
          connected: true,
          activityId: Number(id),
          streams,
        });
      }

      /* ======================================================================
       * Athlete Stats
       * ==================================================================== */

      case "stats": {
        const stats =
          await getAthleteStats();

        return NextResponse.json({
          connected: true,
          stats,
        });
      }

      /* ======================================================================
       * Athlete Zones
       * ==================================================================== */

      case "zones": {
        const zones =
          await getAthleteZones();

        return NextResponse.json({
          connected: true,
          zones,
        });
      }

      /* ======================================================================
       * Activity Zones
       * ==================================================================== */

      case "activity-zones": {
        const id =
          searchParams.get(
            "id",
          );

        if (!id) {
          return jsonError(
            "Missing activity id.",
            400,
          );
        }

        const zones =
          await getActivityZones(
            id,
          );

        return NextResponse.json({
          connected: true,
          activityId: Number(id),
          zones,
        });
      }

      /* ======================================================================
       * Invalid Resource
       * ==================================================================== */

      default:
        return jsonError(
          `Unsupported resource: ${resource}`,
          400,
        );
    }
  } catch (error) {
    console.error(
      "Strava API route error:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Unknown Strava error.";

    if (
      message ===
      "STRAVA_REFRESH_FAILED"
    ) {
      return jsonError(
        "Strava refresh token is invalid or expired. Reconnect Strava.",
        401,
      );
    }

    if (
      message ===
      "STRAVA_INVALID_REFRESH_RESPONSE"
    ) {
      return jsonError(
        "Strava returned an invalid refresh response.",
        502,
      );
    }

    if (
      message ===
      "STRAVA_AUTH_EXPIRED"
    ) {
      return jsonError(
        "Strava authentication has expired.",
        401,
      );
    }

    if (
      message ===
      "STRAVA_PERMISSION_DENIED"
    ) {
      return jsonError(
        "Strava permission denied.",
        403,
      );
    }

    if (
      message ===
      "STRAVA_RATE_LIMIT"
    ) {
      return jsonError(
        "Strava API rate limit reached. Please try again later.",
        429,
      );
    }

    if (
      message ===
      "STRAVA_NOT_FOUND"
    ) {
      return jsonError(
        "Strava resource was not found.",
        404,
      );
    }

    return NextResponse.json(
      {
        connected: false,
        error:
          message ||
          "Internal server error.",
      },
      {
        status: 500,
      },
    );
  }
}