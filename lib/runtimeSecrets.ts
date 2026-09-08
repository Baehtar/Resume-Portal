// Demo build: read AI provider settings only from deployment environment vars.

export function encryptOpenAISetting(value: string): string {
  return value;
}

export async function getStoredOpenAIConfig(): Promise<{
  apiKey: { value: string; updatedAt: string | null } | null;
  baseUrl: { value: string; updatedAt: string | null } | null;
  model: { value: string; updatedAt: string | null } | null;
}> {
  return { apiKey: null, baseUrl: null, model: null };
}

export async function saveStoredOpenAIConfig(): Promise<void> {
  throw new Error("Admin-managed OpenAI settings are disabled in this demo build.");
}

export async function getRuntimeOpenAIConfig(): Promise<{
  apiKey: string | undefined;
  baseUrl: string;
  model: string;
}> {
  return {
    apiKey: process.env.OPENAI_API_KEY || undefined,
    baseUrl: process.env.OPENAI_API_BASE || "https://api.openai.com/v1",
    model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
  };
}
