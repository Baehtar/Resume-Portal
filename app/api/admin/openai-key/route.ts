import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromAuthHeader } from "@/lib/supabaseServer";
import {
  getStoredOpenAIConfig,
  saveStoredOpenAIConfig,
} from "@/lib/runtimeSecrets";

export const runtime = "nodejs";

function anonClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

async function getAdmin(request: Request) {
  const user = await getUserFromAuthHeader(request);
  if (!user) return null;
  const { data } = await anonClient().from("profiles").select("role").eq("id", user.id).single();
  return data?.role === "admin" ? user : null;
}

export async function GET(request: Request) {
  const admin = await getAdmin(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const stored = await getStoredOpenAIConfig();
  return NextResponse.json({
    key: {
      configured: Boolean(stored.apiKey?.value || process.env.OPENAI_API_KEY),
      source: stored.apiKey?.value ? "admin" : process.env.OPENAI_API_KEY ? "vercel" : "missing",
      updated_at: stored.apiKey?.updatedAt || null,
    },
    base_url: {
      value: stored.baseUrl?.value || process.env.OPENAI_API_BASE || "https://api.openai.com/v1",
      source: stored.baseUrl?.value ? "admin" : process.env.OPENAI_API_BASE ? "vercel" : "default",
      updated_at: stored.baseUrl?.updatedAt || null,
    },
    model: {
      value: stored.model?.value || process.env.OPENAI_MODEL || "gpt-3.5-turbo",
      source: stored.model?.value ? "admin" : process.env.OPENAI_MODEL ? "vercel" : "default",
      updated_at: stored.model?.updatedAt || null,
    },
  });
}

export async function POST(request: Request) {
  const admin = await getAdmin(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json() as {
    api_key?: unknown;
    clear_api_key?: unknown;
    base_url?: unknown;
    model?: unknown;
  };
  const apiKey = typeof body.api_key === "string" ? body.api_key.trim() : undefined;
  const clearApiKey = body.clear_api_key === true;
  const baseUrl = typeof body.base_url === "string" ? body.base_url.trim() : undefined;
  const model = typeof body.model === "string" ? body.model.trim() : undefined;
  if (apiKey !== undefined && apiKey.length > 500) return NextResponse.json({ error: "The API key is too long." }, { status: 400 });
  if (baseUrl !== undefined && baseUrl && !/^https?:\/\//i.test(baseUrl)) {
    return NextResponse.json({ error: "Base URL must start with http:// or https://." }, { status: 400 });
  }
  if (baseUrl !== undefined && baseUrl.length > 300) return NextResponse.json({ error: "The base URL is too long." }, { status: 400 });
  if (model !== undefined && model.length > 150) return NextResponse.json({ error: "The model name is too long." }, { status: 400 });

  try {
    await saveStoredOpenAIConfig({
      apiKey: clearApiKey ? "" : apiKey,
      baseUrl,
      model,
      updatedBy: admin.id,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save the OpenAI configuration." },
      { status: 500 }
    );
  }
}
