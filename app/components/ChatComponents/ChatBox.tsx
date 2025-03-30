import React from "react";
import ChatMessage from "./ChatMessage";

type Message = {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
};

type ChatBoxProps = {
  messages: Message[];
};

export default function ChatBox({ messages }: ChatBoxProps) {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message.text}
          isBot={message.isBot}
          timestamp={message.timestamp}
        />
      ))}
    </div>
  );
}
