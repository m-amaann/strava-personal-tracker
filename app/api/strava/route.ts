import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { COOKIE_NAME, decryptStravaSession } from "@/lib/strava/session";

const STRAVA_API_BASE =
  "https://www.strava.com/api/v3";

type Resource =
  | "athlete"
  | "activities"
  | "activity"
  | "streams"
  | "stats";

async function getSession() {
  const cookieStore = await cookies();

  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return decryptStravaSession(token);
}

async function stravaFetch(
  path: string,
  accessToken: string,
  options?: RequestInit,
) {
  const response = await fetch(
    `${STRAVA_API_BASE}${path}`,
    {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        ...options?.headers,
      },
      cache: "no-store",
    },
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      data,
    };
  }

  return {
    ok: true,
    status: response.status,
    data,
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          connected: false,
          error: "Strava account is not connected.",
        },
        { status: 401 },
      );
    }

    const { searchParams } = request.nextUrl;

    const resource =
      searchParams.get("resource") as Resource | null;

    if (!resource) {
      return NextResponse.json(
        {
          error:
            "Missing resource. Use athlete, activities, activity, streams, or stats.",
        },
        { status: 400 },
      );
    }

    switch (resource) {
      /**
       * GET /api/strava?resource=athlete
       *
       * Current authenticated Strava athlete.
       */
      case "athlete": {
        const result = await stravaFetch(
          "/athlete",
          session.accessToken,
        );

        if (!result.ok) {
          return NextResponse.json(
            {
              error: "Failed to fetch athlete.",
              details: result.data,
            },
            { status: result.status },
          );
        }

        return NextResponse.json({
          connected: true,
          athlete: result.data,
        });
      }

      /**
       * GET /api/strava?resource=activities
       *
       * Athlete activities.
       *
       * Optional:
       * ?page=1
       * ?per_page=30
       * ?before=timestamp
       * ?after=timestamp
       */
      case "activities": {
        const page =
          searchParams.get("page") ?? "1";

        const perPage =
          searchParams.get("per_page") ?? "30";

        const before =
          searchParams.get("before");

        const after =
          searchParams.get("after");

        const params = new URLSearchParams();

        params.set("page", page);
        params.set("per_page", perPage);

        if (before) {
          params.set("before", before);
        }

        if (after) {
          params.set("after", after);
        }

        const result = await stravaFetch(
          `/athlete/activities?${params.toString()}`,
          session.accessToken,
        );

        if (!result.ok) {
          return NextResponse.json(
            {
              error: "Failed to fetch activities.",
              details: result.data,
            },
            { status: result.status },
          );
        }

        return NextResponse.json({
          connected: true,
          activities: result.data,
          page: Number(page),
          perPage: Number(perPage),
        });
      }

      /**
       * GET /api/strava?resource=activity&id=123
       *
       * Detailed activity.
       */
      case "activity": {
        const id =
          searchParams.get("id");

        if (!id) {
          return NextResponse.json(
            {
              error:
                "Missing activity id.",
            },
            { status: 400 },
          );
        }

        const result = await stravaFetch(
          `/activities/${encodeURIComponent(id)}`,
          session.accessToken,
        );

        if (!result.ok) {
          return NextResponse.json(
            {
              error: "Failed to fetch activity.",
              details: result.data,
            },
            { status: result.status },
          );
        }

        return NextResponse.json({
          connected: true,
          activity: result.data,
        });
      }

      /**
       * GET /api/strava?resource=streams&id=123
       *
       * Activity streams.
       */
      case "streams": {
        const id =
          searchParams.get("id");

        if (!id) {
          return NextResponse.json(
            {
              error:
                "Missing activity id.",
            },
            { status: 400 },
          );
        }

        const keys =
          searchParams.get("keys") ??
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

        const params = new URLSearchParams();

        params.set("keys", keys);
        params.set("key_by_type", "true");

        const result = await stravaFetch(
          `/activities/${encodeURIComponent(
            id,
          )}/streams?${params.toString()}`,
          session.accessToken,
        );

        if (!result.ok) {
          return NextResponse.json(
            {
              error: "Failed to fetch activity streams.",
              details: result.data,
            },
            { status: result.status },
          );
        }

        return NextResponse.json({
          connected: true,
          activityId: Number(id),
          streams: result.data,
        });
      }

      /**
       * GET /api/strava?resource=stats
       *
       * Athlete statistics.
       */
      case "stats": {
        const athleteId =
          session.athleteId;

        const result = await stravaFetch(
          `/athletes/${encodeURIComponent(
            athleteId,
          )}/stats`,
          session.accessToken,
        );

        if (!result.ok) {
          return NextResponse.json(
            {
              error: "Failed to fetch athlete stats.",
              details: result.data,
            },
            { status: result.status },
          );
        }

        return NextResponse.json({
          connected: true,
          stats: result.data,
        });
      }

      default:
        return NextResponse.json(
          {
            error: `Unsupported resource: ${resource}`,
          },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error(
      "Strava API error:",
      error,
    );

    return NextResponse.json(
      {
        error: "Internal server error.",
      },
      { status: 500 },
    );
  }
}