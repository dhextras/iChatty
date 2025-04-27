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

export function ErrorBoundary() {
  const error = useRouteError();

  let title = "Unexpected Error";
  let message = "Something went wrong. Please try refreshing the page.";

  if (isRouteErrorResponse(error)) {
    title = `${error.status} - ${error.statusText}`;
    message = error.data || "Something went wrong. Refresh...";
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <Meta />
        <Links />
      </head>
      <body className="flex h-full flex-col bg-secondary text-textPrimary">
        <Header />
        <main className="flex flex-grow flex-col items-center justify-center overflow-auto p-8">
          <div className="max-w-md text-center">
            <h1 className="mb-4 text-3xl font-bold">{title}</h1>
            <p className="mb-6">{message}</p>
            <a
              href="/"
              className="inline-block rounded-md bg-primary px-6 py-2 text-white transition-colors hover:bg-opacity-90"
            >
              Return to Home
            </a>
          </div>
        </main>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
