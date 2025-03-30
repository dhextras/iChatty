import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigation,
} from "@remix-run/react";

import { generateMeta } from "~/utils/generateMeta";

import "./styles/root.css";

export const links: LinksFunction = () => [
  { rel: "icon", href: "/favicon.ico" },
];

export const meta: MetaFunction = generateMeta("Home");

export default function App() {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <Meta />
        <Links />
      </head>
      <body className="bg-secondary text-textPrimary min-h-screen">
        {/*
         FIX: Create a proper header with menu later
        <header className="bg-primary px-4 py-3 text-white">
          <h1 className="text-xl font-semibold">I-Chatty</h1>
        </header>
        */}

        <main
          className={`transition-opacity duration-300 ${isLoading ? "opacity-50" : "opacity-100"}`}
        >
          <Outlet />
        </main>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
