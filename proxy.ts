import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  STRAVA_AUTH_COOKIE,
  decryptStravaAuth,
  encryptStravaAuth,
  isAccessTokenExpired,
  refreshStravaAuth,
} from "@/lib/strava/auth";

export async function proxy(
  request: NextRequest,
) {
  const { pathname } =
    request.nextUrl;

  /*
   * OAuth routes handle their own
   * authentication and cookies.
   */
  if (
    pathname.startsWith(
      "/api/strava/auth",
    )
  ) {
    return NextResponse.next();
  }

  /*
   * Do not run the proxy on API routes.
   *
   * /api/strava/route.ts handles
   * token refreshing itself.
   */
  if (
    pathname.startsWith("/api/")
  ) {
    return NextResponse.next();
  }

  /*
   * Read the encrypted Strava
   * authentication cookie.
   */
  const cookie =
    request.cookies.get(
      STRAVA_AUTH_COOKIE,
    )?.value;

  /*
   * User has not connected Strava.
   */
  if (!cookie) {
    return NextResponse.next();
  }

  /*
   * Decrypt authentication.
   */
  const auth =
    await decryptStravaAuth(
      cookie,
    );

  /*
   * Invalid/old cookie.
   */
  if (!auth) {
    return NextResponse.next();
  }

  /*
   * Access token is still valid.
   *
   * Nothing needs to be changed.
   */
  if (
    !isAccessTokenExpired(
      auth.expiresAt,
    )
  ) {
    return NextResponse.next();
  }

  /*
   * Access token is expired or
   * has one hour or less remaining.
   *
   * Refresh it automatically.
   */
  try {
    const refreshed =
      await refreshStravaAuth(
        auth,
      );

    /*
     * Encrypt the new access token
     * and refresh token.
     */
    const encrypted =
      await encryptStravaAuth(
        refreshed,
      );

    /*
     * Continue to the requested page
     * with the updated cookie.
     */
    const response =
      NextResponse.next();

    response.cookies.set({
      name:
        STRAVA_AUTH_COOKIE,

      value:
        encrypted,

      httpOnly: true,

      secure:
        process.env.NODE_ENV ===
        "production",

      sameSite:
        "lax",

      path: "/",

      /*
       * Browser authentication cookie
       * lasts for 10 years.
       *
       * This does NOT mean the Strava
       * access token lasts 10 years.
       *
       * Strava access tokens are refreshed
       * automatically.
       */
      maxAge:
        60 *
        60 *
        24 *
        365 *
        10,
    });

    return response;
  } catch (error) {
    /*
     * Keep the existing cookie if
     * Strava refresh temporarily fails.
     */
    console.error(
      "Automatic Strava token refresh failed:",
      error,
    );

    return NextResponse.next();
  }
}

/* -------------------------------------------------------------------------- */
/* Matcher                                                                    */
/* -------------------------------------------------------------------------- */

export const config = {
  matcher: [
    /*
     * Run on application pages.
     *
     * Exclude:
     * - Next.js static files
     * - Next.js image optimizer
     * - favicon
     * - API routes
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};