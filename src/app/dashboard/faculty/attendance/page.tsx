"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

interface Course {
  _id: string;
  name: string;
  code: string;
}

interface Student {
  _id: string;
  name: string;
  email: string;
}

export default function FacultyAttendance() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/api/crs/catalog"); // Simplification for demo
        setCourses(res.data);
      } catch (err) {
        console.error("Failed to fetch courses", err);
      }
    };
    fetchCourses();
  }, []);

  const loadStudents = async (courseId: string) => {
    if (!courseId) {
      setStudents([]);
      return;
    }
    setSelectedCourse(courseId);
    setLoading(true);
    try {
      const res = await api.get(`/api/att/register/${courseId}`);
      setStudents(res.data);
      const initialAtt: Record<string, string> = {};
      res.data.forEach((s: Student) => initialAtt[s._id] = "PRESENT");
      setAttendance(initialAtt);
    } catch (err) {
      console.error("Failed to fetch students", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCourse) return;
    setSubmitting(true);
    try {
      const records = Object.keys(attendance).map(studentId => ({
        studentId,
        courseId: selectedCourse,
        date: new Date(),
        slotId: "L1", // Fixed slot for simplicity
        status: attendance[studentId]
      }));
      await api.post("/api/att/mark", { records });
      alert("Attendance marked successfully");
    } catch (err) {
      console.error("Failed to mark attendance", err);
      alert("Error marking attendance");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Mark Attendance</h1>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
        <select 
          onChange={(e) => loadStudents(e.target.value)} 
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">-- Choose Course --</option>
          {courses.map(c => <option key={c._id} value={c._id}>{c.code} - {c.name}</option>)}
        </select>
      </div>
      
      {loading && <div className="text-center py-4">Loading students...</div>}
      
      {students.length > 0 && !loading && (
        <div className="mt-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map(s => (
                  <tr key={s._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{s.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <select 
                        value={attendance[s._id]} 
                        onChange={(e) => setAttendance({...attendance, [s._id]: e.target.value})}
                        className="p-1 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="PRESENT">Present</option>
                        <option value="ABSENT">Absent</option>
                        <option value="LATE">Late</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6">
            <button 
              onClick={handleSubmit} 
              disabled={submitting}
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${submitting ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {submitting ? "Submitting..." : "Submit Attendance"}
            </button>
          </div>
        </div>
      )}
      
      {!loading && selectedCourse && students.length === 0 && (
        <div className="text-center py-4 text-gray-500">No students registered for this course.</div>
      )}
    </div>
  );
}
