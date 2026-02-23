"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/components/AuthProvider";
import { AuditEvent, listAudit } from "@/lib/auditApi";

function eventTime(e: AuditEvent): string {
  return e.ts || e.timestamp || "";
}

export default function AuditPage() {
  const { token, isAuthenticated, isAdmin } = useAuth();
  const [items, setItems] = useState<AuditEvent[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!token) return;
    setBusy(true);
    setError(null);
    try {
      setItems(await listAudit(token));
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "message" in e
          ? String((e as { message?: unknown }).message || "Failed to load audit log")
          : "Failed to load audit log";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!token || !isAdmin) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isAdmin]);

  return (
    <div>
      <PageHeader
        title="Audit Log"
        subtitle="Review changes made to resident records."
        actions={
          <button className="btn" onClick={load} disabled={!token || busy || !isAdmin}>
            {busy ? "Refreshing..." : "Refresh"}
          </button>
        }
      />

      {!isAuthenticated ? (
        <div className="surface p-5">
          <div className="font-black text-lg">Login required</div>
          <p className="text-slate-600 mt-2">Please sign in to view the audit log.</p>
        </div>
      ) : !isAdmin ? (
        <div className="surface p-5 border-[var(--c-danger)]">
          <div className="font-black text-lg">Access denied</div>
          <p className="text-slate-600 mt-2">Admin permissions are required.</p>
        </div>
      ) : (
        <div className="surface p-5 overflow-auto">
          {error ? (
            <div className="surface p-3 border-[var(--c-danger)] text-sm mb-4">
              <div className="font-black">Error</div>
              <div className="text-slate-700 mt-1">{error}</div>
            </div>
          ) : null}

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b-2 border-slate-900">
                <th className="py-2 pr-3">Time</th>
                <th className="py-2 pr-3">Actor</th>
                <th className="py-2 pr-3">Action</th>
                <th className="py-2 pr-3">Entity</th>
              </tr>
            </thead>
            <tbody>
              {items.map((e) => (
                <tr key={String(e.id)} className="border-b border-slate-200">
                  <td className="py-2 pr-3 whitespace-nowrap">{eventTime(e) || "—"}</td>
                  <td className="py-2 pr-3">{e.actor || "—"}</td>
                  <td className="py-2 pr-3 font-bold">{e.action}</td>
                  <td className="py-2 pr-3">
                    {(e.entity || "—") + (e.entity_id !== undefined && e.entity_id !== null ? ` #${e.entity_id}` : "")}
                  </td>
                </tr>
              ))}
              {items.length === 0 && !busy ? (
                <tr>
                  <td className="py-4 text-slate-600" colSpan={4}>
                    No audit events found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
