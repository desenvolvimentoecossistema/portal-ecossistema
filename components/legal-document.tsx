import documents from '@/lib/legal-documents.json';
import {HubLayout,PortalHero} from '@/components/hub-layout';
import {legalReviewNotice} from '@/lib/portal-legal';
export function LegalDocument({index}:{index:0|1}){
 const doc=documents[index];
 return <HubLayout hero={<PortalHero title={doc.title}/>}>
  <article className="legal-document">
   <aside className="legal-review-banner"><strong>Documento em revisão</strong><p>{legalReviewNotice}</p></aside>
   {doc.blocks.map((block,i)=>{
    const content=block.runs.map((run,j)=>run.href?<a key={j} href={run.href} target="_blank" rel="noopener noreferrer">{run.text}</a>:run.text);
    if(block.kind==='HEADING_1')return <h2 key={i}>{content}</h2>;
    if(block.kind==='HEADING_2')return <h3 key={i}>{content}</h3>;
    return <p key={i} className={block.bullet?'legal-bullet':undefined}>{content}</p>;
   })}
  </article>
 </HubLayout>;
}
