import EcosystemApp from "@/components/ecosystem-app";
import { requireSiteUser } from "@/app/site-auth";
import { getAppRole } from "@/app/authz";
import SessionGuard from "@/components/session-guard";
import {CORE_ORGANIZATIONS} from '@/lib/organization-brand';

export const dynamic = "force-dynamic";
export const metadata = { title: "Imersões em Eventos | Portal do Ecossistema" };

export default async function Home({searchParams}:{searchParams:Promise<{organizacao?:string}>}) {
  const user = await requireSiteUser("/imersoes");
  const role = await getAppRole(user);
  const {organizacao}=await searchParams;
  const initialQuery=CORE_ORGANIZATIONS.find(org=>org===organizacao)||'';

  return (
    <>
    <SessionGuard />
    <EcosystemApp
      initialQuery={initialQuery}
      user={{
        userId: user.userId,
        displayName: user.displayName,
        email: user.email,
        role,
      }}
    />
    </>
  );
}
