import { NextRequest, NextResponse } from "next/server";

import { COOKIE_NAME, createStravaSession } from "@/lib/strava/session";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL("/more?strava=denied", request.url),
    );
  }

  if (!code) {
    return new NextResponse(
      "Missing Strava authorization code.",
      {
        status: 400,
      },
    );
  }

  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret =
    process.env.STRAVA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return new NextResponse(
      "Strava credentials are missing.",
      {
        status: 500,
      },
    );
  }

  try {
    const response = await fetch(
      "https://www.strava.com/oauth/token",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: "authorization_code",
        }),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "Strava token exchange failed:",
        errorText,
      );

      return new NextResponse(
        "Unable to connect Strava.",
        {
          status: 500,
        },
      );
    }

    const token = await response.json();

    if (
      !token.access_token ||
      !token.refresh_token ||
      !token.expires_at ||
      !token.athlete?.id
    ) {
      return new NextResponse(
        "Invalid response from Strava.",
        {
          status: 500,
        },
      );
    }

    const session = await createStravaSession({
      athleteId: token.athlete.id,
      firstname: token.athlete.firstname,
      lastname: token.athlete.lastname,
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      expiresAt: token.expires_at,
      scope: token.scope ?? "",
    });

    const responseWithCookie =
      NextResponse.redirect(
        new URL(
          "/more?strava=connected",
          request.url,
        ),
      );

    responseWithCookie.cookies.set({
      name: COOKIE_NAME,
      value: session,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
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