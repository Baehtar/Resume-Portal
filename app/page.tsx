// app/page.tsx - Main demo application orchestrator
"use client";

import { useCallback, useEffect, useState } from "react";
import type { AppUser, Resume } from "@/lib/types";
import { getEmptySchema } from "@/lib/resumeTemplates";
import Sidebar from "@/components/Sidebar";
import CVTab from "@/components/CVTab";
import JobsTab from "@/components/JobsTab";
import PrepTab from "@/components/PrepTab";
import { useTheme } from "@/lib/useTheme";
import ThemeToggle from "@/components/ThemeToggle";

type Tab = "cv" | "jobs" | "prep";

const DEMO_USER: AppUser = {
  id: "demo-user",
  email: "demo@example.com",
  user_metadata: {
    name: "Demo Student",
    batch: "Demo Batch",
    course: "Career Readiness Demo",
  },
};

export default function Home() {
  const [resume, setResume] = useState<Resume>(getEmptySchema());
  const [targetRole, setTargetRole] = useState("data_engineer");
  const [activeTab, setActiveTab] = useState<Tab>("cv");
  const [toast, setToast] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  useTheme();

  const notify = useCallback((text: string) => {
    setToast(text);
    setTimeout(() => setToast(null), 2500);
  }, []);

  // Keep Chrome autofill styling from washing out the demo UI.
  useEffect(() => {
    const disableAutofill = () => {
      document.querySelectorAll("input").forEach((el) => {
        if (el.getAttribute("autocomplete") !== "off") {
          el.setAttribute("autocomplete", "off");
        }
      });
    };
    disableAutofill();
    const observer = new MutationObserver(disableAutofill);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const resetDemo = () => {
    setResume(getEmptySchema());
    notify("Demo reset");
  };

  const userName = DEMO_USER.user_metadata?.name || "Student";

  return (
    <div className="app-shell">
      <div
        style={{
          position: "fixed",
          top: 14,
          right: 20,
          zIndex: 200,
          display: "flex",
          alignItems: "center",
        }}
      >
        <ThemeToggle />
      </div>

      {!sidebarOpen && (
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(true)}
          title="Open sidebar"
          style={{ position: "fixed", top: 12, left: 12, zIndex: 100 }}
        >
          Open
        </button>
      )}

      <Sidebar
        className={sidebarOpen ? "" : "collapsed"}
        onToggle={() => setSidebarOpen(false)}
        user={DEMO_USER}
        resume={resume}
        targetRole={targetRole}
        onTargetRoleChange={setTargetRole}
        onClear={() => {
          setResume(getEmptySchema());
          notify("Resume cleared");
        }}
        onSignOut={resetDemo}
        notify={notify}
      />

      <main className="main">
        <div className="student-dashboard-header">
          <div>
            <p className="caption" style={{ margin: "0 0 4px" }}>
              Career Readiness Dashboard
            </p>
            <h1 style={{ margin: 0, color: "var(--premium-white)", fontSize: "1.35rem" }}>
              Welcome, {userName}
            </h1>
          </div>
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === "cv" ? "active" : ""}`}
            onClick={() => setActiveTab("cv")}
          >
            Resume Builder
          </button>
          <button
            className={`tab ${activeTab === "jobs" ? "active" : ""}`}
            onClick={() => setActiveTab("jobs")}
          >
            Job Listings
          </button>
          <button
            className={`tab ${activeTab === "prep" ? "active" : ""}`}
            onClick={() => setActiveTab("prep")}
          >
            Interview Prep
          </button>
        </div>

        {activeTab === "cv" && (
          <CVTab
            resume={resume}
            onResumeChange={setResume}
            targetRole={targetRole}
            notify={notify}
          />
        )}
        {activeTab === "jobs" && <JobsTab />}
        {activeTab === "prep" && <PrepTab resume={resume} targetRole={targetRole} />}
      </main>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
