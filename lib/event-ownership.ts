export function canUseEmailPermissions(user: { userId: string }): boolean {
  if (!user.userId.startsWith("microsoft:")) return true;
  // Retired Microsoft identities must not inherit permissions through email.
  return false;
}

export function isEventOwner(
  event: { createdByUserId?: string; creatorEmail?: string },
  user: { userId: string; email: string },
) {
  return Boolean(
    (event.createdByUserId && event.createdByUserId === user.userId) ||
    (canUseEmailPermissions(user) && event.creatorEmail && event.creatorEmail.trim().toLowerCase() === user.email.trim().toLowerCase()),
  );
}

export function eventForViewer<T extends { contactName: string; contactEmail: string; creatorEmail?: string; createdByUserId?: string }>(
  event: T,
  user: { userId: string; email: string },
  isAdmin: boolean,
): T {
  if (isAdmin || isEventOwner(event, user)) return event;
  return { ...event, creatorEmail: "" };
}
