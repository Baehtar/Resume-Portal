import { DEFAULT_PROMPT_TEMPLATES, renderPromptTemplate, type PromptKey } from "./promptTemplates";

export function isLegacySummaryPrompt(key: PromptKey, value: string): boolean {
  if (key !== "summary") return false;
  const lower = value.toLowerCase();
  return lower.includes("exactly 2-sentence") ||
    lower.includes("exactly two sentences") ||
    lower.includes("must consist of exactly two sentences") ||
    (lower.includes("keep it to 2-3 concise sentences") && !lower.includes("implied first person")) ||
    lower.includes("produce exactly 3 bullet points") ||
    (lower.includes("bullet 1: who they are") && lower.includes("bullet 3: key skill set"));
}

export async function getConfiguredPrompt(
  _key: PromptKey,
  fallback: string,
  values: Record<string, string> = {}
): Promise<string> {
  return renderPromptTemplate(fallback, values);
}

export { DEFAULT_PROMPT_TEMPLATES };
