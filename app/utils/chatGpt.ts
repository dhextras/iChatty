import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Process messages with GPT and return structured response
 * @param messages Previous conversation messages
 * @param latestMessage Latest user message
 * @returns Object containing AI response, conversation summary, and mood score
 */
export async function processMessageWithGPT(
  messages: any[],
  latestMessage: string,
) {
  try {
    const formattedMessages = formatMessages(messages, latestMessage);

    const maxTokensPerRequest = 8192;
    const trimmedMessages = trimMessagesToFitTokenLimit(
      formattedMessages,
      maxTokensPerRequest,
    );

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: trimmedMessages,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const parsedResponse = JSON.parse(
      response.choices[0].message.content || "{}",
    );

    return {
      response:
        parsedResponse.response ||
        "I'm sorry, I couldn't generate a response right now.",
      summary: parsedResponse.summary || "No summary available.",
      mood_score:
        parsedResponse.mood_score !== undefined
          ? parsedResponse.mood_score
          : 50,
    };
  } catch (error) {
    console.error("Error processing message with GPT:", error);
    return {
      response:
        "I'm experiencing some technical difficulties. Please try again later or contact Admin.",
      summary: "Conversation interrupted due to technical issues.",
      mood_score: 50,
    };
  }
}

/**
 * Format the conversation history into OpenAI message format
 */
function formatMessages(messages: any[], latestMessage: string) {
  const systemPrompt = {
    role: "system",
    content: `You are a supportive AI assistant designed to engage in therapeutic conversations.
    Your responses should be empathetic, thoughtful, and aimed at supporting the user's emotional wellbeing.

    Respond in JSON format with three fields:
    1. "response": Your actual response to the user (empathetic and supportive)
    2. "summary": A brief summary of the conversation so far (1-2 sentences)
    3. "mood_score": A numerical assessment of the user's mood (0-100, where 0 is extremely negative, 50 is neutral, 100 is extremely positive)

    Keep your responses conversational and human-like while being therapeutically appropriate.`,
  };

  const formattedPreviousMessages = messages.map((msg) => ({
    role: msg.isBot ? "assistant" : "user",
    content: msg.text,
  }));

  return [
    systemPrompt,
    ...formattedPreviousMessages,
    { role: "user", content: latestMessage },
  ];
}

/**
 * Trim message history to fit within token limits
 * Keeps system prompt, recent messages, and latest user message
 */
function trimMessagesToFitTokenLimit(messages: any[], maxTokens: number) {
  // Very rough token estimation (4 chars ≈ 1 token)
  const estimateTokens = (text: string) => Math.ceil(text.length / 4);

  const systemPrompt = messages[0];
  const latestMessage = messages[messages.length - 1];

  const systemTokens = estimateTokens(systemPrompt.content);
  const latestTokens = estimateTokens(latestMessage.content);

  const reservedTokens = 1000;

  const remainingTokens =
    maxTokens - systemTokens - latestTokens - reservedTokens;

  if (remainingTokens <= 0) {
    return [systemPrompt, latestMessage];
  }

  let result = [systemPrompt];
  let usedTokens = systemTokens;

  for (let i = messages.length - 2; i > 0; i--) {
    const messageTokens = estimateTokens(messages[i].content);
    if (usedTokens + messageTokens <= remainingTokens) {
      result.push(messages[i]);
      usedTokens += messageTokens;
    } else {
      break;
    }
  }

  result.push(latestMessage);

  return result;
}
