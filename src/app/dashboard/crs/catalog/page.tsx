"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";

interface Unit {
  title: string;
  description: string;
}

interface Syllabus {
  _id: string;
  courseId: string;
  version: number;
  units: Unit[];
  status: string;
}

interface Course {
  _id: string;
  code: string;
  name: string;
  credits: number;
  type: string;
  department: string;
  prerequisites: Course[];
}

export default function CourseCatalog() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
  const [fetchingSyllabus, setFetchingSyllabus] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/crs/courses");
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSyllabus = async (course: Course) => {
    try {
      setFetchingSyllabus(true);
      setSelectedCourse(course);
      const response = await api.get(`/api/crs/courses/${course._id}/syllabus`);
      setSyllabus(response.data);
    } catch (error) {
      console.error("Error fetching syllabus:", error);
      setSyllabus(null);
    } finally {
      setFetchingSyllabus(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Course Catalog</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Course List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Course Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Dept
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Credits
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                      <p className="mt-2 text-gray-600">Loading catalog...</p>
                    </td>
                  </tr>
                ) : courses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-gray-500">
                      No courses found in the catalog.
                    </td>
                  </tr>
                ) : (
                  courses.map((course) => (
                    <tr
                      key={course._id}
                      className={selectedCourse?._id === course._id ? "bg-indigo-50" : "hover:bg-gray-50"}
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {course.code}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{course.name}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{course.department}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          course.type === 'CORE' ? 'bg-blue-100 text-blue-800' : 
                          course.type === 'ELECTIVE' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {course.type}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{course.credits}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <button
                          onClick={() => fetchSyllabus(course)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View Syllabus
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Syllabus View */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Syllabus Details</h3>
            </div>
            <div className="px-6 py-4">
              {!selectedCourse ? (
                <p className="py-10 text-center text-gray-500">Select a course to view its syllabus</p>
              ) : fetchingSyllabus ? (
                <div className="py-10 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                </div>
              ) : !syllabus ? (
                <div className="py-10 text-center">
                  <p className="text-gray-500">No active syllabus found for this course.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wide text-gray-500">Course</h4>
                    <p className="text-lg font-semibold text-indigo-900">{selectedCourse.name} ({selectedCourse.code})</p>
                    <p className="text-sm text-gray-500">Version: {syllabus.version} | Status: <span className="font-medium text-green-600">{syllabus.status}</span></p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-wide text-gray-500">Course Units</h4>
                    {syllabus.units.map((unit, index) => (
                      <div key={index} className="rounded-md border border-gray-100 bg-gray-50 p-4">
                        <h5 className="font-semibold text-gray-800">Unit {index + 1}: {unit.title}</h5>
                        <p className="mt-1 text-sm text-gray-600">{unit.description}</p>
                      </div>
                    ))}
                  </div>

                  {selectedCourse.prerequisites && selectedCourse.prerequisites.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wide text-gray-500">Prerequisites</h4>
                      <ul className="mt-2 list-inside list-disc text-sm text-gray-600">
                        {selectedCourse.prerequisites.map((pre) => (
                          <li key={pre._id}>{pre.code} - {pre.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
