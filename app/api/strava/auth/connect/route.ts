import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const redirectUri = process.env.STRAVA_REDIRECT_URI;

  if (!clientId) {
    return new NextResponse(
      "STRAVA_CLIENT_ID is missing.",
      { status: 500 },
    );
  }

  if (!redirectUri) {
    return new NextResponse(
      "STRAVA_REDIRECT_URI is missing.",
      { status: 500 },
    );
  }

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    approval_prompt: "force",
    scope: "read,activity:read_all",
  });

  const stravaAuthorizeUrl =
    `https://www.strava.com/oauth/authorize?${params.toString()}`;

  return NextResponse.redirect(stravaAuthorizeUrl);
}