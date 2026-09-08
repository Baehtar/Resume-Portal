// components/Auth.tsx - Disabled in demo build
// This component is not rendered in the demo. It exists only to prevent
// import errors from other files that may reference it.
"use client";

import type { AppUser } from "@/lib/types";

interface Props {
  onLogin: (user: AppUser) => void;
}

export default function Auth({ onLogin: _onLogin }: Props) {
  return (
    <div className="auth-wrap">
      <div style={{ display: "flex", justifyContent: "center", marginTop: 30, marginBottom: 8 }}>
        <img
          src="/consoleflare-logo.svg"
          alt="ConsoleFlare"
          style={{ height: 56, width: "auto" }}
        />
      </div>
      <p className="center muted">
        Authentication is disabled in this demo build.
      </p>
      <div className="panel">
        <p>This is a portfolio showcase — no sign-in is required.</p>
      </div>
    </div>
  );
}
