export function formatRecordedDate(value){
 if(typeof value!=='string'||!value.trim())return null;
 const date=new Date(value);
 if(!Number.isFinite(date.getTime()))return null;
 return new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',dateStyle:'short',timeStyle:'short'}).format(date);
}
export function eventLastEditedDate(event){
 return formatRecordedDate(event.updatedAt)||formatRecordedDate(event.createdAt)||'data não registrada';
}
