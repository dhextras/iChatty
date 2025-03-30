import React from "react";

type ChatMessageProps = {
  message: string;
  isBot: boolean;
  timestamp: Date;
};

export default function ChatMessage({
  message,
  isBot,
  timestamp,
}: ChatMessageProps) {
  const formattedTime = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(timestamp));

  return (
    <div className={`flex ${isBot ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isBot
            ? "border border-gray-200 bg-white text-gray-800"
            : "bg-primary text-white"
        }`}
      >
        <p className="whitespace-pre-wrap">{message}</p>
        <span
          className={`mt-1 block text-xs ${isBot ? "text-gray-500" : "text-blue-100"}`}
        >
          {formattedTime}
        </span>
      </div>
    </div>
  );
}
