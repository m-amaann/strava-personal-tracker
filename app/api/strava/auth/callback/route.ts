import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  STRAVA_AUTH_COOKIE,
  encryptStravaAuth,
} from "@/lib/strava/auth";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
) {
  const searchParams =
    request.nextUrl.searchParams;

  const code =
    searchParams.get("code");

  const error =
    searchParams.get("error");

  /* ------------------------------------------------------------------------ */
  /* Strava denied authorization                                             */
  /* ------------------------------------------------------------------------ */

  if (error) {
    return NextResponse.redirect(
      new URL(
        "/more?strava=denied",
        request.url,
      ),
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Authorization code                                                       */
  /* ------------------------------------------------------------------------ */

  if (!code) {
    return new NextResponse(
      "Missing Strava authorization code.",
      {
        status: 400,
      },
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Environment variables                                                    */
  /* ------------------------------------------------------------------------ */

  const clientId =
    process.env.STRAVA_CLIENT_ID;

  const clientSecret =
    process.env.STRAVA_CLIENT_SECRET;

  if (
    !clientId ||
    !clientSecret
  ) {
    return new NextResponse(
      "Strava credentials are missing.",
      {
        status: 500,
      },
    );
  }

  try {
    /* ---------------------------------------------------------------------- */
    /* Exchange authorization code for tokens                                */
    /* ---------------------------------------------------------------------- */

    const response =
      await fetch(
        "https://www.strava.com/oauth/token",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },

          body:
            new URLSearchParams({
              client_id:
                clientId,

              client_secret:
                clientSecret,

              code,

              grant_type:
                "authorization_code",
            }),

          cache: "no-store",
        },
      );

    const data =
      await response
        .json()
        .catch(
          () => null,
        );

    /* ---------------------------------------------------------------------- */
    /* Token exchange failed                                                  */
    /* ---------------------------------------------------------------------- */

    if (!response.ok) {
      console.error(
        "Strava token exchange failed:",
        {
          status:
            response.status,

          data,
        },
      );

      return new NextResponse(
        "Unable to connect Strava.",
        {
          status: 500,
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* Validate Strava response                                               */
    /* ---------------------------------------------------------------------- */

    if (
      typeof data?.access_token !==
        "string" ||
      typeof data?.refresh_token !==
        "string" ||
      typeof data?.expires_at !==
        "number" ||
      typeof data?.athlete?.id !==
        "number"
    ) {
      console.error(
        "Invalid Strava OAuth response:",
        data,
      );

      return new NextResponse(
        "Invalid response from Strava.",
        {
          status: 500,
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* Create encrypted authentication                                        */
    /* ---------------------------------------------------------------------- */

    const encryptedAuth =
      await encryptStravaAuth({
        athleteId:
          data.athlete.id,

        firstname:
          data.athlete.firstname ??
          "",

        lastname:
          data.athlete.lastname ??
          "",

        accessToken:
          data.access_token,

        refreshToken:
          data.refresh_token,

        expiresAt:
          data.expires_at,

        scope:
          data.scope ?? "",
      });

    /* ---------------------------------------------------------------------- */
    /* Redirect after successful connection                                   */
    /* ---------------------------------------------------------------------- */

    const responseWithCookie =
      NextResponse.redirect(
        new URL(
          "/more?strava=connected",
          request.url,
        ),
      );

    /* ---------------------------------------------------------------------- */
    /* Persistent encrypted cookie                                            */
    /* ---------------------------------------------------------------------- */

    responseWithCookie.cookies.set({
      name:
        STRAVA_AUTH_COOKIE,

      value:
        encryptedAuth,

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
       * The Strava access token is still
       * short-lived. When it expires,
       * lib/strava/auth.ts refreshes it
       * using the refresh token.
       */
      maxAge:
        60 *
        60 *
        24 *
        365 *
        10,
    });

    return responseWithCookie;
  } catch (error) {
    console.error(
      "Strava OAuth error:",
      error,
    );

    return new NextResponse(
      "Something went wrong while connecting Strava.",
      {
        status: 500,
      },
    );
  }
}