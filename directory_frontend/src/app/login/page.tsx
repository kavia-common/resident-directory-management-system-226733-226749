"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, user } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => username.trim().length > 0 && password.length > 0, [username, password]);

  return (
    <div>
      <PageHeader
        title="Login"
        subtitle="Sign in to access admin tools and protected operations."
      />

      <div className="surface p-5 max-w-xl">
        {isAuthenticated ? (
          <div className="mb-4">
            <div className="font-bold">Already signed in</div>
            <div className="text-slate-600 text-sm mt-1">
              {user?.username} <span className="kbd ml-2">{user?.role}</span>
            </div>
            <div className="text-slate-600 text-sm mt-2">
              You can sign in again to switch user.
            </div>
          </div>
        ) : null}

        <form
          className="flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            if (!canSubmit) return;

            setBusy(true);
            try {
              await login({ username: username.trim(), password });
              router.push("/residents");
            } catch (err: unknown) {
              const msg =
                err && typeof err === "object" && "message" in err
                  ? String((err as { message?: unknown }).message || "Login failed")
                  : "Login failed";
              setError(msg);
            } finally {
              setBusy(false);
            }
          }}
        >
          <div>
            <label className="label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error ? (
            <div className="surface p-3 border-[var(--c-danger)] text-sm">
              <div className="font-black">Error</div>
              <div className="text-slate-700 mt-1">{error}</div>
            </div>
          ) : null}

          <div className="flex items-center gap-2">
            <button className="btn btnPrimary" disabled={busy || !canSubmit} type="submit">
              {busy ? "Signing in..." : "Sign in"}
            </button>
            <button
              className="btn"
              type="button"
              disabled={busy}
              onClick={() => {
                setUsername("");
                setPassword("");
                setError(null);
              }}
            >
              Clear
            </button>
          </div>

          <div className="text-xs text-slate-600 mt-1">
            Backend base: <span className="kbd">NEXT_PUBLIC_API_BASE</span>
          </div>
        </form>
      </div>
    </div>
  );
}
