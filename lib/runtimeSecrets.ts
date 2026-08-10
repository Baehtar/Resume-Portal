// Server-only storage for admin-managed provider credentials.
// Values are encrypted before they are written to Supabase and are never
// returned to the browser.
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const OPENAI_SECRET_NAMES = {
  apiKey: "openai_api_key",
  baseUrl: "openai_api_base",
  model: "openai_model",
} as const;

type OpenAISecretName = typeof OPENAI_SECRET_NAMES[keyof typeof OPENAI_SECRET_NAMES];

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function encryptionKey(): Buffer {
  const secret = process.env.API_KEY_ENCRYPTION_SECRET;
  if (!secret) {
    throw new Error("API_KEY_ENCRYPTION_SECRET is not configured.");
  }
  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptOpenAISetting(value: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv, authTag, encrypted].map((part) => part.toString("base64url")).join(".");
}

function decryptOpenAISetting(value: string): string {
  const [ivText, authTagText, encryptedText] = value.split(".");
  if (!ivText || !authTagText || !encryptedText) throw new Error("Invalid encrypted key.");
  const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(ivText, "base64url"));
  decipher.setAuthTag(Buffer.from(authTagText, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedText, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

async function getStoredOpenAISetting(keyName: OpenAISecretName): Promise<{ value: string; updatedAt: string | null } | null> {
  const client = serviceClient();
  if (!client) return null;

  const { data, error } = await client
    .from("app_secrets")
    .select("encrypted_value, updated_at")
    .eq("key_name", keyName)
    .maybeSingle();
  if (error || !data?.encrypted_value) return null;

  try {
    return { value: decryptOpenAISetting(data.encrypted_value), updatedAt: data.updated_at || null };
  } catch {
    return null;
  }
}

async function saveStoredOpenAISetting(keyName: OpenAISecretName, value: string, updatedBy: string): Promise<void> {
  const client = serviceClient();
  if (!client) throw new Error("Supabase service role is not configured.");

  const { error } = await client.from("app_secrets").upsert(
    {
      key_name: keyName,
      encrypted_value: encryptOpenAISetting(value),
      updated_by: updatedBy,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key_name" }
  );
  if (error) throw new Error(error.message);
}

async function clearStoredOpenAISetting(keyName: OpenAISecretName): Promise<void> {
  const client = serviceClient();
  if (!client) throw new Error("Supabase service role is not configured.");
  const { error } = await client.from("app_secrets").delete().eq("key_name", keyName);
  if (error) throw new Error(error.message);
}

export async function getStoredOpenAIConfig(): Promise<{
  apiKey: { value: string; updatedAt: string | null } | null;
  baseUrl: { value: string; updatedAt: string | null } | null;
  model: { value: string; updatedAt: string | null } | null;
}> {
  const [apiKey, baseUrl, model] = await Promise.all([
    getStoredOpenAISetting(OPENAI_SECRET_NAMES.apiKey),
    getStoredOpenAISetting(OPENAI_SECRET_NAMES.baseUrl),
    getStoredOpenAISetting(OPENAI_SECRET_NAMES.model),
  ]);
  return { apiKey, baseUrl, model };
}

export async function saveStoredOpenAIConfig(input: {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  updatedBy: string;
}): Promise<void> {
  const writes: Promise<void>[] = [];
  if (input.apiKey !== undefined) {
    const value = input.apiKey.trim();
    writes.push(value ? saveStoredOpenAISetting(OPENAI_SECRET_NAMES.apiKey, value, input.updatedBy) : clearStoredOpenAISetting(OPENAI_SECRET_NAMES.apiKey));
  }
  if (input.baseUrl !== undefined) {
    const value = input.baseUrl.trim();
    writes.push(value ? saveStoredOpenAISetting(OPENAI_SECRET_NAMES.baseUrl, value, input.updatedBy) : clearStoredOpenAISetting(OPENAI_SECRET_NAMES.baseUrl));
  }
  if (input.model !== undefined) {
    const value = input.model.trim();
    writes.push(value ? saveStoredOpenAISetting(OPENAI_SECRET_NAMES.model, value, input.updatedBy) : clearStoredOpenAISetting(OPENAI_SECRET_NAMES.model));
  }
  await Promise.all(writes);
}

export async function getRuntimeOpenAIConfig(): Promise<{
  apiKey: string | undefined;
  baseUrl: string;
  model: string;
}> {
  const stored = await getStoredOpenAIConfig();
  return {
    apiKey: stored.apiKey?.value || process.env.OPENAI_API_KEY || undefined,
    baseUrl: stored.baseUrl?.value || process.env.OPENAI_API_BASE || "https://api.openai.com/v1",
    model: stored.model?.value || process.env.OPENAI_MODEL || "gpt-3.5-turbo",
  };
}
