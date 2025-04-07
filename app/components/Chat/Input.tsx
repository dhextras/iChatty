import { useState, forwardRef } from "react";

type ChatInputProps = {
  onSendMessage: (text: string) => void;
  isDisabled?: boolean;
};

const ChatInput = forwardRef<HTMLInputElement, ChatInputProps>(
  ({ onSendMessage, isDisabled = false }, ref) => {
    const [message, setMessage] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (message.trim() && !isDisabled) {
        onSendMessage(message);
        setMessage("");
      }
    };

    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          ref={ref}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={isDisabled}
        />
        <button
          type="submit"
          className={`rounded-full bg-primary p-2 text-white transition-colors hover:bg-opacity-90 ${
            isDisabled
              ? "cursor-not-allowed opacity-50"
              : "hover:bg-primary-dark"
          }`}
          disabled={isDisabled}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </form>
    );
  },
);

ChatInput.displayName = "ChatInput";

export default ChatInput;
