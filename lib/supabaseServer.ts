// lib/supabaseServer.ts - Demo-only auth compatibility shim.
import type { AppUser } from "./types";

export async function getUserFromAuthHeader(_request?: Request): Promise<AppUser | null> {
  return {
    id: "demo-user",
    email: "demo@example.com",
    user_metadata: {
      name: "Demo Student",
      batch: "Demo Batch",
      course: "Career Readiness Demo",
    },
  };
}
