"use client";

import React, { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/components/AuthProvider";
import { exportResidentsCsv, importResidentsCsv } from "@/lib/csvApi";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function ImportExportPage() {
  const { token, isAuthenticated, isAdmin } = useAuth();

  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const canUpload = useMemo(() => Boolean(file && token && isAdmin), [file, token, isAdmin]);

  return (
    <div>
      <PageHeader
        title="Import / Export"
        subtitle="Admins can export residents to CSV or import updates via CSV."
      />

      {!isAuthenticated ? (
        <div className="surface p-5">
          <div className="font-black text-lg">Login required</div>
          <p className="text-slate-600 mt-2">Please sign in to use CSV tools.</p>
        </div>
      ) : !isAdmin ? (
        <div className="surface p-5 border-[var(--c-danger)]">
          <div className="font-black text-lg">Access denied</div>
          <p className="text-slate-600 mt-2">Admin permissions are required.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section className="surface p-5">
            <h2 className="text-lg font-black">Export CSV</h2>
            <p className="text-slate-600 text-sm mt-2">
              Download the current resident directory as a CSV file.
            </p>

            <div className="mt-4">
              <button
                className="btn btnPrimary"
                disabled={!token || busy}
                onClick={async () => {
                  if (!token) return;
                  setBusy(true);
                  setMsg(null);
                  setErr(null);
                  try {
                    const blob = await exportResidentsCsv(token);
                    downloadBlob(blob, `residents-${new Date().toISOString().slice(0, 10)}.csv`);
                    setMsg("Export started.");
                  } catch (e: unknown) {
                    const msg =
                      e && typeof e === "object" && "message" in e
                        ? String((e as { message?: unknown }).message || "Export failed")
                        : "Export failed";
                    setErr(msg);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {busy ? "Preparing..." : "Download CSV"}
              </button>
            </div>
          </section>

          <section className="surface p-5">
            <h2 className="text-lg font-black">Import CSV</h2>
            <p className="text-slate-600 text-sm mt-2">
              Upload a CSV to add/update residents. (Exact column mapping is defined by the backend.)
            </p>

            <div className="mt-4">
              <label className="label" htmlFor="csvfile">
                CSV file
              </label>
              <input
                id="csvfile"
                className="input"
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                className="btn btnPrimary"
                disabled={!canUpload || busy}
                onClick={async () => {
                  if (!token || !file) return;
                  setBusy(true);
                  setMsg(null);
                  setErr(null);
                  try {
                    const res = await importResidentsCsv(token, file);
                    setMsg(
                      `Import complete. Imported: ${res.imported ?? "?"}, Updated: ${res.updated ?? "?"}`,
                    );
                    setFile(null);
                  } catch (e: unknown) {
                    const msg =
                      e && typeof e === "object" && "message" in e
                        ? String((e as { message?: unknown }).message || "Import failed")
                        : "Import failed";
                    setErr(msg);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {busy ? "Uploading..." : "Upload CSV"}
              </button>

              <button
                className="btn"
                disabled={busy}
                onClick={() => {
                  setFile(null);
                  setMsg(null);
                  setErr(null);
                }}
              >
                Clear
              </button>
            </div>

            {msg ? (
              <div className="surface p-3 text-sm mt-4">
                <div className="font-black">Status</div>
                <div className="text-slate-700 mt-1">{msg}</div>
              </div>
            ) : null}

            {err ? (
              <div className="surface p-3 border-[var(--c-danger)] text-sm mt-4">
                <div className="font-black">Error</div>
                <div className="text-slate-700 mt-1">{err}</div>
              </div>
            ) : null}
          </section>
        </div>
      )}
    </div>
  );
}
