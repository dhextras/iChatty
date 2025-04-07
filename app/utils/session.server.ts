import { createCookieSessionStorage } from "@remix-run/node";
import { v4 as uuidv4 } from "uuid";

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "therapy_chat_session",
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365, // 1 Year
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;

/**
 * Retrieves or creates a unique device ID for the current request session.
 *
 * @param {Request} request - The incoming request object.
 * @returns {Promise<{ deviceId: string; session: any }>} The device ID and session object.
 */
export async function getOrCreateDeviceId(
  request: Request,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{ deviceId: string; session: any }> {
  const session = await getSession(request.headers.get("Cookie"));

  let deviceId = session.get("deviceId");

  if (!deviceId) {
    // Generate a new device ID if one doesn't exist
    deviceId = uuidv4();
    session.set("deviceId", deviceId);
  }

  return { deviceId, session };
}
