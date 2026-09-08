// app/api/admin/shortlisted-resumes/route.ts
// Demo build: shortlisting is disabled.
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ items: [] });
}

export async function POST() {
  return NextResponse.json(
    { error: "Shortlisting is disabled in this demo build." },
    { status: 403 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Shortlisting is disabled in this demo build." },
    { status: 403 }
  );
}
