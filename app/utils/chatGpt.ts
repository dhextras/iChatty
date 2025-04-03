/**
 * Processes messages with GPT and returns a response, summary, and mood analysis.
 *
 * @param messages - Array of previous messages in the conversation
 * @param latestMessage - The newest message from the user to process
 * @returns Object containing response text, conversation summary, and mood analysis
 */
export async function processMessageWithGPT(
  messages: any[],
  latestMessage: string,
) {
  // TODO: Replace this with actual GPT API call
  // This is a placeholder implementation that simulates GPT responses

  const response = getSimpleResponse(latestMessage);
  const summary = generateConversationSummary(messages, latestMessage);

  const { score, label } = analyzeMood(messages, latestMessage);

  return {
    response,
    summary,
    mood_score: score,
    mood_label: label,
  };
}

/**
 * Simple response function - will be replaced with actual GPT API call
 */
function getSimpleResponse(text: string): string {
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
}

/**
 * Generates a simple summary of the conversation based on the messages
 */
function generateConversationSummary(
  messages: any[],
  latestMessage: string,
): string {
  if (messages.length <= 2) {
    return "Conversation just started.";
  }

  const keywords = {
    positive: ["happy", "good", "great", "excellent", "wonderful", "pleased"],
    negative: ["sad", "depressed", "unhappy", "anxious", "worried", "stressed"],
    neutral: ["okay", "fine", "alright", "so-so"],
  };

  let positiveCount = 0;
  let negativeCount = 0;
  let neutralCount = 0;

  const userMessages = messages.filter((msg) => !msg.isBot);
  userMessages.forEach((message) => {
    const text = message.text.toLowerCase();

    keywords.positive.forEach((word) => {
      if (text.includes(word)) positiveCount++;
    });

    keywords.negative.forEach((word) => {
      if (text.includes(word)) negativeCount++;
    });

    keywords.neutral.forEach((word) => {
      if (text.includes(word)) neutralCount++;
    });
  });

  // Generate a basic summary based on the emotional content
  if (positiveCount > negativeCount && positiveCount > neutralCount) {
    return "User is expressing generally positive emotions in this conversation.";
  } else if (negativeCount > positiveCount && negativeCount > neutralCount) {
    return "User is expressing some concerns or negative emotions in this conversation.";
  } else if (neutralCount > positiveCount && neutralCount > negativeCount) {
    return "User is expressing mainly neutral sentiments in this conversation.";
  } else {
    return "Mixed emotional content in this conversation.";
  }
}

/**
 * Analyzes the mood of the conversation based on the messages
 * Returns a score (0-100) and a label
 */
function analyzeMood(
  messages: any[],
  latestMessage: string,
): { score: number; label: string } {
  const userText = latestMessage.toLowerCase();

  let score = 50;
  let label = "neutral";

  const positiveWords = [
    "happy",
    "good",
    "great",
    "excellent",
    "wonderful",
    "pleased",
    "joy",
    "excitement",
  ];
  positiveWords.forEach((word) => {
    if (userText.includes(word)) score += 10;
  });

  const negativeWords = [
    "sad",
    "depressed",
    "unhappy",
    "anxious",
    "worried",
    "stressed",
    "angry",
    "upset",
  ];
  negativeWords.forEach((word) => {
    if (userText.includes(word)) score -= 10;
  });

  score = Math.max(0, Math.min(100, score));

  if (score >= 75) {
    label = "happy";
  } else if (score >= 60) {
    label = "content";
  } else if (score >= 40) {
    label = "neutral";
  } else if (score >= 25) {
    label = "sad";
  } else {
    label = "distressed";
  }

  return { score, label };
}
