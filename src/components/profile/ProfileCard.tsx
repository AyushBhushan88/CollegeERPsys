import React from "react";

interface ProfileData {
  name: string;
  email: string;
  role: string;
  employeeId?: string;
  studentId?: string;
  department?: string;
  joinDate: string;
}

export default function ProfileCard({ data }: { data: ProfileData }) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-md">
      <div className="bg-indigo-600 px-6 py-8 text-center text-white">
        <div className="mx-auto h-24 w-24 rounded-full bg-white p-1">
          <div className="h-full w-full rounded-full bg-indigo-200 flex items-center justify-center text-indigo-600 text-3xl font-bold">
            {data.name.charAt(0)}
          </div>
        </div>
        <h3 className="mt-4 text-2xl font-bold">{data.name}</h3>
        <p className="text-indigo-100 uppercase tracking-wide text-sm">{data.role}</p>
      </div>
      <div className="px-6 py-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Email Address</dt>
            <dd className="mt-1 text-sm text-gray-900">{data.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Department</dt>
            <dd className="mt-1 text-sm text-gray-900">{data.department || "N/A"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              {data.role === "student" ? "Student ID" : "Employee ID"}
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {data.studentId || data.employeeId || "N/A"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Join Date</dt>
            <dd className="mt-1 text-sm text-gray-900">{data.joinDate}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
