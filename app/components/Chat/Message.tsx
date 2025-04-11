import { format } from "date-fns";

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
  const formattedTime = format(new Date(timestamp), "h:mm a");

  return (
    <div className={`flex ${isBot ? "justify-start" : "justify-end"} mb-4`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 md:max-w-[70%] ${
          isBot
            ? "bg-white text-gray-800 shadow-sm"
            : "bg-[#DCD0FF] text-gray-800"
        }`}
      >
        <div className="whitespace-pre-wrap text-sm md:text-base">
          {message}
        </div>
        <div
          className={`mt-1 text-xs ${
            isBot ? "text-gray-500" : "text-gray-600"
          }`}
        >
          {formattedTime}
        </div>
      </div>
    </div>
  );
}
