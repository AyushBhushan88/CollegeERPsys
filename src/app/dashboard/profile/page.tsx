"use client";

import React, { useEffect, useState } from "react";
import ProfileCard from "@/components/profile/ProfileCard";
import { useAuth } from "@/components/auth/AuthContext";
import api from "@/lib/api";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Try to fetch detailed profile from SIS API
        // This might fail if the backend routes aren't fully ready or matching
        // Fallback to user context data
        const response = await api.get("/sis/profile");
        setProfileData(response.data);
      } catch (error) {
        console.warn("Could not fetch detailed profile, using session data");
        if (user) {
          setProfileData({
            name: user.email.split('@')[0].toUpperCase(),
            email: user.email,
            role: user.role,
            joinDate: "January 2024",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (loading) {
    return <div className="text-center py-10">Loading profile...</div>;
  }

  if (!profileData) {
    return <div className="text-center py-10 text-red-500">Error loading profile data.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">User Profile</h2>
      <ProfileCard data={profileData} />
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 border-b pb-2">Account Settings</h3>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition">
          Change Password
        </button>
      </div>
    </div>
  );
}
