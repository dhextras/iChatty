import { useState, useEffect, useRef } from "react";
import {
  json,
  LoaderFunction,
  ActionFunction,
  MetaFunction,
} from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";

import SplashScreen from "~/components/SplashScreen";
import ChatBox from "~/components/ChatComponents/ChatBox";
import ChatInput from "~/components/ChatComponents/ChatInput";
import {
  registerDevice,
  setDeviceIdForRequest,
  startChatSession,
  updateChatSession,
  getChatSessions,
} from "~/db/funcs";
import { generateMeta } from "~/utils/generateMeta";
import { getOrCreateDeviceId, commitSession } from "~/utils/session.server";
import { processMessageWithGPT } from "~/utils/chatGpt";

type Message = {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
};

type ChatSession = {
  id: string;
  device_id: string;
  start_time: string;
  end_time?: string;
  summary?: string;
  mood_score?: number;
};

type ResponseData = {
  botResponse: string;
  summary: string;
  mood: {
    score: number;
  };
};

export const meta: MetaFunction = generateMeta("Chat");

export const loader: LoaderFunction = async ({ request }) => {
  const headers = request.headers;
  const isPageRequest = headers.get("Accept")?.includes("text/html");

  if (!isPageRequest) {
    return json({});
  }

  const { deviceId, session } = await getOrCreateDeviceId(request);

  await registerDevice(deviceId);
  const data = await getChatSessions(deviceId);
  console.log(data);
  await setDeviceIdForRequest(deviceId);

  // FIXME: The problem with this is it comes from server but the hour is calculated
  // in server so we gotta replace that with an function that way its on server but time is from client
  const now = new Date();
  const hour = now.getHours();

  let greeting = "Hello";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 18) greeting = "Good afternoon";
  else greeting = "Good evening";

  const initialMessage = {
    id: "initial",
    text: `${greeting}! How are you feeling today?`,
    isBot: true,
    timestamp: now.toISOString(),
  };

  const chatSession: ChatSession = await startChatSession(deviceId);

  return json(
    {
      initialMessage,
      chatSessionId: chatSession?.id || null,
    },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    },
  );
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const text = formData.get("message") as string;
  const sessionId = formData.get("sessionId") as string;
  const messagesJson = formData.get("messages") as string;

  const messages = JSON.parse(messagesJson);
  const result = await processMessageWithGPT(messages, text);

  if (sessionId && result.summary && result.mood_score !== undefined) {
    // TODO: Gotta update the session every 5 min or something when there is nothing came
    // await updateChatSession(
    //   sessionId,
    //   result.summary,
    //   result.mood_score,
    // );
  }

  return json({
    botResponse: result.response,
    summary: result.summary,
    mood: {
      score: result.mood_score,
    },
  });
};

export default function Index() {
  const fetcher = useFetcher();
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setLoading] = useState<Boolean>(true);
  const loaderData = useLoaderData<typeof loader>();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (loaderData.initialMessage && loaderData.chatSessionId) {
      const formattedInitialMessage = {
        ...loaderData.initialMessage,
        timestamp: new Date(loaderData.initialMessage.timestamp),
      };

      setMessages([formattedInitialMessage]);
      setSessionId(loaderData.chatSessionId);

      setTimeout(() => {
        setLoading(false);
      }, 1500);
    }
  }, [loaderData.initialMessage?.id, loaderData.chatSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (fetcher.data) {
      const data = fetcher.data as ResponseData;

      const botMessage: Message = {
        id: crypto.randomUUID(),
        text: data.botResponse,
        isBot: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [fetcher.data]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      text,
      isBot: false,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    fetcher.submit(
      {
        message: text,
        sessionId: sessionId || "",
        messages: JSON.stringify(
          updatedMessages.map((msg) => ({
            text: msg.text,
            isBot: msg.isBot,
            timestamp: msg.timestamp.toISOString(),
          })),
        ),
      },
      { method: "post" },
    );
  };

  return isLoading === true ? (
    <SplashScreen />
  ) : (
    <div className="flex h-screen flex-col bg-secondary">
      <div className="flex-1 overflow-y-auto p-4">
        <ChatBox messages={messages} />
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 p-4">
        <ChatInput
          ref={inputRef}
          onSendMessage={handleSendMessage}
          isDisabled={fetcher.state === "submitting"}
        />
      </div>
    </div>
  );
}
