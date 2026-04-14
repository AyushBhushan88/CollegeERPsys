"use client";

import React from "react";
import DocumentList from "@/components/vault/DocumentList";

export default function VaultPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Evidence Vault</h1>
        <p className="text-lg text-gray-500">
          Manage and upload supporting documents for academic and administrative compliance.
        </p>
      </div>

      <div className="grid gap-6">
        <DocumentList />
      </div>
    </div>
  );
}
