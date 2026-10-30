"use client";

import { useEffect } from "react";

export function LoginRetry() {
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.pathname !== "/login" || url.searchParams.get("sso") !== "skip") return;
    // Skip automatic SSO for this arrival only. A reload may find a new peer session.
    url.searchParams.delete("sso");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  }, []);
  return null;
}
