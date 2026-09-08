// app/api/admin/signup-options/route.ts
// Demo build: returns bundled batch/course options, no Supabase.
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const DEMO_OPTIONS: Record<string, string[]> = {
  batches: [
    "Data Science Fellowship - Jan 2026",
    "Data Science Fellowship - Mar 2026",
    "Data Engineering Bootcamp - Jan 2026",
    "Data Engineering Bootcamp - Mar 2026",
    "Generative AI Specialist - Feb 2026",
  ],
  courses: ["Data Engineer", "Data Analyst"],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "batches";
  return NextResponse.json({ items: DEMO_OPTIONS[category] || [] });
}

export async function POST() {
  return NextResponse.json(
    { error: "Admin writes are disabled in this demo build." },
    { status: 403 }
  );
}
