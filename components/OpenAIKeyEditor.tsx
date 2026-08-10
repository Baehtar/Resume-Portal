"use client";

import { useEffect, useState } from "react";
import { getAccessToken } from "@/lib/supabaseClient";

type KeyStatus = {
  key: {
    configured: boolean;
    source: "admin" | "vercel" | "missing";
    updated_at: string | null;
  };
  base_url: {
    value: string;
    source: "admin" | "vercel" | "default";
    updated_at: string | null;
  };
  model: {
    value: string;
    source: "admin" | "vercel" | "default";
    updated_at: string | null;
  };
};

export default function OpenAIKeyEditor() {
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [model, setModel] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<KeyStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessToken();
        const response = await fetch("/api/admin/openai-key", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await response.json();
        if (!response.ok) throw new Error(json.error || "Could not load API key status.");
        setStatus(json);
        setBaseUrl(json.base_url?.value || "");
        setModel(json.model?.value || "");
      } catch (error) {
        setMessage({ kind: "error", text: error instanceof Error ? error.message : "Could not load API key status." });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const token = await getAccessToken();
      const response = await fetch("/api/admin/openai-key", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...(apiKey.trim() ? { api_key: apiKey } : {}),
          base_url: baseUrl,
          model,
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Could not save the OpenAI configuration.");
      setApiKey("");
      setShowKey(false);
      setMessage({ kind: "success", text: "AI provider settings updated. New generations will use this configuration." });
      const refreshed = await fetch("/api/admin/openai-key", { headers: { Authorization: `Bearer ${token}` } });
      if (refreshed.ok) {
        const refreshedJson = await refreshed.json();
        setStatus(refreshedJson);
        setBaseUrl(refreshedJson.base_url?.value || "");
        setModel(refreshedJson.model?.value || "");
      }
    } catch (error) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Could not save the API key." });
    } finally {
      setSaving(false);
    }
  };

  const clearAdminKey = async () => {
    if (!confirm("Clear the admin-managed API key and fall back to the Vercel key?")) return;
    setSaving(true);
    setMessage(null);
    try {
      const token = await getAccessToken();
      const response = await fetch("/api/admin/openai-key", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ clear_api_key: true }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Could not clear the API key.");
      setApiKey("");
      setShowKey(false);
      setMessage({ kind: "success", text: "Admin key cleared. Generations will use the Vercel environment key." });
      const refreshed = await fetch("/api/admin/openai-key", { headers: { Authorization: `Bearer ${token}` } });
      if (refreshed.ok) setStatus(await refreshed.json());
    } catch (error) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Could not clear the API key." });
    } finally {
      setSaving(false);
    }
  };

  const sourceLabel = (source?: "admin" | "vercel" | "missing" | "default") => {
    if (source === "admin") return "Admin";
    if (source === "vercel") return "Vercel";
    if (source === "default") return "Default";
    return "Missing";
  };

  return (
    <div>
      <h3 style={{ margin: "0 0 4px" }}>OpenAI Provider Settings</h3>
      <p className="caption" style={{ margin: "0 0 16px" }}>
        Set the key, base URL, and model used by resume generation and interview preparation. The current key is never displayed or sent to the browser.
      </p>
      {message && <div className={`alert alert-${message.kind}`} style={{ marginBottom: 12 }}>{message.text}</div>}
      {loading ? <p className="muted"><span className="spinner" />Checking configuration...</p> : (
        <>
          <div className="panel" style={{ padding: 14, marginBottom: 14 }}>
            <div><strong>API key: </strong>{status?.key.source === "admin" ? "Using admin-managed key" : status?.key.source === "vercel" ? "Using Vercel environment key" : "No key configured"}</div>
            <div className="caption" style={{ marginTop: 6 }}>
              Base URL: {status?.base_url.value || "Not set"} ({sourceLabel(status?.base_url.source)})
            </div>
            <div className="caption" style={{ marginTop: 4 }}>
              Model: {status?.model.value || "Not set"} ({sourceLabel(status?.model.source)})
            </div>
            {status?.key.updated_at && <div className="caption" style={{ marginTop: 4 }}>Admin key last updated {new Date(status.key.updated_at).toLocaleString()}</div>}
          </div>
          <label className="field-label" htmlFor="openai-api-key">New OpenAI API key</label>
          <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
            <input
              id="openai-api-key"
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder="Paste a new key to replace the current one"
              autoComplete="off"
              style={{ flex: 1 }}
            />
            <button type="button" onClick={() => setShowKey((current) => !current)}>
              {showKey ? "Hide" : "Show"}
            </button>
          </div>
          <div className="grid-2" style={{ marginTop: 12 }}>
            <div>
              <label className="field-label" htmlFor="openai-base-url">Base URL</label>
              <input
                id="openai-base-url"
                type="url"
                value={baseUrl}
                onChange={(event) => setBaseUrl(event.target.value)}
                placeholder="https://api.openai.com/v1"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="openai-model">Model</label>
              <input
                id="openai-model"
                type="text"
                value={model}
                onChange={(event) => setModel(event.target.value)}
                placeholder="gpt-4o-mini"
                autoComplete="off"
              />
            </div>
          </div>
          <button className="btn-cta full" onClick={save} disabled={saving} style={{ marginTop: 10 }}>
            {saving && <span className="spinner" />} Save AI Settings
          </button>
          {status?.key.source === "admin" && (
            <button type="button" onClick={clearAdminKey} disabled={saving} style={{ marginTop: 8 }}>
              Clear Admin API Key
            </button>
          )}
        </>
      )}
    </div>
  );
}
