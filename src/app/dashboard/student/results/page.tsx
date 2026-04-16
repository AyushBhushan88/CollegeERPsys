"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

interface Mark {
  courseId: {
    code: string;
    name: string;
    credits: number;
  };
  marksObtained: number;
  maxMarks: number;
  grade: string;
  gradePoints: number;
}

interface SemesterResult {
  semester: number;
  academicYear: string;
  marks: Mark[];
  sgpa: number;
  cgpa: number;
}

export default function StudentResults() {
  const [results, setResults] = useState<SemesterResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await api.get("/api/exam/my-results");
        setResults(res.data);
      } catch (err) {
        console.error("Failed to fetch results", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Academic Results</h1>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-indigo-700">
          Request Revaluation
        </button>
      </div>

      {loading && <div className="text-center py-10">Loading your results...</div>}

      {!loading && results.length > 0 && results.map((res, idx) => (
        <div key={idx} className="mb-10">
          <div className="bg-gray-100 p-4 rounded-t-lg border border-gray-200 flex justify-between items-center">
            <div>
              <span className="font-bold text-gray-700">Semester {res.semester}</span>
              <span className="mx-2 text-gray-400">|</span>
              <span className="text-gray-600">{res.academicYear}</span>
            </div>
            <div className="flex space-x-6">
              <div>
                <span className="text-sm text-gray-500 uppercase">SGPA:</span>
                <span className="ml-2 font-bold text-indigo-600 text-lg">{res.sgpa.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500 uppercase">CGPA:</span>
                <span className="ml-2 font-bold text-indigo-800 text-lg">{res.cgpa.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border-x border-b border-gray-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Name</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {res.marks.map((m, mIdx) => (
                  <tr key={mIdx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{m.courseId.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{m.courseId.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{m.courseId.credits}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{m.marksObtained} / {m.maxMarks}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 text-xs font-bold rounded ${m.grade === 'F' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {m.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{m.gradePoints}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {!loading && results.length === 0 && (
        <div className="text-center py-10 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 text-gray-500">
          No results have been published for you yet.
        </div>
      )}
    </div>
  );
}
