"use client";
import {useEffect,useRef,useState} from 'react';
import {FileText,ShieldCheck,ChevronRight} from 'lucide-react';
import {LegalDocumentBody} from '@/components/legal-document-body';
import {legalDocumentVersion,legalDocumentUpdatedAt} from '@/lib/portal-legal';
export function PortalConsentGate({preview,returnTo}:{preview:boolean;returnTo:string}){
 const dialog=useRef<HTMLDialogElement>(null),reader=useRef<HTMLDivElement>(null);
 const [document,setDocument]=useState<0|1|null>(null),[read,setRead]=useState([false,false]),[terms,setTerms]=useState(false),[privacy,setPrivacy]=useState(false),[saving,setSaving]=useState(false),[error,setError]=useState('');
 useEffect(()=>{dialog.current?.showModal();},[]);
 const checkEnd=()=>{const el=reader.current;if(document!==null&&el&&el.scrollHeight-el.clientHeight-el.scrollTop<12)setRead(previous=>previous.map((value,index)=>value||index===document));};
 useEffect(()=>{if(reader.current)reader.current.scrollTop=0;checkEnd();},[document]);
 async function submit(event:React.FormEvent){
  event.preventDefault();if(!terms||!privacy||!read.every(Boolean))return;
  if(preview){location.assign(returnTo);return;}
  setSaving(true);setError('');
  try{const response=await fetch('/api/legal-notice',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({termsAccepted:terms,privacyAcknowledged:privacy,version:legalDocumentVersion})});const result=await response.json() as {error?:string};if(!response.ok)throw Error(result.error||'Não foi possível registrar o aceite.');location.replace(returnTo);}
  catch(reason){setError(reason instanceof Error?reason.message:'Não foi possível registrar o aceite.');setSaving(false);}
 }
 return <dialog ref={dialog} className="portal-consent-dialog" aria-labelledby="consent-title" onCancel={event=>{event.preventDefault();if(preview)location.assign(returnTo);}}>
  {preview&&<p className="consent-preview">Prévia — nenhuma concordância será registrada.</p>}
  <h1 id="consent-title">Antes de acessar o portal</h1>
  {document===null?<form onSubmit={submit}>
   <div className="consent-document-links">
    <div className="consent-document" role="group" aria-labelledby="consent-terms">
     <button id="consent-terms" type="button" onClick={()=>setDocument(0)}><FileText className="consent-document-icon" aria-hidden="true"/><span>Termos de Uso</span><ChevronRight className="consent-document-arrow" aria-hidden="true"/></button>
     <p>Regras e responsabilidades ao utilizar o portal.</p>
     <label><input type="checkbox" required aria-label="Li e aceito os Termos de Uso." checked={terms} disabled={!read[0]} onChange={event=>setTerms(event.target.checked)}/><span>Li e aceito.</span></label>
    </div>
    <div className="consent-document" role="group" aria-labelledby="consent-privacy">
     <button id="consent-privacy" type="button" onClick={()=>setDocument(1)}><ShieldCheck className="consent-document-icon" aria-hidden="true"/><span>Aviso de Privacidade</span><ChevronRight className="consent-document-arrow" aria-hidden="true"/></button>
     <p>Como seus dados são utilizados e protegidos.</p>
     <label><input type="checkbox" required aria-label="Li e estou ciente do Aviso de Privacidade." checked={privacy} disabled={!read[1]} onChange={event=>setPrivacy(event.target.checked)}/><span>Li e estou ciente.</span></label>
    </div>
   </div>
   {error&&<p role="alert">{error}</p>}
   <button className="consent-primary" type="submit" disabled={!read.every(Boolean)||!terms||!privacy||saving}>{saving?'Registrando…':preview?'Concluir prévia':'Aceitar e continuar'}</button>
   {preview&&<button className="consent-secondary" type="button" onClick={()=>location.assign(returnTo)}>Fechar prévia</button>}
  </form>:<section className="consent-reader-section">
   <h2>{document===0?'Termos de Uso':'Aviso de Privacidade'}</h2>
   <p className="consent-document-date">Atualizado em {legalDocumentUpdatedAt}.</p>
   <div className="legal-document consent-reader" ref={reader} onScroll={checkEnd} tabIndex={0}><LegalDocumentBody index={document}/></div>
   <button className="consent-primary" type="button" onClick={()=>setDocument(null)}>{read[document]?'Voltar às confirmações':'Voltar'}</button>
  </section>}
 </dialog>;
}
