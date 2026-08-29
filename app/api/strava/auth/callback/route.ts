import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  STRAVA_AUTH_COOKIE,
  encryptStravaAuth,
} from "@/lib/strava/auth";

export const dynamic = "force-dynamic";

const STRAVA_TOKEN_URL =
  "https://www.strava.com/oauth/token";

const STATE_COOKIE =
  "strava_oauth_state";

const AUTH_COOKIE_MAX_AGE =
  60 *
  60 *
  24 *
  365;

const REQUIRED_ACTIVITY_SCOPE =
  "activity:read_all";

/*
 * Normalize Strava scope formats.
 *
 * Depending on the OAuth response/version,
 * scopes can be represented differently.
 */
function normalizeScopes(
  scope: unknown,
): string[] {
  if (
    typeof scope !== "string"
  ) {
    return [];
  }

  return scope
    .split(/[,\s]+/)
    .map((item) =>
      item.trim(),
    )
    .filter(Boolean);
}

/*
 * Check whether the granted scopes are sufficient
 * for the application.
 */
function hasActivityReadAccess(
  scope: string,
): boolean {
  const scopes =
    normalizeScopes(scope);

  return (
    scopes.includes(
      REQUIRED_ACTIVITY_SCOPE,
    ) ||
    scopes.includes(
      "activity:read",
    )
  );
}

