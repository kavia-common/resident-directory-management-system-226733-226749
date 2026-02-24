import { NextResponse } from "next/server";

// PUBLIC_INTERFACE
export async function GET() {
  /** Healthcheck endpoint for container readiness probes. */
  return NextResponse.json({ ok: true }, { status: 200 });
}
