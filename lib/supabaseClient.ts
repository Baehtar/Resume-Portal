// lib/supabaseClient.ts - Demo-only compatibility shim.
"use client";

import type { Resume } from "./types";

const DEMO_RESUME_KEY = "resume-portal-demo-resume";
const DEMO_TOKEN = "demo-token";

interface AuthResult {
  user?: unknown;
  session?: unknown;
  error: string | null;
  email_verified?: boolean;
  confirmation_required?: boolean;
}

function demoUnavailable(message = "This demo build does not connect to Supabase."): AuthResult {
  return { session: null, user: null, error: message };
}

export function getSupabaseClient(): any | null {
  return null;
}

export function isConfigured(): boolean {
  return false;
}

export async function signUpStudent(): Promise<AuthResult> {
  return demoUnavailable("Account creation is disabled in this demo build.");
}

export async function signInStudent(): Promise<AuthResult> {
  return demoUnavailable("Sign in is disabled in this demo build.");
}

export async function resetPasswordStudent(): Promise<{ ok: boolean; error: string | null }> {
  return { ok: false, error: "Password reset is disabled in this demo build." };
}

export async function updatePasswordAfterRecovery(): Promise<{ ok: boolean; error: string | null }> {
  return { ok: false, error: "Password reset is disabled in this demo build." };
}

export async function signOutStudent(): Promise<void> {
  return;
}

export async function getAccessToken(): Promise<string | null> {
  return DEMO_TOKEN;
}

export async function saveResume(
  _userId: string,
  resumeData: Resume
): Promise<{ ok: boolean; error: string | null }> {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DEMO_RESUME_KEY, JSON.stringify(resumeData));
    }
    return { ok: true, error: null };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function loadResume(): Promise<Resume | null> {
  try {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(DEMO_RESUME_KEY);
    return raw ? (JSON.parse(raw) as Resume) : null;
  } catch {
    return null;
  }
}

export async function getUserRole(): Promise<string> {
  return "student";
}

export interface ProfileRow {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  qualification?: string;
  course?: string;
  domain?: string;
  batch?: string;
  role?: string;
  has_resume?: boolean;
}

export interface StudentWithResume extends ProfileRow {
  experience_count: number;
  resume: Resume | null;
}

export interface ShortlistedResume {
  student_id: string;
  shortlisted_at: string;
  student: StudentWithResume | null;
}

export function fetchShortlistedResumes(): Promise<{
  ok: boolean;
  error: string | null;
  items: ShortlistedResume[];
}> {
  return Promise.resolve({ ok: true, error: null, items: [] });
}

export function shortlistResume(_studentId?: string): Promise<{ ok: boolean; error: string | null }> {
  return Promise.resolve({ ok: false, error: "Shortlisting is disabled in this demo build." });
}

export function removeShortlistedResume(_studentId?: string): Promise<{ ok: boolean; error: string | null }> {
  return Promise.resolve({ ok: false, error: "Shortlisting is disabled in this demo build." });
}

export async function fetchAllStudents(): Promise<{ students: ProfileRow[]; error: string | null }> {
  return { students: [], error: null };
}

export async function fetchAllStudentsWithResumes(): Promise<{
  students: StudentWithResume[];
  error: string | null;
}> {
  return { students: [], error: null };
}

export async function saveResumeForUser(_userId?: string, _resumeData?: Resume): Promise<{ ok: boolean; error: string | null }> {
  return { ok: false, error: "Admin resume saving is disabled in this demo build." };
}
