"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/components/auth/AuthContext";

interface Course {
  _id: string;
  code: string;
  name: string;
  credits: number;
  type: string;
  department: string;
}

interface Registration {
  _id: string;
  courseId: Course;
  semester: string;
  status: string;
  createdAt: string;
}

export default function CourseRegistration() {
  const { user } = useAuth();
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [semester, setSemester] = useState("Fall 2024");
  const [filterType, setFilterType] = useState<string>("ALL");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesRes, regsRes] = await Promise.all([
        api.get("/api/crs/courses"),
        api.get("/api/crs/registrations")
      ]);
      setAvailableCourses(coursesRes.data);
      setRegistrations(regsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load registration data.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (courseId: string) => {
    try {
      setRegistering(courseId);
      setError(null);
      setSuccess(null);
      
      await api.post("/api/crs/registrations", {
        courseId,
        semester
      });

      setSuccess("Registration request submitted successfully!");
      fetchData(); // Refresh data
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.response?.data?.message || "Failed to register for the course. Check prerequisites.");
    } finally {
      setRegistering(null);
    }
  };

  const filteredCourses = availableCourses.filter(course => {
    if (filterType === "ALL") return true;
    return course.type === filterType;
  });

  // Check if student is already registered for a course
  const isRegistered = (courseId: string) => {
    return registrations.some(reg => reg.courseId._id === courseId);
  };

  const getRegistrationStatus = (courseId: string) => {
    const reg = registrations.find(reg => reg.courseId._id === courseId);
    return reg ? reg.status : null;
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Course Registration</h2>
        <p className="text-gray-600">Register for electives and open courses for the upcoming semester.</p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 border-l-4 border-red-400">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4 border-l-4 border-green-400">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Available Courses */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Filter:</label>
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="rounded-md border-gray-300 py-1 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              >
                <option value="ALL">All Types</option>
                <option value="CORE">Core</option>
                <option value="ELECTIVE">Elective</option>
                <option value="OPEN">Open</option>
              </select>
            </div>
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Semester:</label>
              <select 
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="rounded-md border-gray-300 py-1 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              >
                <option value="Fall 2024">Fall 2024</option>
                <option value="Spring 2025">Spring 2025</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {loading ? (
              <div className="col-span-2 py-10 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="col-span-2 py-10 text-center text-gray-500">No courses available for these filters.</div>
            ) : (
              filteredCourses.map((course) => {
                const status = getRegistrationStatus(course._id);
                return (
                  <div key={course._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                    <div className="p-5 flex-1">
                      <div className="flex justify-between items-start">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          course.type === 'CORE' ? 'bg-blue-100 text-blue-800' : 
                          course.type === 'ELECTIVE' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {course.type}
                        </span>
                        <span className="text-sm font-medium text-gray-500">{course.credits} Credits</span>
                      </div>
                      <h3 className="mt-3 text-lg font-bold text-gray-900">{course.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{course.code} • {course.department}</p>
                    </div>
                    <div className="bg-gray-50 p-4 border-t border-gray-100 mt-auto">
                      {status ? (
                        <div className="flex items-center justify-between w-full">
                          <span className={`text-sm font-medium ${
                            status === 'APPROVED' ? 'text-green-600' : 
                            status === 'PENDING' ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            Status: {status}
                          </span>
                          <button disabled className="text-sm text-gray-400 cursor-not-allowed italic">Already Registered</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRegister(course._id)}
                          disabled={registering === course._id}
                          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:bg-indigo-300"
                        >
                          {registering === course._id ? "Registering..." : "Register Now"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* My Registrations Summary */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-900">My Registrations</h3>
            </div>
            <div className="p-0">
              {loading ? (
                <div className="p-6 text-center text-gray-500 text-sm">Loading...</div>
              ) : registrations.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">No registrations yet.</div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {registrations.map((reg) => (
                    <li key={reg._id} className="p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{reg.courseId.name}</p>
                          <p className="text-xs text-gray-500">{reg.courseId.code} • {reg.semester}</p>
                        </div>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          reg.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                          reg.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {reg.status}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="bg-indigo-900 rounded-lg shadow-md p-6 text-white">
            <h4 className="font-bold text-lg mb-2">Need Help?</h4>
            <p className="text-sm text-indigo-100 mb-4">If you are unable to register due to prerequisite issues, please contact your academic advisor.</p>
            <button className="text-sm font-semibold bg-white text-indigo-900 px-4 py-2 rounded shadow hover:bg-indigo-50 transition-colors">Contact Advisor</button>
          </div>
        </div>
      </div>
    </div>
  );
}
