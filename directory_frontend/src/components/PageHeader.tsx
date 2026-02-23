import React from "react";

// PUBLIC_INTERFACE
export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  /** Standard dashboard page header. */
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">{title}</h1>
        {subtitle ? <p className="text-slate-600 mt-1">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
