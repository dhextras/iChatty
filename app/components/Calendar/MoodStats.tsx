import type { ChatSession } from "~/types/chat";

type MoodStatsProps = {
  sessions: ChatSession[];
};

const MoodStats = ({ sessions }: MoodStatsProps) => {
  let totalScore = 0;
  sessions.forEach((session) => {
    totalScore += session.mood_score || 0;
  });

  const averageMoodScore =
    sessions.length > 0 ? Math.round(totalScore / sessions.length) : 0;

  let moodTrend: "up" | "down" | "flat" | null = null;
  if (sessions.length > 1) {
    const sortedSessions = [...sessions].sort(
      (a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
    );

    const firstScore = sortedSessions[0].mood_score || 0;
    const lastScore = sortedSessions[sortedSessions.length - 1].mood_score || 0;

    if (lastScore > firstScore) moodTrend = "up";
    else if (lastScore < firstScore) moodTrend = "down";
    else moodTrend = "flat";
  }

  const getMoodColor = (score: number | null): string => {
    if (score === null) return "bg-gray-100";
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-green-300";
    if (score >= 40) return "bg-yellow-300";
    if (score >= 20) return "bg-orange-300";
    if (score === 0) return "bg-gray-400";
    return "bg-red-400";
  };

  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <h3 className="mb-2 font-medium">Mood Summary</h3>

      {sessions.length > 0 ? (
        <>
          <div className="mb-2 flex items-center gap-2">
            <div className="text-lg font-bold">
              Average mood: {averageMoodScore}/100
            </div>
            {moodTrend === "up" && <span className="text-green-500">↑</span>}
            {moodTrend === "down" && <span className="text-red-500">↓</span>}
            {moodTrend === "flat" && <span className="text-gray-500">→</span>}
          </div>

          <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full ${getMoodColor(averageMoodScore)}`}
              style={{ width: `${averageMoodScore}%` }}
            />
          </div>
        </>
      ) : (
        <p className="text-gray-500">No sessions on this date</p>
      )}
    </div>
  );
};

export default MoodStats;
