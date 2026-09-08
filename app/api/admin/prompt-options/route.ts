// app/api/admin/prompt-options/route.ts
// Demo build: serves bundled default prompt templates only.
import { NextResponse } from "next/server";
import { DEFAULT_PROMPT_TEMPLATES, PROMPT_LABELS } from "@/lib/promptTemplates";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    prompts: { ...DEFAULT_PROMPT_TEMPLATES },
    labels: PROMPT_LABELS,
  });
}

export async function POST() {
  return NextResponse.json(
    { error: "Admin prompt management is disabled in this demo build." },
    { status: 403 }
  );
}
