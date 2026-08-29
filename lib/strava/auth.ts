import "server-only";

import { createHash } from "crypto";

import {
  EncryptJWT,
  jwtDecrypt,
  type JWTPayload,
} from "jose";

/* ============================================================================
 * Constants
 * ========================================================================== */

export const STRAVA_AUTH_COOKIE =
  "strava_auth";

const STRAVA_TOKEN_URL =
  "https://www.strava.com/oauth/token";

const STRAVA_API_URL =
  "https://www.strava.com/api/v3";

/*
 * Strava recommends refreshing when the access token
 * has one hour or less remaining.
 */
const TOKEN_REFRESH_BUFFER_SECONDS =
  60 * 60;

/* ============================================================================
 * Types
 * ========================================================================== */

export interface StravaAuth
  extends JWTPayload {
  athleteId: number;
  firstname: string;
  lastname: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  scope: string;
}

/* ============================================================================
 * Environment
 * ========================================================================== */

function getRequiredEnv(
  name: string,
): string {
  const value =
    process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `${name} is not configured.`,
    );
  }

  return value;
}

/* ============================================================================
 * Encryption
 * ========================================================================== */

function getEncryptionKey(): Buffer {
  const secret =
    getRequiredEnv(
      "STRAVA_SESSION_SECRET",
    );

  /*
   * Convert the application secret into
   * a fixed 32-byte AES-256 key.
   */
  return createHash("sha256")
    .update(secret)
    .digest();
}

/* ============================================================================
 * Encrypt
 * ========================================================================== */

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

/* ============================================================================
 * Decrypt
 * ========================================================================== */

export async function decryptStravaAuth(
  token: string,
): Promise<StravaAuth | null> {
  if (!token) {
    return null;
  }

  try {
    const key =
      getEncryptionKey();

    const {
      payload,
    } =
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
  } catch {
    /*
     * Do not expose token/cookie contents.
     */
    return null;
  }
}

/* ============================================================================
 * Access Token Expiration
 * ========================================================================== */

export function isAccessTokenExpired(
  expiresAt: number,
): boolean {
  if (
    !Number.isFinite(
      expiresAt,
    )
  ) {
    return true;
  }

  const now =
    Math.floor(
      Date.now() / 1000,
    );

  return (
    expiresAt <=
    now +
      TOKEN_REFRESH_BUFFER_SECONDS
  );
}

/* ============================================================================
 * Refresh Strava Authentication
 * ========================================================================== */

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

  if (
    !auth.refreshToken
  ) {
    throw new Error(
      "STRAVA_REFRESH_TOKEN_MISSING",
    );
  }

  let response: Response;

  try {
    response =
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

              grant_type:
                "refresh_token",

              refresh_token:
                auth.refreshToken,
            }),

          cache: "no-store",
        },
      );
  } catch {
    throw new Error(
      "STRAVA_TOKEN_NETWORK_ERROR",
    );
  }

  const data =
    await response
      .json()
      .catch(() => null);

  if (!response.ok) {
    /*
     * Do not print the refresh token.
     */
    console.error(
      "Strava token refresh rejected:",
      {
        status:
          response.status,

        message:
          data?.message ??
          "Unknown Strava error.",
      },
    );

    if (
      response.status ===
      401
    ) {
      throw new Error(
        "STRAVA_REFRESH_TOKEN_INVALID",
      );
    }

    throw new Error(
      "STRAVA_REFRESH_FAILED",
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
      "STRAVA_INVALID_REFRESH_RESPONSE",
    );
  }

  /*
   * IMPORTANT:
   *
   * Strava may return a new refresh token.
   *
   * Always use the refresh token returned by
   * the latest successful refresh.
   */
  return {
    ...auth,

    accessToken:
      data.access_token,

    refreshToken:
      data.refresh_token,

    expiresAt:
      data.expires_at,

    scope:
      typeof data.scope ===
      "string"
        ? data.scope
        : auth.scope,
  };
}

/* ============================================================================
 * Public Authentication
 *
 * This is the authentication used by EndrivoIQ's public dashboard.
 *
 * Visitors do NOT need a Strava cookie.
 *
 * Required environment variable:
 *
 * STRAVA_REFRESH_TOKEN
 * ========================================================================== */

let publicAuthCache:
  | StravaAuth
  | null = null;

let publicAuthPromise:
  | Promise<StravaAuth>
  | null = null;

/* ============================================================================
 * Get Athlete From Access Token
 * ========================================================================== */

