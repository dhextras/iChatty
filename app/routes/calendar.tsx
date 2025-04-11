import { json } from "@remix-run/node";
import { useState, useEffect } from "react";
import { useLoaderData } from "@remix-run/react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  parseISO,
} from "date-fns";

import MoodStats from "~/components/Calendar/MoodStats";
import SessionList from "~/components/Calendar/SessionList";
import { getChatSessions } from "~/db/funcs";
import { generateMeta } from "~/utils/generateMeta";
import { getOrCreateDeviceId } from "~/utils/session.server";

import type { ChatSession } from "~/types/chat";
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import type { CalendarDateData, DateSessions } from "~/types/calendar";

const getMoodColor = (score: number): string => {
  if (score === 0) return "bg-gray-400";
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-green-300";
  if (score >= 40) return "bg-yellow-300";
  if (score >= 20) return "bg-orange-300";
  return "bg-red-400";
};

const getSessionsForDate = (
  sessions: ChatSession[],
  date: Date,
): DateSessions => {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const filteredSessions = sessions.filter((session) => {
    const sessionDate = parseISO(session.start_time);
    return sessionDate >= dayStart && sessionDate <= dayEnd;
  });

  let totalScore = 0;
  let validScores = 0;
  filteredSessions.forEach((session) => {
    if (session.mood_score !== undefined) {
      totalScore += session.mood_score;
      validScores++;
    }
  });

  const averageMoodScore =
    validScores > 0 ? Math.round(totalScore / validScores) : 0;

  let moodTrend: "up" | "down" | "flat" | null = null;
  if (filteredSessions.length > 1) {
    const sortedSessions = [...filteredSessions]
      .filter((s) => s.mood_score !== undefined)
      .sort(
        (a, b) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
      );

    if (sortedSessions.length > 1) {
      const firstScore = sortedSessions[0].mood_score || 0;
      const lastScore =
        sortedSessions[sortedSessions.length - 1].mood_score || 0;

      if (lastScore > firstScore) moodTrend = "up";
      else if (lastScore < firstScore) moodTrend = "down";
      else moodTrend = "flat";
    }
  }

  return {
    sessions: filteredSessions,
    averageMoodScore,
    moodTrend,
  };
};

const generateCalendarDates = (
  currentDate: Date,
  sessions: ChatSession[],
): CalendarDateData[] => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDates: CalendarDateData[] = [];
  let day = startDate;

  while (day <= endDate) {
    const { sessions: dateSessions, averageMoodScore } = getSessionsForDate(
      sessions,
      day,
    );

    calendarDates.push({
      date: new Date(day),
      sessions: dateSessions,
      averageMoodScore,
      isCurrentMonth: isSameMonth(day, monthStart),
    });

    day = addDays(day, 1);
  }

  return calendarDates;
};

export const meta: MetaFunction = generateMeta("Calendar");

export const loader: LoaderFunction = async ({ request }) => {
  const { deviceId } = await getOrCreateDeviceId(request);
  const chatSessions = await getChatSessions(deviceId);

  return json({ chatSessions });
};

export default function Calendar() {
  const { chatSessions } = useLoaderData<typeof loader>();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarDates, setCalendarDates] = useState<CalendarDateData[]>([]);
  const [selectedSessions, setSelectedSessions] = useState<ChatSession[]>([]);
  const [view, setView] = useState<"calendar" | "sessions">("calendar");

  useEffect(() => {
    const dates = generateCalendarDates(currentDate, chatSessions);
    setCalendarDates(dates);
  }, [currentDate, chatSessions]);

  useEffect(() => {
    if (selectedDate) {
      const { sessions } = getSessionsForDate(chatSessions, selectedDate);
      setSelectedSessions(sessions);
    }
  }, [selectedDate, chatSessions]);

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (window.innerWidth < 768) {
      setView("sessions");
    }
  };

  const handleBackToCalendar = () => {
    setView("calendar");
  };

  return (
    <div className="flex flex-grow flex-col overflow-auto">
      <div className="md:hidden">
        {view === "sessions" && selectedDate && (
          <div className="flex items-center justify-between bg-white p-4 shadow">
            <button
              onClick={handleBackToCalendar}
              className="rounded-lg bg-action px-3 py-1 text-gray-800"
            >
              Back
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div
          className={`${
            view === "sessions" ? "hidden md:flex" : "flex"
          } w-full flex-col p-4 md:w-2/3`}
        >
          <div className="mb-4 flex items-center justify-between rounded-lg bg-white p-4 shadow">
            <button
              onClick={handlePrevMonth}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              &lt; Previous
            </button>
            <h2 className="text-xl font-semibold">
              {format(currentDate, "MMMM yyyy")}
            </h2>
            <button
              onClick={handleNextMonth}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              Next &gt;
            </button>
          </div>

          <div className="grid flex-1 grid-cols-7 gap-2 rounded-lg bg-white p-4 shadow">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="p-2 text-center font-semibold">
                {day}
              </div>
            ))}

            {calendarDates.map((dateData, i) => (
              <div
                key={i}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleDateClick(dateData.date);
                  }
                }}
                className={`relative cursor-pointer rounded-lg p-1 transition-all ${dateData.isCurrentMonth ? "bg-white" : "bg-gray-100"} ${
                  selectedDate && isSameDay(dateData.date, selectedDate)
                    ? "ring-2 ring-[#DCD0FF]"
                    : ""
                } hover:bg-secondary`}
                onClick={() => handleDateClick(dateData.date)}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span
                    className={`text-sm ${dateData.isCurrentMonth ? "text-gray-900" : "text-gray-400"}`}
                  >
                    {format(dateData.date, "d")}
                  </span>

                  {dateData.sessions.length > 0 && (
                    <span className="rounded-full bg-[#DCD0FF] px-1 text-xs text-gray-800">
                      {dateData.sessions.length}
                    </span>
                  )}
                </div>

                {dateData.averageMoodScore !== null && (
                  <div
                    className={`h-2 w-full rounded-full ${getMoodColor(dateData.averageMoodScore)}`}
                    title={`Mood score: ${dateData.averageMoodScore}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div
          className={`${
            view === "calendar" ? "hidden md:block" : "block"
          } w-full overflow-y-auto bg-white p-4 shadow-lg md:w-1/3`}
        >
          {selectedDate ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </h2>

              <MoodStats sessions={selectedSessions} />

              <div className="mt-6">
                <h3 className="mb-3 font-medium">
                  Sessions ({selectedSessions.length})
                </h3>
                <SessionList sessions={selectedSessions} />
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500">
              Select a date to view sessions
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
