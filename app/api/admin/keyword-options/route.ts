// app/api/admin/keyword-options/route.ts
// Demo build: serves keyword options from the bundled role_keywords.json file.
import { NextResponse } from "next/server";
import { getKeywordOptions, getSkillOptions } from "@/lib/roleKeywords";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role") || "data_engineer";

  return NextResponse.json({
    tools: getKeywordOptions(role),
    skills: getSkillOptions(role),
  });
}

export async function POST() {
  return NextResponse.json(
    { error: "Admin keyword management is disabled in this demo build." },
    { status: 403 }
  );
}
