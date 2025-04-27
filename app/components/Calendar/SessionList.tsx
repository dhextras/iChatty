import { format, parseISO } from "date-fns";

import type { ChatSession } from "~/types/chat";

type SessionListProps = {
  sessions: ChatSession[];
  onSelectSession?: (session: ChatSession) => void;
};

const SessionList = ({ sessions }: SessionListProps) => {
  const formatDateTime = (dateString: string): string => {
    try {
      const parsed = parseISO(dateString);
      return format(parsed, "yyyy-MM-dd HH:mm:ss");
    } catch (err) {
      return `Invalid date: ${dateString}, ${err}`;
    }
  };

  const getMoodColor = (score: number | undefined): string => {
    if (score === undefined) return "bg-gray-100";
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-green-300";
    if (score >= 40) return "bg-yellow-300";
    if (score >= 20) return "bg-orange-300";
    return "bg-red-400";
  };

  if (!sessions.length) {
    return (
      <div className="py-8 text-center text-gray-500">
        No sessions available for this date
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => {
        const startTime = formatDateTime(session.start_time);
        const endTime =
          session.end_time && session.end_time !== session.start_time
            ? formatDateTime(session.end_time)
            : "In progress";

        return (
          <div
            key={session.id}
            className="rounded-lg border p-3 hover:bg-gray-50"
          >
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">
                {format(startTime, "h:mm a")}
                {endTime && endTime !== "In progress"
                  ? ` - ${format(endTime, "h:mm a")}`
                  : ` - ${endTime}`}
              </span>
              <span
                className={`inline-block w-12 rounded-full px-2 text-center text-sm ${getMoodColor(session.mood_score || 0)} text-white`}
              >
                {session.mood_score}
              </span>
            </div>

            {session.summary && (
              <p className="mt-2 text-sm text-gray-700">{session.summary}</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SessionList;
