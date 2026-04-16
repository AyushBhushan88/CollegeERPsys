"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

interface TimetableEntry {
  _id: string;
  dayOfWeek: number;
  slotIndex: number;
  courseId: {
    code: string;
    name: string;
  };
  roomId: {
    name: string;
    location: string;
  };
  facultyId?: {
    department: string;
  };
}

const DAYS = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SLOTS = ["09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", "12:00 - 13:00", "14:00 - 15:00", "15:00 - 16:00"];

export default function StudentTimetable() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await api.get("/api/tt/my-timetable");
        setEntries(res.data);
      } catch (err) {
        console.error("Failed to fetch timetable", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, []);

  const getEntry = (day: number, slot: number) => {
    return entries.find(e => e.dayOfWeek === day && e.slotIndex === slot);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white shadow rounded-lg overflow-hidden">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">My Academic Timetable</h1>

      {loading && <div className="text-center py-10">Loading your timetable...</div>}

      {!loading && (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-200 p-2 text-sm font-semibold text-gray-700">Time / Day</th>
                {DAYS.slice(1).map(day => (
                  <th key={day} className="border border-gray-200 p-2 text-sm font-semibold text-gray-700">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SLOTS.map((slotTime, slotIdx) => (
                <tr key={slotIdx}>
                  <td className="border border-gray-200 p-2 text-xs font-medium text-gray-500 bg-gray-50">{slotTime}</td>
                  {[1, 2, 3, 4, 5, 6].map(dayIdx => {
                    const entry = getEntry(dayIdx, slotIdx);
                    return (
                      <td key={dayIdx} className="border border-gray-200 p-2 min-h-[80px] w-[15%]">
                        {entry ? (
                          <div className="bg-indigo-50 border-l-4 border-indigo-500 p-2 rounded shadow-sm">
                            <div className="text-xs font-bold text-indigo-800">{entry.courseId.code}</div>
                            <div className="text-[10px] text-indigo-600 truncate">{entry.courseId.name}</div>
                            <div className="text-[10px] mt-1 text-gray-500 italic">
                              {entry.roomId.name} ({entry.roomId.location})
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-200 text-center">-</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
