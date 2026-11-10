import {redirect} from 'next/navigation';
import {requireSiteUser} from '@/app/site-auth';
import {getAppRole} from '@/app/authz';
import {HubLayout,PortalHero} from '@/components/hub-layout';
import LegalAcceptanceRecords from '@/components/legal-acceptance-records';
export const dynamic='force-dynamic';
export const metadata={title:'Registros de aceite | Portal do Ecossistema'};
export default async function Page(){
 const user=await requireSiteUser('/administracao/aceites');if(await getAppRole(user)!=='admin')redirect('/');
 return <HubLayout hero={<PortalHero title="Registros de aceite" description="Consulte a versão dos documentos apresentada em cada aceite." back={{href:'/imersoes',label:'Imersões em Eventos'}}/>}><LegalAcceptanceRecords/></HubLayout>;
}