export async function GET(
  request: NextRequest,
) {
  const searchParams =
    request.nextUrl.searchParams;

  const code =
    searchParams.get("code");

  const state =
    searchParams.get("state");

  const error =
    searchParams.get("error");

  /*
   * ------------------------------------------------------------
   * User denied authorization
   * ------------------------------------------------------------
   */

  if (error) {
    console.warn(
      "Strava authorization denied:",
      error,
    );

    const response =
      NextResponse.redirect(
        new URL(
          "/settings?strava=denied",
          request.url,
        ),
      );

    response.cookies.delete(
      STATE_COOKIE,
    );

    return response;
  }

  /*
   * ------------------------------------------------------------
   * Authorization code
   * ------------------------------------------------------------
   */

  if (!code) {
    return new NextResponse(
      "Missing Strava authorization code.",
      {
        status: 400,
      },
    );
  }

  /*
   * ------------------------------------------------------------
   * Validate OAuth state
   * ------------------------------------------------------------
   */

  const savedState =
    request.cookies.get(
      STATE_COOKIE,
    )?.value;

  if (
    !state ||
    !savedState ||
    state !== savedState
  ) {
    console.warn(
      "Invalid Strava OAuth state.",
    );

    const response =
      NextResponse.redirect(
        new URL(
          "/settings?strava=error&reason=invalid_state",
          request.url,
        ),
      );

    response.cookies.delete(
      STATE_COOKIE,
    );

    return response;
  }

  /*
   * ------------------------------------------------------------
   * Environment
   * ------------------------------------------------------------
   */

  const clientId =
    process.env.STRAVA_CLIENT_ID?.trim();

  const clientSecret =
    process.env.STRAVA_CLIENT_SECRET?.trim();

  if (
    !clientId ||
    !clientSecret
  ) {
    console.error(
      "Strava OAuth credentials are missing.",
    );

    return new NextResponse(
      "Strava OAuth credentials are not configured.",
      {
        status: 500,
      },
    );
  }

  try {
    /*
     * ----------------------------------------------------------
     * Exchange authorization code
     * ----------------------------------------------------------
     *
     * Strava authorization codes are short-lived and
     * can only be used once.
     */
    const response =
      await fetch(
        STRAVA_TOKEN_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",

            Accept:
              "application/json",
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
        .catch(() => null);

    /*
     * ----------------------------------------------------------
     * Token exchange failure
     * ----------------------------------------------------------
     */

    if (!response.ok) {
      console.error(
        "Strava OAuth token exchange failed:",
        {
          status:
            response.status,

          details:
            data,
        },
      );

      const failureResponse =
        NextResponse.redirect(
          new URL(
            "/settings?strava=error&reason=token_exchange",
            request.url,
          ),
        );

      failureResponse.cookies.delete(
        STATE_COOKIE,
      );

      return failureResponse;
    }

    /*
     * ----------------------------------------------------------
     * Validate token response
     * ----------------------------------------------------------
     */

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
        "Invalid Strava OAuth response.",
      );

      const failureResponse =
        NextResponse.redirect(
          new URL(
            "/settings?strava=error&reason=invalid_response",
            request.url,
          ),
        );

      failureResponse.cookies.delete(
        STATE_COOKIE,
      );

      return failureResponse;
    }

    /*
     * ----------------------------------------------------------
     * Validate granted scope
     * ----------------------------------------------------------
     */

    const grantedScope =
      typeof data.scope ===
      "string"
        ? data.scope
        : "";

    if (
      !hasActivityReadAccess(
        grantedScope,
      )
    ) {
      console.error(
        "Strava activity permission was not granted:",
        {
          scope:
            grantedScope,
        },
      );

      const failureResponse =
        NextResponse.redirect(
          new URL(
            "/settings?strava=error&reason=activity_permission",
            request.url,
          ),
        );

      failureResponse.cookies.delete(
        STATE_COOKIE,
      );

      return failureResponse;
    }

    /*
     * ----------------------------------------------------------
     * Create encrypted browser authentication
     * ----------------------------------------------------------
     *
     * This cookie is useful for the browser that performed
     * OAuth. The public dashboard itself does not depend on
     * this cookie, so private/incognito browsers can still
     * access the dashboard.
     */
    const encryptedAuth =
      await encryptStravaAuth({
        athleteId:
          data.athlete.id,

        firstname:
          typeof data.athlete.firstname ===
          "string"
            ? data.athlete.firstname
            : "",

        lastname:
          typeof data.athlete.lastname ===
          "string"
            ? data.athlete.lastname
            : "",

        accessToken:
          data.access_token,

        refreshToken:
          data.refresh_token,

        expiresAt:
          data.expires_at,

        scope:
          grantedScope,
      });

    /*
     * IMPORTANT:
     *
     * Do not print access_token or refresh_token.
     *
     * Strava says refresh tokens may rotate. The latest
     * refresh token must be persisted and used for future
     * refresh operations.
     */
    console.log(
      "Strava authorization successful:",
      {
        athleteId:
          data.athlete.id,

        scope:
          grantedScope,

        expiresAt:
          data.expires_at,

        hasAccessToken:
          Boolean(
            data.access_token,
          ),

        hasRefreshToken:
          Boolean(
            data.refresh_token,
          ),
      },
    );

    /*
     * ----------------------------------------------------------
     * Redirect to Settings
     * ----------------------------------------------------------
     */

    const responseWithCookie =
      NextResponse.redirect(
        new URL(
          "/settings?strava=connected",
          request.url,
        ),
      );

    /*
     * Store encrypted authentication cookie.
     */
    responseWithCookie.cookies.set({
      name:
        STRAVA_AUTH_COOKIE,

      value:
        encryptedAuth,

      httpOnly: true,

      secure:
        process.env.NODE_ENV ===
        "production",

      sameSite: "lax",

      path: "/",

      maxAge:
        AUTH_COOKIE_MAX_AGE,
    });

    /*
     * OAuth state is one-time-use.
     */
    responseWithCookie.cookies.delete(
      STATE_COOKIE,
    );

    return responseWithCookie;
  } catch (error) {
    console.error(
      "Strava OAuth callback error:",
      error,
    );

    const failureResponse =
      NextResponse.redirect(
        new URL(
          "/settings?strava=error&reason=callback",
          request.url,
        ),
      );

    failureResponse.cookies.delete(
      STATE_COOKIE,
    );

    return failureResponse;
  }
}