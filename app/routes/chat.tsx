import { useState, useEffect, useRef } from "react";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";

import ChatBox from "~/components/Chat/Box";
import ChatInput from "~/components/Chat/Input";
import {
  registerDevice,
  startChatSession,
  updateChatSession,
  setDeviceIdForRequest,
} from "~/db/funcs";
import { generateMeta } from "~/utils/generateMeta";
import { getOrCreateDeviceId, commitSession } from "~/utils/session.server";
import { processMessageWithGPT } from "~/utils/chatGpt";

import type { Message, ResponseData } from "~/types/chat";
import type {
  LoaderFunction,
  ActionFunction,
  MetaFunction,
} from "@remix-run/node";

export const meta: MetaFunction = generateMeta("Chat");

export const loader: LoaderFunction = async ({ request }) => {
  const headers = request.headers;
  const isPageRequest = headers.get("Accept")?.includes("text/html");

  if (!isPageRequest) {
    return json({});
  }

  const { deviceId, session } = await getOrCreateDeviceId(request);

  await registerDevice(deviceId);
  await setDeviceIdForRequest(deviceId);

  const chatSession = await startChatSession(deviceId);

  const initialMessage = {
    id: "initial",
    text: "__GREETING_PLACEHOLDER__",
    isBot: true,
    timestamp: new Date().toISOString(),
  };

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
    // await updateChatSession(sessionId, result.summary, result.mood_score);
  }

  return json({
    botResponse: result.response,
    summary: result.summary,
    mood: {
      score: result.mood_score,
    },
  });
};

export default function Chat() {
  const fetcher = useFetcher();
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const loaderData = useLoaderData<typeof loader>();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (loaderData.initialMessage && loaderData.chatSessionId) {
      const now = new Date();
      const hour = now.getHours();

      let greeting = "Hello";
      if (hour < 12) greeting = "Good morning";
      else if (hour < 18) greeting = "Good afternoon";
      else greeting = "Good evening";

      const initialMessageText = loaderData.initialMessage.text.replace(
        "__GREETING_PLACEHOLDER__",
        `${greeting}! How are you feeling today?`,
      );

      const formattedInitialMessage = {
        ...loaderData.initialMessage,
        text: initialMessageText,
        timestamp: new Date(loaderData.initialMessage.timestamp),
      };

      setMessages([formattedInitialMessage]);
      setSessionId(loaderData.chatSessionId);
    }
  }, [loaderData.initialMessage?.id, loaderData.chatSessionId]); // eslint-disable-line react-hooks/exhaustive-deps

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

  return (
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
