import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigation,
  useRouteError,
  isRouteErrorResponse,
} from "@remix-run/react";
import { generateMeta } from "~/utils/generateMeta";
import "./styles/root.css";
import Header from "./components/Header";

export const links: LinksFunction = () => [
  { rel: "icon", href: "/favicon.ico" },
];

export const meta: MetaFunction = generateMeta("Home");

export default function App() {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="flex h-full flex-col bg-secondary text-textPrimary">
        <Header />
        <main
          className={`flex flex-grow flex-col overflow-auto ${
            isLoading ? "opacity-40" : "opacity-100"
          } transition-opacity duration-300`}
        >
          <Outlet />
        </main>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// This catches unexpected errors (like a 404 or server error)
export function ErrorBoundary() {
  const error = useRouteError();

  console.error(error);

  if (isRouteErrorResponse(error)) {
    return (
      <html>
        <head>
          <title>
            {error.status} {error.statusText}
          </title>
          <Meta />
          <Links />
        </head>
        <body>
          <h1>
            {error.status} - {error.statusText}
          </h1>
          <p>{error.data || "Something went wrong. Refresh..."}</p>
          <Scripts />
        </body>
      </html>
    );
  }

  return (
    <html>
      <head>
        <title>Unexpected Error</title>
        <Meta />
        <Links />
      </head>
      <body>
        <h1>Unexpected Error</h1>
        <p>{error instanceof Error ? error.message : "Unknown error"}</p>
        <Scripts />
      </body>
    </html>
  );
}
