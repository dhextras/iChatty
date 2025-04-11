import { useLocation } from "@remix-run/react";
import { useCallback } from "react";

import { useNavigationWithConfirm } from "~/components/ConfirmNavigationDialog";

export default function Header() {
  const location = useLocation();
  const { navigateWithConfirm, ConfirmDialog } = useNavigationWithConfirm();

  const handleNavigate = useCallback(
    (to: string) => (e: React.MouseEvent) => {
      e.preventDefault();
      navigateWithConfirm(to);
    },
    [navigateWithConfirm],
  );

  return (
    <header className="flex items-center justify-between bg-[#EFEAFF] px-4 py-2 shadow-sm">
      {ConfirmDialog}

      <div
        onClick={handleNavigate("/")}
        className="flex items-center space-x-2"
      >
        <img src="/logo.svg" alt="i-Chatty Logo" className="h-12 w-auto" />
      </div>
      <nav className="flex space-x-4">
        <a
          href="/"
          onClick={handleNavigate("/")}
          className={`rounded-md px-3 py-1 text-gray-800 transition-colors hover:bg-purple-300 ${
            location.pathname === "/chat" ? "bg-primary font-medium" : ""
          }`}
        >
          New Chat
        </a>
        <a
          href="/calendar"
          onClick={handleNavigate("/calendar")}
          className={`rounded-md px-3 py-1 text-gray-800 transition-colors hover:bg-purple-300 ${
            location.pathname.includes("/calendar")
              ? "bg-primary font-medium"
              : ""
          }`}
        >
          Calendar
        </a>
      </nav>
    </header>
  );
}
