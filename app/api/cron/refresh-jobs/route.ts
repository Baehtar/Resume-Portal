// app/api/cron/refresh-jobs/route.ts
// Demo build: cron is disabled — returns a static acknowledgement.
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    demo: true,
    message: "Cron job is disabled in this demo build. Job listings are served from bundled mock data.",
    ran_at: new Date().toISOString(),
  });
}
