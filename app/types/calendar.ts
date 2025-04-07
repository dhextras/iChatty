export type CalendarDateData = {
  date: Date;
  sessions: ChatSession[];
  averageMoodScore: number | null;
  isCurrentMonth: boolean;
};

export type DateSessions = {
  sessions: ChatSession[];
  averageMoodScore: number;
  moodTrend: "up" | "down" | "flat" | null;
};
