import { useEffect } from "react";
import { json } from "@remix-run/node";

import SplashScreen from "~/components/SplashScreen";
import { generateMeta } from "~/utils/generateMeta";
import { registerDevice, setDeviceIdForRequest } from "~/db/funcs";
import { getOrCreateDeviceId, commitSession } from "~/utils/session.server";

import type { LoaderFunction, MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = generateMeta("Chat");

export const loader: LoaderFunction = async ({ request }) => {
  const { deviceId, session } = await getOrCreateDeviceId(request);

  await registerDevice(deviceId);
  await setDeviceIdForRequest(deviceId);

  return json(
    { deviceId },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    },
  );
};

export default function Index() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = "/chat";
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return <SplashScreen />;
}
