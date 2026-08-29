import { randomBytes } from "crypto";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const STRAVA_AUTHORIZE_URL =
  "https://www.strava.com/oauth/authorize";

const STATE_COOKIE =
  "strava_oauth_state";

const STATE_MAX_AGE_SECONDS =
  10 * 60;

export async function GET() {
  const clientId =
    process.env.STRAVA_CLIENT_ID?.trim();

  const redirectUri =
    process.env.STRAVA_REDIRECT_URI?.trim();

  if (!clientId) {
    return new NextResponse(
      "STRAVA_CLIENT_ID is not configured.",
      {
        status: 500,
      },
    );
  }

  if (!redirectUri) {
    return new NextResponse(
      "STRAVA_REDIRECT_URI is not configured.",
      {
        status: 500,
      },
    );
  }

  /*
   * Generate a cryptographically secure OAuth state.
   *
   * This protects the callback against CSRF attacks.
   */
  const state =
    randomBytes(32).toString("hex");

  const params =
    new URLSearchParams({
      client_id: clientId,

      response_type: "code",

      redirect_uri: redirectUri,

      /*
       * "force" makes Strava show the authorization screen.
       *
       * This is useful when reconnecting because we want
       * to explicitly confirm the requested permissions.
       */
      approval_prompt: "force",

      /*
       * Required for reading all activities, including
       * activities whose visibility is Only You.
       */
      scope: "read,activity:read_all",

      state,
    });

  const authorizeUrl =
    `${STRAVA_AUTHORIZE_URL}?${params.toString()}`;

  const response =
    NextResponse.redirect(
      authorizeUrl,
    );

  /*
   * Store OAuth state in an HttpOnly cookie.
   */
  response.cookies.set({
    name: STATE_COOKIE,

    value: state,

    httpOnly: true,

    secure:
      process.env.NODE_ENV ===
      "production",

    sameSite: "lax",

    path: "/",

    maxAge:
      STATE_MAX_AGE_SECONDS,
  });

  return response;
}