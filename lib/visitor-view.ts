export const VISITOR_VIEW_COOKIE = "portal_visitor_view";

// This preference only reduces permissions. Bind it to the current account so
// another person using the same browser does not inherit the selected view.
export async function visitorViewKey(userId: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("portal-visitor-view:" + userId));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}

export async function isVisitorView(value: string | undefined, userId: string): Promise<boolean> {
  return Boolean(value && value === await visitorViewKey(userId));
}
