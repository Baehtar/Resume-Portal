// app/api/jobs/route.ts - Demo job listings only.
import { NextResponse } from "next/server";
import { MOCK_JOB_LISTINGS } from "@/lib/jobDb";
import { sortJobsByNewest } from "@/lib/jobSort";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const fetchedAt = new Date().toISOString();
  const jobs = MOCK_JOB_LISTINGS.map((job) => ({
    ...job,
    id: String(job.id),
    fetched_at: fetchedAt,
  }));

  return NextResponse.json({
    jobs: sortJobsByNewest(jobs).slice(0, 50),
    error: null,
    source: "demo",
  });
}
