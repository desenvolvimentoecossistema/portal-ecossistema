"use client";
import {usePathname} from 'next/navigation';
import {portalLegalFooterHTML,legalDocumentVersion} from '@/lib/portal-legal';
export function PortalLegalFooter(){
 const path=usePathname()||'/';
 if(path.startsWith('/auth/')||path==='/login')return null;
 return <div dangerouslySetInnerHTML={{__html:portalLegalFooterHTML()}}/>;
}
export function LegalFormNotice({action='registration'}:{action?:'registration'|'event'}){
 return <aside className={'legal-form-notice'+(action==='registration'?' sm:col-span-2':'')} aria-label="Termos de Uso e Política de Privacidade">
  <p>{action==='registration'?'Ao se inscrever':'Ao cadastrar ou atualizar uma agenda'}, você concorda com os <a href="/termos-de-uso" target="_blank" rel="noopener">Termos de Uso</a> e declara ter ciência da <a href="/privacidade" target="_blank" rel="noopener">Política de Privacidade</a>.</p>
  <input type="hidden" name="termsVersion" value={legalDocumentVersion}/>
 </aside>;
}