async function getAthleteFromToken(
  accessToken: string,
): Promise<{
  id: number;
  firstname?: string;
  lastname?: string;
}> {
  let response: Response;

  try {
    response =
      await fetch(
        `${STRAVA_API_URL}/athlete`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${accessToken}`,

            Accept:
              "application/json",
          },

          cache: "no-store",
        },
      );
  } catch {
    throw new Error(
      "STRAVA_API_NETWORK_ERROR",
    );
  }

  const data =
    await response
      .json()
      .catch(() => null);

  if (!response.ok) {
    if (
      response.status ===
      401
    ) {
      throw new Error(
        "STRAVA_ACCESS_TOKEN_INVALID",
      );
    }

    throw new Error(
      `STRAVA_ATHLETE_${response.status}`,
    );
  }

  if (
    typeof data?.id !==
    "number"
  ) {
    throw new Error(
      "STRAVA_INVALID_ATHLETE",
    );
  }

  return data;
}

/* ============================================================================
 * Create Public Authentication
 * ========================================================================== */

async function createPublicAuth(): Promise<StravaAuth> {
  const refreshToken =
    getRequiredEnv(
      "STRAVA_REFRESH_TOKEN",
    );

  /*
   * We intentionally do NOT use STRAVA_ACCESS_TOKEN.
   *
   * Access tokens expire after six hours.
   *
   * The refresh token is the long-lived credential.
   */

  const temporaryAuth:
    StravaAuth = {
    athleteId: 0,

    firstname: "",

    lastname: "",

    accessToken: "",

    refreshToken,

    expiresAt: 0,

    scope:
      "read,activity:read_all",
  };

  /*
   * Get a fresh short-lived access token.
   */
  const refreshed =
    await refreshStravaAuth(
      temporaryAuth,
    );

  /*
   * Validate the token and obtain
   * the actual athlete.
   */
  const athlete =
    await getAthleteFromToken(
      refreshed.accessToken,
    );

  return {
    ...refreshed,

    athleteId:
      athlete.id,

    firstname:
      typeof athlete.firstname ===
      "string"
        ? athlete.firstname
        : "",

    lastname:
      typeof athlete.lastname ===
      "string"
        ? athlete.lastname
        : "",
  };
}

/* ============================================================================
 * Get Public Authentication
 * ========================================================================== */

export async function getPublicStravaAuth(): Promise<StravaAuth> {
  /*
   * Use cached authentication while the token
   * has more than one hour remaining.
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
   * Prevent concurrent refreshes.
   *
   * Without this, several dashboard components
   * could refresh the same Strava token at once.
   */
  if (
    publicAuthPromise
  ) {
    return publicAuthPromise;
  }

  publicAuthPromise =
    (async () => {
      try {
        /*
         * Existing cached authentication:
         * refresh it.
         */
        if (
          publicAuthCache
        ) {
          publicAuthCache =
            await refreshStravaAuth(
              publicAuthCache,
            );

          return publicAuthCache;
        }

        /*
         * First request / cold start.
         */
        publicAuthCache =
          await createPublicAuth();

        return publicAuthCache;
      } catch (error) {
        publicAuthCache =
          null;

        throw error;
      } finally {
        publicAuthPromise =
          null;
      }
    })();

  return publicAuthPromise;
}

/* ============================================================================
 * Force Public Authentication Refresh
 * ========================================================================== */

export async function refreshPublicStravaAuth(): Promise<StravaAuth> {
  /*
   * If another request is already refreshing,
   * wait for it.
   */
  if (
    publicAuthPromise
  ) {
    return publicAuthPromise;
  }

  publicAuthPromise =
    (async () => {
      try {
        /*
         * Refresh the existing cached token.
         */
        if (
          publicAuthCache
        ) {
          publicAuthCache =
            await refreshStravaAuth(
              publicAuthCache,
            );

          return publicAuthCache;
        }

        /*
         * No cache exists.
         *
         * Create authentication from the
         * configured refresh token.
         */
        publicAuthCache =
          await createPublicAuth();

        return publicAuthCache;
      } catch (error) {
        publicAuthCache =
          null;

        throw error;
      } finally {
        publicAuthPromise =
          null;
      }
    })();

  return publicAuthPromise;
}

/* ============================================================================
 * Clear Public Authentication
 * ========================================================================== */

export function clearPublicStravaAuth(): void {
  publicAuthCache =
    null;
}