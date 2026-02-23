"use client";

import React from "react";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/components/AuthProvider";

export default function AdminPage() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div>
      <PageHeader
        title="Admin"
        subtitle="Administrative tools: create/edit/deactivate residents, import/export CSV, and view audit log."
      />

      {!isAuthenticated ? (
        <div className="surface p-5">
          <div className="font-black text-lg">Login required</div>
          <p className="text-slate-600 mt-2">Please sign in to access admin tools.</p>
        </div>
      ) : !isAdmin ? (
        <div className="surface p-5 border-[var(--c-danger)]">
          <div className="font-black text-lg">Access denied</div>
          <p className="text-slate-600 mt-2">
            Your account does not have admin permissions.
          </p>
        </div>
      ) : (
        <div className="surface p-5">
          <div className="font-black">You are an admin.</div>
          <ul className="list-disc pl-6 mt-3 text-slate-700">
            <li>Use <span className="kbd">Residents</span> to edit or deactivate profiles</li>
            <li>Use <span className="kbd">Import/Export</span> for CSV operations</li>
            <li>Use <span className="kbd">Audit Log</span> to review changes</li>
          </ul>
        </div>
      )}
    </div>
  );
}
