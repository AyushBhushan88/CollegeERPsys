import React from "react";

export default function StudentDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Student Dashboard</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg border-l-4 border-indigo-500">
          <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Attendance</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">92%</div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg border-l-4 border-green-500">
          <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Current GPA</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">3.85</div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg border-l-4 border-yellow-500">
          <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Courses</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">5</div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="mb-4 text-xl font-semibold text-gray-800 border-b pb-2">Upcoming Classes</h3>
          <ul className="space-y-3">
            <li className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
              <span className="font-medium text-gray-700">Advanced Algorithms</span>
              <span className="text-sm bg-indigo-100 text-indigo-800 px-2 py-1 rounded">10:00 AM</span>
            </li>
            <li className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
              <span className="font-medium text-gray-700">Database Systems</span>
              <span className="text-sm bg-indigo-100 text-indigo-800 px-2 py-1 rounded">01:30 PM</span>
            </li>
          </ul>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="mb-4 text-xl font-semibold text-gray-800 border-b pb-2">Pending Assignments</h3>
          <ul className="space-y-3">
            <li className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
              <span className="font-medium text-gray-700">Algorithm Design HW 3</span>
              <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">Tomorrow</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
