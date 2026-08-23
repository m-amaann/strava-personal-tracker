import { createHash } from "crypto";
import {
  EncryptJWT,
  jwtDecrypt,
  type JWTPayload,
} from "jose";

export const COOKIE_NAME = "strava_session";

function getEncryptionKey() {
  const secret = process.env.STRAVA_SESSION_SECRET;

  if (!secret) {
    throw new Error(
      "STRAVA_SESSION_SECRET is not configured",
    );
  }

  return createHash("sha256")
    .update(secret)
    .digest();
}

export interface StravaSession extends JWTPayload {
  athleteId: number;
  firstname: string;
  lastname: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  scope: string;
}

export async function createStravaSession(
  session: StravaSession,
): Promise<string> {
  const key = getEncryptionKey();

  return new EncryptJWT(session)
    .setProtectedHeader({
      alg: "dir",
      enc: "A256GCM",
    })
    .setIssuedAt()
    .setExpirationTime("30d")
    .encrypt(key);
}

export async function decryptStravaSession(
  token: string,
): Promise<StravaSession | null> {
  try {
    const key = getEncryptionKey();

    const { payload } = await jwtDecrypt(
      token,
      key,
    );

    if (
      typeof payload.athleteId !== "number" ||
      typeof payload.accessToken !== "string" ||
      typeof payload.refreshToken !== "string" ||
      typeof payload.expiresAt !== "number"
    ) {
      return null;
    }

    return payload as StravaSession;
  } catch (error) {
    console.error(
      "Failed to decrypt Strava session:",
      error,
    );

    return null;
  }
}