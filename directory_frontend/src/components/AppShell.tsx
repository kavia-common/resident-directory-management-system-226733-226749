"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useMemo, useState } from "react";
import { useAuth } from "./AuthProvider";

type NavItem = {
  href: string;
  label: string;
  adminOnly?: boolean;
};

function cx(...parts: Array<string | false | undefined | null>) {
  return parts.filter(Boolean).join(" ");
}

// PUBLIC_INTERFACE
export function AppShell({ children }: { children: React.ReactNode }) {
  /** Responsive dashboard shell with sidebar navigation. */
  const pathname = usePathname();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: NavItem[] = useMemo(
    () => [
      { href: "/residents", label: "Residents" },
      { href: "/admin", label: "Admin", adminOnly: true },
      { href: "/audit", label: "Audit Log", adminOnly: true },
      { href: "/import-export", label: "Import/Export", adminOnly: true },
      { href: "/login", label: isAuthenticated ? "Switch User" : "Login" },
    ],
    [isAuthenticated],
  );

  const visibleNav = navItems.filter((i) => (i.adminOnly ? isAdmin : true));

  return (
    <div className="app-shell">
      <aside className="p-4 hidden md:block">
        <div className="surface p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-lg font-black tracking-tight">Resident Directory</div>
              <div className="text-sm text-slate-600 mt-1">
                {isAuthenticated ? (
                  <>
                    Signed in as <span className="font-bold">{user?.username}</span>{" "}
                    <span className="kbd ml-2">{user?.role}</span>
                  </>
                ) : (
                  <>Not signed in</>
                )}
              </div>
            </div>
          </div>

          <nav className="mt-4 flex flex-col gap-2">
            {visibleNav.map((item) => {
              const active = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cx(
                    "btn w-full justify-start",
                    active && "btnPrimary",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {isAuthenticated && (
            <div className="mt-4 pt-4 border-t-2 border-slate-900">
              <button className="btn w-full btnDanger" onClick={logout}>
                Logout
              </button>
            </div>
          )}

          <div className="mt-4 text-xs text-slate-600">
            Tip: Use <span className="kbd">Search</span> on Residents for quick filtering.
          </div>
        </div>
      </aside>

      {/* Mobile header + drawer */}
      <div className="md:hidden p-3 sticky top-0 bg-[var(--c-bg)] z-10">
        <div className="surface p-3 flex items-center justify-between gap-2">
          <button className="btn" onClick={() => setMobileOpen((v) => !v)} aria-expanded={mobileOpen}>
            Menu
          </button>
          <div className="text-sm font-black">Resident Directory</div>
          <div className="text-xs text-slate-600">{user?.role ? <span className="kbd">{user.role}</span> : null}</div>
        </div>

        {mobileOpen && (
          <div className="surface p-3 mt-3">
            <nav className="flex flex-col gap-2">
              {visibleNav.map((item) => {
                const active = pathname === item.href || pathname?.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cx("btn w-full justify-start", active && "btnPrimary")}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            {isAuthenticated && (
              <div className="mt-3">
                <button className="btn w-full btnDanger" onClick={logout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <main className="p-4 md:p-6">{children}</main>
    </div>
  );
}
