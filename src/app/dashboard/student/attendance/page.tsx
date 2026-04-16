"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

interface AttendanceStat {
  courseId: string;
  courseName: string;
  courseCode: string;
  totalSessions: number;
  presentCount: number;
  percentage: number;
}

export default function StudentAttendance() {
  const [stats, setStats] = useState<AttendanceStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/api/att/stats");
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch attendance stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">My Attendance Dashboard</h1>

      {loading && <div className="text-center py-10">Loading your attendance records...</div>}

      {!loading && stats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map(s => (
            <div key={s.courseId} className="border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow bg-gray-50">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{s.courseName}</h3>
                  <p className="text-sm text-gray-500 font-medium">{s.courseCode}</p>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-bold ${s.percentage >= 75 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {s.percentage >= 75 ? 'ELIGIBLE' : 'SHORTAGE'}
                </div>
              </div>
              
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                      Attendance
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold inline-block text-indigo-600">
                      {s.percentage}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-3 mb-4 text-xs flex rounded bg-indigo-200">
                  <div 
                    style={{ width: `${s.percentage}%` }}
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${s.percentage >= 75 ? 'bg-indigo-500' : 'bg-red-500'}`}
                  ></div>
                </div>
              </div>
              
              <div className="flex justify-between text-sm text-gray-600 mt-2 border-t pt-2">
                <span>Present: <span className="font-bold">{s.presentCount}</span></span>
                <span>Total: <span className="font-bold">{s.totalSessions}</span></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && stats.length === 0 && (
        <div className="text-center py-10 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 text-gray-500">
          No attendance records found for your courses.
        </div>
      )}
    </div>
  );
}
