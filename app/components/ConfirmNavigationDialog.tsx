import { useState } from "react";
import { useNavigate } from "@remix-run/react";

type ConfirmNavigationDialogProps = {
  show: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmNavigationDialog({
  show,
  onCancel,
  onConfirm,
}: ConfirmNavigationDialogProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h3 className="mb-3 text-lg font-medium text-gray-900">
          Leave this chat?
        </h3>
        <p className="mb-5 text-gray-600">
          If you leave, this chat session will be lost. Are you sure you want to
          continue?
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="rounded-md bg-gray-100 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-md bg-[#DCD0FF] px-4 py-2 text-gray-800 transition-colors hover:bg-purple-300"
          >
            Leave Chat
          </button>
        </div>
      </div>
    </div>
  );
}

export function useNavigationWithConfirm() {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [destination, setDestination] = useState<string | null>(null);

  const navigateWithConfirm = (to: string, skipConfirm = false) => {
    // If we're already in a chat page and trying to go somewhere else
    const isChatPage =
      window.location.pathname.includes("/chat") &&
      !window.location.pathname.includes("/calendar");

    if (isChatPage && !skipConfirm) {
      setDestination(to);
      setShowConfirm(true);
    } else {
      navigate(to);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setDestination(null);
  };

  const handleConfirm = () => {
    if (destination) {
      navigate(destination);
    }
    setShowConfirm(false);
    setDestination(null);
  };

  return {
    navigateWithConfirm,
    ConfirmDialog: (
      <ConfirmNavigationDialog
        show={showConfirm}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    ),
  };
}
