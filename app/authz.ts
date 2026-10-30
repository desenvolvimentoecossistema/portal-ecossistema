import type { SiteUser } from "@/app/site-auth";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { appUserRoles } from "@/db/schema";
import { canUseEmailPermissions } from "@/lib/event-ownership";
import { bootstrapAdminEmails } from "@/lib/runtime-config";

export { bootstrapAdminEmails } from "@/lib/runtime-config";

export type AppRole = "admin" | "user";

export async function getAppRole(user: Pick<SiteUser, "email" | "userId">): Promise<AppRole> {
  if (!canUseEmailPermissions(user)) return "user";
  const email = user.email.trim().toLowerCase();
  if (bootstrapAdminEmails().has(email)) return "admin";

  try {
    const [assignment] = await getDb()
      .select({ role: appUserRoles.role })
      .from(appUserRoles)
      .where(eq(appUserRoles.email, email))
      .limit(1);
    return assignment?.role === "admin" ? "admin" : "user";
  } catch (error) {
    console.error("Unable to resolve app role", error);
    return "user";
  }
}
