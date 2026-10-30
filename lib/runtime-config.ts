export function bootstrapAdminEmails(): Set<string> {
  return new Set((process.env.BOOTSTRAP_ADMIN_EMAILS ?? "").split(",")
    .map((email) => email.trim().toLowerCase())
    .filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)));
}

export function demoEventsEnabled(): boolean {
  return process.env.INCLUDE_DEMO_EVENTS === "true";
}
