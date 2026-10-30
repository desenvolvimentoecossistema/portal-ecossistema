import { isSameOriginMutation } from "@/lib/request-origin";
import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { bootstrapAdminEmails, getAppRole } from "@/app/authz";
import { getSiteUser } from "@/app/site-auth";
import { getDb } from "@/db";
import { appUserRoles } from "@/db/schema";

export const dynamic = "force-dynamic";

const assignmentSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(160),
  displayName: z.string().trim().max(100).default(""),
  role: z.literal("admin"),
});

async function requireAdmin() {
  const user = await getSiteUser();
  if (!user) return { error: NextResponse.json({ error: "Faça login para gerenciar permissões." }, { status: 401 }) };
  if (await getAppRole(user) !== "admin") {
    return { error: NextResponse.json({ error: "Somente administradores podem gerenciar permissões." }, { status: 403 }) };
  }
  return { user };
}

export async function GET() {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;

    const assignments = await getDb()
      .select()
      .from(appUserRoles)
      .orderBy(asc(appUserRoles.email));
    const bootstrap = [...bootstrapAdminEmails()].map((email) => ({
      email,
      displayName: "Administrador principal",
      role: "admin" as const,
      protected: true,
    }));
    return NextResponse.json([
      ...bootstrap,
      ...assignments
        .filter((assignment) => assignment.role === "admin" && !bootstrapAdminEmails().has(assignment.email))
        .map((assignment) => ({ ...assignment, protected: false })),
    ]);
  } catch (error) {
    console.error("Unable to load user roles", error);
    return NextResponse.json({ error: "Não foi possível carregar as permissões agora." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: "Origem da solicitação inválida." }, { status: 403 });
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;
    const assignment = assignmentSchema.parse(await request.json());
    if (bootstrapAdminEmails().has(assignment.email)) {
      return NextResponse.json({ error: "A permissão do administrador principal não pode ser alterada." }, { status: 400 });
    }

    const now = new Date().toISOString();
    await getDb().insert(appUserRoles).values({
      ...assignment,
      createdAt: now,
      updatedAt: now,
    }).onConflictDoUpdate({
      target: appUserRoles.email,
      set: {
        displayName: assignment.displayName,
        role: assignment.role,
        updatedAt: now,
      },
    });
    return NextResponse.json({ ...assignment, protected: false });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Informe um e-mail válido para o administrador." }, { status: 400 });
    }
    console.error("Unable to save user role", error);
    return NextResponse.json({ error: "Não foi possível salvar a permissão agora." }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: "Origem da solicitação inválida." }, { status: 403 });
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;
    const { email } = assignmentSchema.pick({ email: true }).parse(await request.json());
    if (bootstrapAdminEmails().has(email)) {
      return NextResponse.json({ error: "O administrador principal não pode ser removido." }, { status: 400 });
    }
    await getDb().delete(appUserRoles).where(eq(appUserRoles.email, email));
    return NextResponse.json({ status: "deleted" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 });
    }
    console.error("Unable to delete user role", error);
    return NextResponse.json({ error: "Não foi possível remover a permissão agora." }, { status: 503 });
  }
}
