import { createHash } from "crypto";

import {
  EncryptJWT,
  jwtDecrypt,
  type JWTPayload,
} from "jose";

export const STRAVA_AUTH_COOKIE =
  "strava_auth";

export interface StravaAuth extends JWTPayload {
  athleteId: number;
  firstname: string;
  lastname: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  scope: string;
}

/* -------------------------------------------------------------------------- */
/* Environment                                                               */
/* -------------------------------------------------------------------------- */

function getRequiredEnv(
  name: string,
): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `${name} is not configured.`,
    );
  }

  return value;
}

/* -------------------------------------------------------------------------- */
/* Encryption                                                                */
/* -------------------------------------------------------------------------- */

function getEncryptionKey(): Buffer {
  const secret = getRequiredEnv(
    "STRAVA_SESSION_SECRET",
  );

  return createHash("sha256")
    .update(secret)
    .digest();
}

/* -------------------------------------------------------------------------- */
/* Encrypt                                                                   */
/* -------------------------------------------------------------------------- */

export async function encryptStravaAuth(
  auth: StravaAuth,
): Promise<string> {
  const key =
    getEncryptionKey();

  return new EncryptJWT({
    athleteId:
      auth.athleteId,

    firstname:
      auth.firstname,

    lastname:
      auth.lastname,

    accessToken:
      auth.accessToken,

    refreshToken:
      auth.refreshToken,

    expiresAt:
      auth.expiresAt,

    scope:
      auth.scope,
  })
    .setProtectedHeader({
      alg: "dir",
      enc: "A256GCM",
    })
    .setIssuedAt()
    .encrypt(key);
}

/* -------------------------------------------------------------------------- */
/* Decrypt                                                                   */
/* -------------------------------------------------------------------------- */

export async function decryptStravaAuth(
  token: string,
): Promise<StravaAuth | null> {
  try {
    const key =
      getEncryptionKey();

    const { payload } =
      await jwtDecrypt(
        token,
        key,
      );

    if (
      typeof payload.athleteId !==
        "number" ||
      typeof payload.firstname !==
        "string" ||
      typeof payload.lastname !==
        "string" ||
      typeof payload.accessToken !==
        "string" ||
      typeof payload.refreshToken !==
        "string" ||
      typeof payload.expiresAt !==
        "number" ||
      typeof payload.scope !==
        "string"
    ) {
      return null;
    }

    return {
      athleteId:
        payload.athleteId,

      firstname:
        payload.firstname,

      lastname:
        payload.lastname,

      accessToken:
        payload.accessToken,

      refreshToken:
        payload.refreshToken,

      expiresAt:
        payload.expiresAt,

      scope:
        payload.scope,
    };
  } catch (error) {
    console.error(
      "Failed to decrypt Strava authentication:",
      error,
    );

    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* Check Access Token                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Returns true when the access token is
 * expired or has one hour or less remaining.
 */
export function isAccessTokenExpired(
  expiresAt: number,
): boolean {
  const now =
    Math.floor(
      Date.now() / 1000,
    );

  return (
    expiresAt <=
    now + 60 * 60
  );
}

/* -------------------------------------------------------------------------- */
/* Refresh Access Token                                                      */
/* -------------------------------------------------------------------------- */

export async function refreshStravaAuth(
  auth: StravaAuth,
): Promise<StravaAuth> {
  const clientId =
    getRequiredEnv(
      "STRAVA_CLIENT_ID",
    );

  const clientSecret =
    getRequiredEnv(
      "STRAVA_CLIENT_SECRET",
    );

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

            grant_type:
              "refresh_token",

            refresh_token:
              auth.refreshToken,
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

  if (!response.ok) {
    console.error(
      "Strava refresh failed:",
      {
        status:
          response.status,

        data,
      },
    );

    throw new Error(
      "Unable to refresh Strava access token.",
    );
  }

  if (
    typeof data?.access_token !==
      "string" ||
    typeof data?.refresh_token !==
      "string" ||
    typeof data?.expires_at !==
      "number"
  ) {
    throw new Error(
      "Strava returned an invalid refresh response.",
    );
  }

  return {
    ...auth,

    accessToken:
      data.access_token,

    /*
     * Strava can return a new refresh token.
     * Always keep the newest one.
     */
    refreshToken:
      data.refresh_token,

    expiresAt:
      data.expires_at,
  };
}