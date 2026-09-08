// app/api/admin/openai-key/route.ts
// Demo build: reports whether OPENAI_API_KEY is set via env vars only.
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    key: {
      configured: Boolean(process.env.OPENAI_API_KEY),
      source: process.env.OPENAI_API_KEY ? "vercel" : "missing",
      updated_at: null,
    },
    base_url: {
      value: process.env.OPENAI_API_BASE || "https://api.openai.com/v1",
      source: process.env.OPENAI_API_BASE ? "vercel" : "default",
      updated_at: null,
    },
    model: {
      value: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
      source: process.env.OPENAI_MODEL ? "vercel" : "default",
      updated_at: null,
    },
  });
}

export async function POST() {
  return NextResponse.json(
    { error: "Admin OpenAI key management is disabled in this demo build." },
    { status: 403 }
  );
}
