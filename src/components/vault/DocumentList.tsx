"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { useAuth } from "@/components/auth/AuthContext";

interface Evidence {
  _id: string;
  name: string;
  category: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export default function DocumentList() {
  const { user } = useAuth();
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchEvidences = async () => {
    if (!user?.profileId) return;
    try {
      setIsLoading(true);
      const response = await api.get(`/api/v1/vault/students/${user.profileId}/evidence`);
      setEvidences(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch evidences:", err);
      setError("Failed to load documents.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidences();
  }, [user?.profileId]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.profileId) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", "marksheet"); // Default category

    try {
      setIsUploading(true);
      await api.post(`/api/v1/vault/students/${user.profileId}/evidence`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      fetchEvidences(); // Refresh list
    } catch (err) {
      console.error("Upload failed:", err);
      setError("File upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const response = await api.get(`/api/v1/vault/evidence/${id}`);
      window.open(response.data.url, "_blank");
    } catch (err) {
      console.error("Download failed:", err);
      setError("Failed to get download link.");
    }
  };

  if (isLoading) return <div className="text-center py-10">Loading documents...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">My Evidence Vault</h2>
        <div>
          <label className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md cursor-pointer transition-colors inline-block">
            {isUploading ? "Uploading..." : "Upload Document"}
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded At</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {evidences.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-gray-500 italic">
                  No documents found in the vault.
                </td>
              </tr>
            ) : (
              evidences.map((evidence) => (
                <tr key={evidence._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{evidence.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{evidence.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(evidence.uploadedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDownload(evidence._id)}
                      className="text-indigo-600 hover:text-indigo-900 transition-colors"
                    >
                      View / Download
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
