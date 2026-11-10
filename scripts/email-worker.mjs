import {flushNotifications} from '../lib/email-notifications.mjs';
let running=false;
async function deliver(){if(running)return;running=true;try{await flushNotifications();}catch(error){console.error('Não foi possível processar a fila de comunicações.',error instanceof Error?error.message:'Erro de comunicação');}finally{running=false;}}
void deliver();
setInterval(()=>void deliver(),60000);
