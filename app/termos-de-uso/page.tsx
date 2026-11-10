import {requireSiteUser} from '@/app/site-auth';
import {LegalDocument} from '@/components/legal-document';
export const dynamic='force-dynamic';
export const metadata={title:'Termos de Uso | Portal do Ecossistema'};
export default async function Terms(){await requireSiteUser('/termos-de-uso');return <LegalDocument index={0}/>;}
