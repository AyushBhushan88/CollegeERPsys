"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SidebarItem {
  label: string;
  href: string;
}

const SIDEBAR_ITEMS: Record<string, SidebarItem[]> = {
  admin: [
    { label: "Admin Dashboard", href: "/dashboard/admin" },
    { label: "SIS Management", href: "/dashboard/admin/sis" },
    { label: "Tenant Settings", href: "/dashboard/admin/settings" },
    { label: "Evidence Vault", href: "/dashboard/vault" },
  ],
  faculty: [
    { label: "Faculty Dashboard", href: "/dashboard/faculty" },
    { label: "My Profile", href: "/dashboard/profile" },
    { label: "Course Management", href: "/dashboard/faculty/courses" },
    { label: "Evidence Vault", href: "/dashboard/vault" },
  ],
  student: [
    { label: "Student Dashboard", href: "/dashboard/student" },
    { label: "My Profile", href: "/dashboard/profile" },
    { label: "Academic Record", href: "/dashboard/student/academics" },
    { label: "Evidence Vault", href: "/dashboard/vault" },
  ],
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const role = user.role.toLowerCase();
  const sidebarItems = SIDEBAR_ITEMS[role] || [];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-900 text-white shadow-lg">
        <div className="flex h-20 items-center justify-center border-b border-indigo-800">
          <h1 className="text-2xl font-bold tracking-wider">ERP SYSTEM</h1>
        </div>
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-md px-4 py-2 text-indigo-100 transition-colors hover:bg-indigo-800 hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="absolute bottom-0 w-64 border-t border-indigo-800 p-4">
          <button
            onClick={logout}
            className="flex w-full items-center justify-center rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-100">
        <header className="flex h-16 items-center justify-between border-b bg-white px-8 shadow-sm">
          <div className="text-xl font-semibold text-gray-800">
            Welcome back, <span className="text-indigo-600 capitalize">{user.email.split('@')[0]}</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800 uppercase">
              {user.role}
            </span>
            <div className="h-8 w-8 rounded-full bg-indigo-500"></div>
          </div>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
