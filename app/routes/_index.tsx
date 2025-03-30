import { useState, useEffect, useRef } from "react";
import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import SplashScreen from "~/components/SplashScreen";
import ChatBox from "~/components/ChatComponents/ChatBox";
import ChatInput from "~/components/ChatComponents/ChatInput";
import {
  registerDevice,
  setDeviceIdForRequest,
  startChatSession,
  updateChatSession,
} from "~/db/funcs";
import { generateMeta } from "~/utils/generateMeta";
import { getOrCreateDeviceId, commitSession } from "~/utils/session.server";

type Message = {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
};

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
  const { deviceId } = useLoaderData<typeof loader>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setLoading] = useState<Boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // FIX: Move this to the server and get the greeting from the server
  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();

    let greeting = "Hello";
    if (hour < 12) greeting = "Good morning";
    else if (hour < 18) greeting = "Good afternoon";
    else greeting = "Good evening";

    const initialMessage: Message = {
      id: "initial",
      text: `${greeting}! How are you feeling today?`,
      isBot: true,
      timestamp: now,
    };

    setMessages([initialMessage]);

    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      text,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // For now, simulate bot response
    // Later, we'll replace this with actual API call to GPT
    // TODO: Handle this properly
    setTimeout(() => {
      const botMessage: Message = {
        id: crypto.randomUUID(),
        text: getSimpleResponse(text),
        isBot: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    }, 500);
  };

  // Simple response function - this will be replaced with GPT call
  const getSimpleResponse = (text: string): string => {
    const lowerText = text.toLowerCase();

    if (lowerText.includes("hello") || lowerText.includes("hi")) {
      return "Hello! How can I help you today?";
    } else if (lowerText.includes("sad") || lowerText.includes("depressed")) {
      return "I'm sorry to hear you're feeling down. Would you like to talk about what's bothering you?";
    } else if (lowerText.includes("happy") || lowerText.includes("good")) {
      return "I'm glad to hear you're doing well! What has been going well for you?";
    } else if (lowerText.includes("anxious") || lowerText.includes("worried")) {
      return "It sounds like you're experiencing some anxiety. Would it help to talk through what's on your mind?";
    } else {
      return "Thank you for sharing. Can you tell me more about how you're feeling?";
    }
  };

  return isLoading === true ? (
    <SplashScreen />
  ) : (
    <div className="bg-secondary flex h-screen flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <ChatBox messages={messages} />
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 p-4">
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}
