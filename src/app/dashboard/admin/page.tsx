import React from "react";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
          <div className="text-sm font-medium text-gray-500">Total Students</div>
          <div className="mt-2 text-3xl font-bold text-indigo-600">1,234</div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
          <div className="text-sm font-medium text-gray-500">Active Faculty</div>
          <div className="mt-2 text-3xl font-bold text-green-600">86</div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
          <div className="text-sm font-medium text-gray-500">Recent Admissions</div>
          <div className="mt-2 text-3xl font-bold text-yellow-600">12</div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
          <div className="text-sm font-medium text-gray-500">Compliance Documents</div>
          <div className="mt-2 text-3xl font-bold text-red-600">24</div>
        </div>
      </div>
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h3 className="mb-4 text-xl font-semibold text-gray-800">System Activity</h3>
        <div className="space-y-4">
          <p className="text-gray-600 italic">No recent activity found.</p>
        </div>
      </div>
    </div>
  );
}
