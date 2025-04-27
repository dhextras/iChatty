export type Message = {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
};

export type ChatSession = {
  id: string;
  device_id: string;
  start_time: string;
  end_time?: string;
  summary?: string;
  mood_score?: number;
};

export type ResponseData = {
  botResponse: string;
  summary: string;
  sessionId: string;
  mood: {
    score: number;
  };
};
