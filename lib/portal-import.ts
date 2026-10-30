export const IMPORT_COLUMNS={
 events:['id','title','organization','type','description','start_date','end_date','registration_deadline','city','state','venue','address','meeting_point','arrival_guidance','transport','accommodation','meals','accessibility','preparation','dress_code','costs','contact_name','contact_email','max_participants','created_at','additional_notes','created_by_user_id','updated_at','start_time','end_time','creator_email'],
 registrations:['id','event_id','name','email','organization','role','accessibility_needs','created_at'],
 app_user_roles:['email','display_name','role','created_at','updated_at'],
 event_drafts:['id','created_by_user_id','payload','source_name','created_at','updated_at'],
 removed_demo_events:['event_id','removed_by_user_id','removed_at'],
} as const;
export function validateImport(payload:unknown,referenceEventIds:readonly string[]=[]){
 if(!payload||typeof payload!=='object'||Array.isArray(payload))throw Error('Formato de importação inválido.');
 const tables=payload as Record<string,unknown>,result:Record<string,Record<string,string|number>[]>={};
 if(Object.keys(tables).some(k=>!Object.hasOwn(IMPORT_COLUMNS,k)))throw Error('Tabela não permitida.');
 for(const [table,columns]of Object.entries(IMPORT_COLUMNS)){
  const rows=tables[table];if(!Array.isArray(rows)||rows.length>1000)throw Error('Conjunto incompleto ou muito grande.');
  result[table]=rows.map(row=>{if(!row||typeof row!=='object'||Array.isArray(row)||Object.keys(row).some(k=>!columns.includes(k as never)))throw Error('Colunas inválidas.');for(const c of columns){const v=row[c];if(!['string','number'].includes(typeof v)||(typeof v==='string'&&v.length>100000)||typeof v==='number'&&!Number.isFinite(v))throw Error('Valor inválido.');}return row;});
 }
 const events=new Set(result.events.map(r=>r.id));if(events.size!==result.events.length)throw Error('Eventos duplicados.');
 const availableEvents=new Set([...events,...referenceEventIds]);
 if(result.registrations.some(r=>!availableEvents.has(String(r.event_id))))throw Error('Inscrição sem evento correspondente.');
 return result;
}
