"use client";
import { useEffect } from "react";

export default function SessionGuard() {
  useEffect(() => {
    let active = true, checking = false;
    const check = async () => {
      if (!active || checking || document.visibilityState === "hidden") return;
      checking = true;
      try {
        const response = await fetch("/api/session", { cache: "no-store", credentials: "same-origin", signal: AbortSignal.timeout(5000) });
        if (active && response.status === 401) location.replace("/login?sso=skip");
      } catch { /* A temporary network failure does not end a valid session. */ }
      finally { checking = false; }
    };
    window.addEventListener("focus", check);
    window.addEventListener("pageshow", check);
    document.addEventListener("visibilitychange", check);
    const timer = window.setInterval(check, 15000);
    return () => {
      active = false; window.clearInterval(timer);
      window.removeEventListener("focus", check);
      window.removeEventListener("pageshow", check);
      document.removeEventListener("visibilitychange", check);
    };
  }, []);
  return null;
}
