"use client";

import React, { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/components/AuthProvider";
import {
  Resident,
  createResident,
  deactivateResident,
  listResidents,
  updateResident,
} from "@/lib/residentsApi";

function normalizeUnit(r: Resident): string {
  return String(r.unit || r.apartment || "").trim();
}

function ResidentRow({
  resident,
  onSelect,
}: {
  resident: Resident;
  onSelect: (r: Resident) => void;
}) {
  return (
    <button
      className="w-full text-left surface p-4 hover:translate-x-[1px] hover:translate-y-[1px] transition-transform"
      onClick={() => onSelect(resident)}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-black text-lg">{resident.name}</div>
          <div className="text-sm text-slate-600 mt-1">
            Unit: <span className="font-bold">{normalizeUnit(resident) || "—"}</span>
            {resident.building ? (
              <>
                {" "}
                • Building: <span className="font-bold">{resident.building}</span>
              </>
            ) : null}
            {resident.floor !== undefined && resident.floor !== null && String(resident.floor).length > 0 ? (
              <>
                {" "}
                • Floor: <span className="font-bold">{String(resident.floor)}</span>
              </>
            ) : null}
          </div>
          <div className="text-sm text-slate-600 mt-1">
            {resident.phone ? <span>Phone: {resident.phone}</span> : null}
            {resident.phone && resident.email ? <span> • </span> : null}
            {resident.email ? <span>Email: {resident.email}</span> : null}
          </div>
        </div>
        <div>
          <span className="kbd">{resident.is_active === false ? "inactive" : "active"}</span>
        </div>
      </div>
    </button>
  );
}

function ResidentEditor({
  open,
  onClose,
  resident,
  onSave,
  onDeactivate,
  canEdit,
}: {
  open: boolean;
  onClose: () => void;
  resident: Resident | null;
  onSave: (payload: Partial<Resident>) => Promise<void>;
  onDeactivate: () => Promise<void>;
  canEdit: boolean;
}) {
  const [draft, setDraft] = useState<Partial<Resident>>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setDraft(resident || {});
    setErr(null);
    setBusy(false);
  }, [resident]);

  if (!open || !resident) return null;

  const set = (k: keyof Resident) => (v: string) => {
    setDraft((d) => ({ ...d, [k]: v }));
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center p-3 z-20">
      <div className="surface p-5 w-full max-w-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xl font-black">Resident</div>
            <div className="text-sm text-slate-600 mt-1">
              ID: <span className="kbd">{String(resident.id)}</span>
            </div>
          </div>
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="label">Name</label>
            <input
              className="input"
              value={String(draft.name || "")}
              onChange={(e) => set("name")(e.target.value)}
              disabled={!canEdit}
            />
          </div>
          <div>
            <label className="label">Unit / Apartment</label>
            <input
              className="input"
              value={String(draft.unit || draft.apartment || "")}
              onChange={(e) => set("unit")(e.target.value)}
              disabled={!canEdit}
            />
          </div>
          <div>
            <label className="label">Building</label>
            <input
              className="input"
              value={String(draft.building || "")}
              onChange={(e) => set("building")(e.target.value)}
              disabled={!canEdit}
            />
          </div>
          <div>
            <label className="label">Floor</label>
            <input
              className="input"
              value={draft.floor === null || draft.floor === undefined ? "" : String(draft.floor)}
              onChange={(e) => set("floor")(e.target.value)}
              disabled={!canEdit}
            />
          </div>
          <div>
            <label className="label">Phone</label>
            <input
              className="input"
              value={String(draft.phone || "")}
              onChange={(e) => set("phone")(e.target.value)}
              disabled={!canEdit}
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              value={String(draft.email || "")}
              onChange={(e) => set("email")(e.target.value)}
              disabled={!canEdit}
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Notes</label>
            <textarea
              className="input min-h-[110px]"
              value={String(draft.notes || "")}
              onChange={(e) => set("notes")(e.target.value)}
              disabled={!canEdit}
            />
          </div>
        </div>

        {err ? (
          <div className="surface p-3 border-[var(--c-danger)] text-sm mt-4">
            <div className="font-black">Error</div>
            <div className="text-slate-700 mt-1">{err}</div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2 mt-4">
          {canEdit ? (
            <button
              className="btn btnPrimary"
              disabled={busy}
              onClick={async () => {
                setErr(null);
                setBusy(true);
                try {
                  await onSave(draft);
                  onClose();
                } catch (e: unknown) {
                  const msg =
                    e && typeof e === "object" && "message" in e
                      ? String((e as { message?: unknown }).message || "Save failed")
                      : "Save failed";
                  setErr(msg);
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? "Saving..." : "Save changes"}
            </button>
          ) : null}

          {canEdit ? (
            <button
              className="btn btnDanger"
              disabled={busy}
              onClick={async () => {
                setErr(null);
                setBusy(true);
                try {
                  await onDeactivate();
                  onClose();
                } catch (e: unknown) {
                  const msg =
                    e && typeof e === "object" && "message" in e
                      ? String((e as { message?: unknown }).message || "Deactivate failed")
                      : "Deactivate failed";
                  setErr(msg);
                } finally {
                  setBusy(false);
                }
              }}
            >
              Deactivate
            </button>
          ) : null}

          <div className="ml-auto text-xs text-slate-600">
            Status:{" "}
            <span className="kbd">{resident.is_active === false ? "inactive" : "active"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResidentsPage() {
  const { token, isAuthenticated, isAdmin } = useAuth();

  const [q, setQ] = useState("");
  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("");
  const [unit, setUnit] = useState("");
  const [active, setActive] = useState<"all" | "true" | "false">("all");

  const [items, setItems] = useState<Resident[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Resident | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const canLoad = Boolean(isAuthenticated && token);

  const load = async () => {
    if (!token) return;
    setBusy(true);
    setError(null);
    try {
      const res = await listResidents({ token, q, building, floor, unit, active });
      setItems(res);
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "message" in e
          ? String((e as { message?: unknown }).message || "Failed to load residents")
          : "Failed to load residents";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!canLoad) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canLoad]);

  const filteredCount = items.length;

  const [newResident, setNewResident] = useState<Partial<Resident>>({ name: "" });

  const canCreate = useMemo(() => (newResident.name || "").trim().length > 0, [newResident.name]);

  return (
    <div>
      <PageHeader
        title="Residents"
        subtitle="Search and filter the resident directory. Admins can edit and deactivate profiles."
        actions={
          <div className="flex items-center gap-2">
            <button className="btn" onClick={load} disabled={!canLoad || busy}>
              {busy ? "Refreshing..." : "Refresh"}
            </button>
            {isAdmin ? (
              <button className="btn btnPrimary" onClick={() => setCreateOpen(true)} disabled={!canLoad}>
                Add resident
              </button>
            ) : null}
          </div>
        }
      />

      {!isAuthenticated ? (
        <div className="surface p-5">
          <div className="font-black text-lg">Login required</div>
          <p className="text-slate-600 mt-2">
            Please sign in to view the directory.
          </p>
        </div>
      ) : (
        <>
          <div className="surface p-5">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <label className="label">Quick search</label>
                <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, phone, email..." />
              </div>
              <div>
                <label className="label">Building</label>
                <input className="input" value={building} onChange={(e) => setBuilding(e.target.value)} placeholder="A" />
              </div>
              <div>
                <label className="label">Floor</label>
                <input className="input" value={floor} onChange={(e) => setFloor(e.target.value)} placeholder="3" />
              </div>
              <div>
                <label className="label">Unit</label>
                <input className="input" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="3B" />
              </div>

              <div>
                <label className="label">Active</label>
                <select
                  className="input"
                  value={active}
                  onChange={(e) => setActive(e.target.value as "all" | "true" | "false")}
                >
                  <option value="all">All</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div className="md:col-span-4 flex items-center gap-2">
                <button className="btn btnPrimary" onClick={load} disabled={busy}>
                  Apply
                </button>
                <button
                  className="btn"
                  onClick={() => {
                    setQ("");
                    setBuilding("");
                    setFloor("");
                    setUnit("");
                    setActive("all");
                  }}
                  disabled={busy}
                >
                  Reset
                </button>
                <div className="ml-auto text-sm text-slate-600">
                  Showing <span className="kbd">{filteredCount}</span>
                </div>
              </div>
            </div>
          </div>

          {error ? (
            <div className="surface p-4 mt-4 border-[var(--c-danger)]">
              <div className="font-black">Error</div>
              <div className="text-slate-700 mt-1">{error}</div>
            </div>
          ) : null}

          <div className="mt-4 grid grid-cols-1 gap-3">
            {items.map((r) => (
              <ResidentRow key={String(r.id)} resident={r} onSelect={setSelected} />
            ))}
            {items.length === 0 && !busy ? (
              <div className="surface p-6 text-slate-600">
                No residents found. Try broadening your search.
              </div>
            ) : null}
          </div>

          <ResidentEditor
            open={Boolean(selected)}
            resident={selected}
            canEdit={isAdmin}
            onClose={() => setSelected(null)}
            onSave={async (payload) => {
              if (!token || !selected) return;
              const updated = await updateResident(token, selected.id, payload);
              setItems((prev) => prev.map((x) => (String(x.id) === String(updated.id) ? updated : x)));
            }}
            onDeactivate={async () => {
              if (!token || !selected) return;
              await deactivateResident(token, selected.id);
              setItems((prev) =>
                prev.map((x) =>
                  String(x.id) === String(selected.id) ? { ...x, is_active: false } : x,
                ),
              );
            }}
          />

          {/* Create modal */}
          {createOpen ? (
            <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center p-3 z-20">
              <div className="surface p-5 w-full max-w-2xl">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xl font-black">Add resident</div>
                    <div className="text-sm text-slate-600 mt-1">
                      Create a new resident profile (admin only).
                    </div>
                  </div>
                  <button className="btn" onClick={() => setCreateOpen(false)}>
                    Close
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="md:col-span-2">
                    <label className="label">Name *</label>
                    <input
                      className="input"
                      value={String(newResident.name || "")}
                      onChange={(e) => setNewResident((d) => ({ ...d, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="label">Unit / Apartment</label>
                    <input
                      className="input"
                      value={String(newResident.unit || "")}
                      onChange={(e) => setNewResident((d) => ({ ...d, unit: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="label">Building</label>
                    <input
                      className="input"
                      value={String(newResident.building || "")}
                      onChange={(e) => setNewResident((d) => ({ ...d, building: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="label">Floor</label>
                    <input
                      className="input"
                      value={newResident.floor === null || newResident.floor === undefined ? "" : String(newResident.floor)}
                      onChange={(e) => setNewResident((d) => ({ ...d, floor: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="label">Phone</label>
                    <input
                      className="input"
                      value={String(newResident.phone || "")}
                      onChange={(e) => setNewResident((d) => ({ ...d, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input
                      className="input"
                      value={String(newResident.email || "")}
                      onChange={(e) => setNewResident((d) => ({ ...d, email: e.target.value }))}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">Notes</label>
                    <textarea
                      className="input min-h-[110px]"
                      value={String(newResident.notes || "")}
                      onChange={(e) => setNewResident((d) => ({ ...d, notes: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <button
                    className="btn btnPrimary"
                    disabled={!token || busy || !canCreate}
                    onClick={async () => {
                      if (!token) return;
                      setBusy(true);
                      setError(null);
                      try {
                        const payload = {
                          name: String(newResident.name || "").trim(),
                          unit: newResident.unit ?? null,
                          apartment: newResident.apartment ?? null,
                          building: newResident.building ?? null,
                          floor: newResident.floor ?? null,
                          phone: newResident.phone ?? null,
                          email: newResident.email ?? null,
                          notes: newResident.notes ?? null,
                          photo_url: newResident.photo_url ?? null,
                          is_active: newResident.is_active ?? true,
                        };
                        const created = await createResident(token, payload);
                        setItems((prev) => [created, ...prev]);
                        setCreateOpen(false);
                        setNewResident({ name: "" });
                      } catch (e: unknown) {
                        const msg =
                          e && typeof e === "object" && "message" in e
                            ? String((e as { message?: unknown }).message || "Create failed")
                            : "Create failed";
                        setError(msg);
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    Create
                  </button>
                  <button className="btn" onClick={() => setCreateOpen(false)} disabled={busy}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
