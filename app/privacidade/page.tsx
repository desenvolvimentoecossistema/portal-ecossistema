import {requireSiteUser} from '@/app/site-auth';
import {LegalDocument} from '@/components/legal-document';
export const dynamic='force-dynamic';
export const metadata={title:'Política de Privacidade | Portal do Ecossistema'};
export default async function Privacy(){await requireSiteUser('/privacidade');return <LegalDocument index={1}/>;}
