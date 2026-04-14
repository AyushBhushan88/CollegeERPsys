import React from "react";

export default function FacultyDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Faculty Dashboard</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-md border-t-4 border-indigo-600">
          <div className="text-sm font-medium text-gray-500">Current Courses</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">3</div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-md border-t-4 border-green-600">
          <div className="text-sm font-medium text-gray-500">Students Assigned</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">142</div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-md border-t-4 border-yellow-600">
          <div className="text-sm font-medium text-gray-500">Pending Grades</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">28</div>
        </div>
      </div>
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h3 className="mb-4 text-xl font-semibold text-gray-800">My Schedule</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Computer Networks</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">09:00 AM - 11:00 AM</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Lab 402</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
