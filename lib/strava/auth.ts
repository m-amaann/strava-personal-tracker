import { createHash } from "crypto";
import {
  EncryptJWT,
  jwtDecrypt,
  type JWTPayload,
} from "jose";

export const STRAVA_AUTH_COOKIE = "strava_auth";

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

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured.`);
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
  const key = getEncryptionKey();

  return new EncryptJWT({
    athleteId: auth.athleteId,
    firstname: auth.firstname,
    lastname: auth.lastname,
    accessToken: auth.accessToken,
    refreshToken: auth.refreshToken,
    expiresAt: auth.expiresAt,
    scope: auth.scope,
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
    const key = getEncryptionKey();

    const { payload } = await jwtDecrypt(
      token,
      key,
    );

    if (
      typeof payload.athleteId !== "number" ||
      typeof payload.firstname !== "string" ||
      typeof payload.lastname !== "string" ||
      typeof payload.accessToken !== "string" ||
      typeof payload.refreshToken !== "string" ||
      typeof payload.expiresAt !== "number" ||
      typeof payload.scope !== "string"
    ) {
      return null;
    }

    return {
      athleteId: payload.athleteId,
      firstname: payload.firstname,
      lastname: payload.lastname,
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      expiresAt: payload.expiresAt,
      scope: payload.scope,
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
/* Access token expiry                                                       */
/* -------------------------------------------------------------------------- */

export function isAccessTokenExpired(
  expiresAt: number,
): boolean {
  const now = Math.floor(
    Date.now() / 1000,
  );

  /*
   * Refresh when the token has one hour
   * or less remaining.
   */
  return expiresAt <= now + 60 * 60;
}

/* -------------------------------------------------------------------------- */
/* Refresh Access Token                                                      */
/* -------------------------------------------------------------------------- */

export async function refreshStravaAuth(
  auth: StravaAuth,
): Promise<StravaAuth> {
  const clientId = getRequiredEnv(
    "STRAVA_CLIENT_ID",
  );

  const clientSecret = getRequiredEnv(
    "STRAVA_CLIENT_SECRET",
  );

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

        grant_type: "refresh_token",

        refresh_token:
          auth.refreshToken,
      }),

      cache: "no-store",
    },
  );

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    console.error(
      "Strava refresh failed:",
      {
        status: response.status,
        data,
      },
    );

    throw new Error(
      "Unable to refresh Strava access token.",
    );
  }

  if (
    typeof data?.access_token !== "string" ||
    typeof data?.refresh_token !== "string" ||
    typeof data?.expires_at !== "number"
  ) {
    console.error(
      "Invalid Strava refresh response:",
      data,
    );

    throw new Error(
      "Strava returned an invalid refresh response.",
    );
  }

  return {
    ...auth,

    accessToken:
      data.access_token,

    refreshToken:
      data.refresh_token,

    expiresAt:
      data.expires_at,
  };
}

/* -------------------------------------------------------------------------- */
/* Public-site authentication                                                */
/* -------------------------------------------------------------------------- */

/*
 * This allows EndrivoIQ to work without a database
 * and without requiring every visitor to connect Strava.
 *
 * The refresh token comes from:
 *
 * STRAVA_REFRESH_TOKEN
 *
 * We create an in-memory authentication object from
 * the refresh token and obtain a fresh Strava access
 * token when necessary.
 */

let publicAuthCache:
  StravaAuth | null = null;

/*
 * Prevent multiple simultaneous requests from
 * refreshing the token at the same time.
 */
let publicAuthRefreshPromise:
  Promise<StravaAuth> | null = null;

async function createPublicAuth(): Promise<StravaAuth> {
  const refreshToken =
    getRequiredEnv(
      "STRAVA_REFRESH_TOKEN",
    );

  /*
   * We do not know the athlete information yet.
   * Strava will provide it after obtaining the
   * access token.
   */

  const temporaryAuth: StravaAuth = {
    athleteId: 0,
    firstname: "",
    lastname: "",
    accessToken: "",
    refreshToken,
    expiresAt: 0,
    scope:
      "read,activity:read_all",
  };

  const refreshed =
    await refreshStravaAuth(
      temporaryAuth,
    );

  /*
   * Fetch the actual athlete using the
   * newly obtained access token.
   */
  const athleteResponse =
    await fetch(
      "https://www.strava.com/api/v3/athlete",
      {
        headers: {
          Authorization:
            `Bearer ${refreshed.accessToken}`,

          Accept:
            "application/json",
        },

        cache: "no-store",
      },
    );

  const athleteData =
    await athleteResponse
      .json()
      .catch(() => null);

  if (!athleteResponse.ok) {
    console.error(
      "Failed to fetch Strava athlete:",
      {
        status:
          athleteResponse.status,
        data: athleteData,
      },
    );

    throw new Error(
      "Unable to load Strava athlete.",
    );
  }

  if (
    typeof athleteData?.id !== "number"
  ) {
    throw new Error(
      "Strava returned an invalid athlete.",
    );
  }

  return {
    ...refreshed,

    athleteId:
      athleteData.id,

    firstname:
      typeof athleteData.firstname ===
      "string"
        ? athleteData.firstname
        : "",

    lastname:
      typeof athleteData.lastname ===
      "string"
        ? athleteData.lastname
        : "",
  };
}

/* -------------------------------------------------------------------------- */
/* Get public Strava authentication                                          */
/* -------------------------------------------------------------------------- */

export async function getPublicStravaAuth(): Promise<StravaAuth> {
  /*
   * Reuse the current in-memory token when
   * it still has more than one hour remaining.
   */
  if (
    publicAuthCache &&
    !isAccessTokenExpired(
      publicAuthCache.expiresAt,
    )
  ) {
    return publicAuthCache;
  }

  /*
   * If another request is already refreshing,
   * wait for that request.
   */
  if (publicAuthRefreshPromise) {
    return publicAuthRefreshPromise;
  }

  publicAuthRefreshPromise =
    (async () => {
      try {
        /*
         * If we already have authentication,
         * refresh it.
         */
        if (publicAuthCache) {
          publicAuthCache =
            await refreshStravaAuth(
              publicAuthCache,
            );

          return publicAuthCache;
        }

        /*
         * First request / cold start.
         *
         * Use STRAVA_REFRESH_TOKEN.
         */
        publicAuthCache =
          await createPublicAuth();

        return publicAuthCache;
      } finally {
        publicAuthRefreshPromise =
          null;
      }
    })();

  return publicAuthRefreshPromise;
}

/* -------------------------------------------------------------------------- */
/* Clear public authentication                                               */
/* -------------------------------------------------------------------------- */

export function clearPublicStravaAuth(): void {
  publicAuthCache = null;
}