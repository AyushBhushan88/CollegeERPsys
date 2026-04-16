"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";

interface Outcome {
  _id: string;
  type: string;
  code: string;
  description: string;
}

interface Mapping {
  sourceId: string;
  targetId: string;
  weight: number;
}

interface MatrixData {
  cos: Outcome[];
  targets: Outcome[];
  mappings: Mapping[];
}

interface Course {
  _id: string;
  code: string;
  name: string;
}

export default function OBEMappingMatrix() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [matrix, setMatrix] = useState<MatrixData | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setInitialLoading(true);
      const response = await api.get("/api/crs/courses");
      setCourses(response.data);
      if (response.data.length > 0) {
        setSelectedCourseId(response.data[0]._id);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCourseId) {
      fetchMatrix(selectedCourseId);
    }
  }, [selectedCourseId]);

  const fetchMatrix = async (courseId: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/crs/courses/${courseId}/mapping-matrix`);
      setMatrix(response.data);
    } catch (error) {
      console.error("Error fetching matrix:", error);
      setMatrix(null);
    } finally {
      setLoading(false);
    }
  };

  const getWeight = (coId: string, targetId: string) => {
    if (!matrix) return "-";
    const mapping = matrix.mappings.find(m => m.sourceId === coId && m.targetId === targetId);
    return mapping ? mapping.weight : "-";
  };

  if (initialLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const pos = matrix?.targets.filter(t => t.type === 'PO') || [];
  const psos = matrix?.targets.filter(t => t.type === 'PSO') || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">OBE Mapping Matrix</h2>
        <p className="text-gray-600">Course Outcome (CO) to Program Outcome (PO/PSO) weightage matrix.</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="max-w-xs">
          <label className="block text-sm font-medium text-gray-700">Select Course</label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          >
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.code} - {course.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
        </div>
      ) : !matrix || matrix.cos.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center bg-white rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-500">No mapping data available for this course.</p>
          <p className="text-sm text-gray-400">Ensure COs and POs are defined and mapped by an administrator.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 text-center">
                <tr>
                  <th rowSpan={2} className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 border-r border-gray-200">
                    Course Outcomes
                  </th>
                  {pos.length > 0 && (
                    <th colSpan={pos.length} className="px-6 py-2 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                      Program Outcomes (PO)
                    </th>
                  )}
                  {psos.length > 0 && (
                    <th colSpan={psos.length} className="px-6 py-2 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200 border-l border-gray-200">
                      PSOs
                    </th>
                  )}
                </tr>
                <tr>
                  {pos.map(po => (
                    <th key={po._id} title={po.description} className="px-2 py-3 text-xs font-medium text-gray-500 border-r border-gray-100 last:border-r-0">
                      {po.code}
                    </th>
                  ))}
                  {psos.map(pso => (
                    <th key={pso._id} title={pso.description} className="px-2 py-3 text-xs font-medium text-gray-500 border-r border-gray-100 last:border-r-0 border-l border-gray-200 first:border-l-0">
                      {pso.code}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {matrix.cos.map((co) => (
                  <tr key={co._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200" title={co.description}>
                      {co.code}
                    </td>
                    {pos.map(po => {
                      const weight = getWeight(co._id, po._id);
                      return (
                        <td key={po._id} className="px-2 py-4 whitespace-nowrap text-sm text-center text-gray-500 border-r border-gray-100 last:border-r-0">
                          <span className={weight !== '-' ? 'font-bold text-indigo-600' : ''}>
                            {weight}
                          </span>
                        </td>
                      );
                    })}
                    {psos.map(pso => {
                      const weight = getWeight(co._id, pso._id);
                      return (
                        <td key={pso._id} className="px-2 py-4 whitespace-nowrap text-sm text-center text-gray-500 border-r border-gray-100 last:border-r-0 border-l border-gray-200 first:border-l-0">
                          <span className={weight !== '-' ? 'font-bold text-indigo-600' : ''}>
                            {weight}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Weightage Legend:</h4>
            <div className="flex gap-6 text-xs text-gray-600">
              <div className="flex items-center gap-1"><span className="font-bold text-indigo-600">3:</span> Substantial</div>
              <div className="flex items-center gap-1"><span className="font-bold text-indigo-600">2:</span> Moderate</div>
              <div className="flex items-center gap-1"><span className="font-bold text-indigo-600">1:</span> Slight</div>
              <div className="flex items-center gap-1"><span className="font-bold text-indigo-600">-:</span> No Mapping</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
