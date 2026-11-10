import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import {hostNotification, participantConfirmation,registrationCancellation,eventCancellation} from '../lib/registration-email.ts';

const source=fs.readFileSync(new URL('../integrations/apps-script/Code.gs',import.meta.url),'utf8');
const event={title:'Visita à escola',type:'Evento institucional',organization:'Motriz',contactName:'Equipe anfitriã',contactEmail:'anfitria@example.org',startDate:'2026-11-10',endDate:'2026-11-10',startTime:'09:00',endTime:'12:00',venue:'Escola parceira',city:'São Paulo',state:'SP'};
const person={name:'Maria Exemplo',email:'maria@example.org',organization:'Reúna',role:'Coordenação'};

function app() {
  const messages:any[]=[];
  const context=vm.createContext({
    console:{error(){},warn(){}},
    MailApp:{getRemainingDailyQuota:()=>100},
    GmailApp:{sendEmail:(to:string,subject:string,body:string,options:object)=>messages.push({to,subject,body,...options})},
    Utilities:{base64Decode:(value:string)=>Buffer.from(value,'base64'),newBlob:(bytes:Buffer)=>bytes},
    PropertiesService:{getScriptProperties:()=>({getProperty:()=> 'segredo-ficticio-do-teste'})},
    ContentService:{MimeType:{JSON:'application/json'},createTextOutput:(content:string)=>({setMimeType:()=>JSON.parse(content)})},
  });
  vm.runInContext(source,context,{timeout:2000});
  const post=(payload:object)=>context.doPost({postData:{contents:JSON.stringify({secret:'segredo-ficticio-do-teste',...payload})}});
  return {messages,context,post};
}

test('Apps Script distingue aviso ao responsável de confirmação ao participante',()=>{
  const {post,messages}=app();
  assert.equal(post(hostNotification(event,person)).ok,true);
  assert.equal(post(participantConfirmation(event,person)).ok,true);
  assert.equal(messages.length,2);
  const [host,participant]=messages;
  assert.equal(host.to,event.contactEmail);
  assert.equal(host.replyTo,person.email);
  assert.match(host.subject,/^Nova inscrição:/);
  assert.match(host.htmlBody,/Dados da pessoa inscrita/);
  assert.equal(participant.to,person.email);
  assert.equal(participant.replyTo,event.contactEmail);
  assert.match(participant.subject,/^Inscrição recebida:/);
  assert.match(participant.htmlBody,/Sua inscrição foi recebida/);
  assert.match(participant.body,/Recebemos sua inscrição/);
  assert.doesNotMatch(participant.body,/Uma pessoa se inscreveu/);
  assert.notEqual(host.htmlBody,participant.htmlBody);
  assert.match(host.body,/Para entrar em contato com Maria Exemplo/);
  assert.match(host.body,/Sua resposta será enviada diretamente para maria@example.org/);
  assert.match(participant.body,/Se tiver dúvidas, responda a este e-mail para falar com Equipe anfitriã/);
  assert.match(participant.body,/Sua resposta será enviada diretamente para anfitria@example.org/);
  for(const message of messages){
    assert.match(message.body,/Organização anfitriã: Motriz/);
    assert.match(message.body,/10 nov\. de 2026 · 9h–12h/);
    assert.match(message.htmlBody.replace(/<br\s*\/?\s*>/gi,' '),/Portal do Ecossistema/);
    assert.match(message.htmlBody,/Imersões em Eventos/);
    assert.equal(message.name,'Portal do Ecossistema');
    assert.doesNotMatch(message.htmlBody,/chatgpt\.site|IMERSÕES DO ECOSSISTEMA/);
    const links=[...message.htmlBody.matchAll(/href="([^"]+)"/g)].map(m=>m[1]);
    assert.deepEqual(links,['https://portalecossistema.fundacaolemann.org.br/imersoes','https://portalecossistema.fundacaolemann.org.br/termos-de-uso','https://portalecossistema.fundacaolemann.org.br/privacidade']);
    assert.equal(Object.keys(message.inlineImages).length,2);
  }
});

test('cancelamento de inscrição avisa o anfitrião e cancelamento de agenda avisa a pessoa inscrita',()=>{
 const {post,messages}=app();
 assert.equal(post(registrationCancellation(event,person)).ok,true);
 assert.equal(post(eventCancellation(event,person,'Pessoa anfitriã')).ok,true);
 assert.equal(messages[0].to,event.contactEmail);
 assert.match(messages[0].subject,/^Inscrição cancelada:/);
 assert.match(messages[0].body,/Maria Exemplo cancelou a inscrição/);
 assert.doesNotMatch(messages[0].body,/Nova inscrição recebida/);
 assert.equal(messages[1].to,person.email);
 assert.match(messages[1].subject,/^Agenda cancelada:/);
 assert.match(messages[1].body,/Pessoa anfitriã/);
 assert.match(messages[1].htmlBody,/Sua inscrição foi encerrada/);
 assert.equal(messages[1].replyTo,event.contactEmail);
 assert.doesNotMatch(messages[1].body,/Recebemos sua inscrição/);
});

test('Apps Script preserva chamadas antigas sem tipo de notificação',()=>{
  const {post,messages}=app();
  const {notificationType,...legacy}=hostNotification(event,person);
  assert.equal(post(legacy).ok,true);
  assert.equal(messages[0].to,event.contactEmail);
  assert.match(messages[0].subject,/^Nova inscrição:/);
});

test('Apps Script rejeita segredo inválido e confirmação sem resposta válida ou com destinatário divergente',()=>{
  const {post,messages}=app();
  assert.equal(post({...hostNotification(event,person),secret:'incorreto'}).ok,false);
  assert.equal(post({...participantConfirmation(event,person),replyToEmail:''}).ok,false);
  assert.equal(post({...participantConfirmation(event,person),recipientEmail:'terceiro@example.org'}).ok,false);
  assert.equal(post({...participantConfirmation(event,person),contactEmail:'terceiro@example.org'}).ok,false);
  assert.equal(post({...hostNotification(event,person),notificationType:'outro'}).ok,false);
  assert.equal(post({...hostNotification(event,person),contactEmail:'um@example.org,dois@example.org'}).ok,false);
  assert.equal(messages.length,0);
});

test('Apps Script escapa dados no HTML e impede quebra de cabeçalho no assunto',()=>{
  const {post,messages}=app();
  const unsafe=participantConfirmation({...event,title:'Visita <script>alert(1)</script>\r\nBcc: terceiro@example.org'}, {...person,name:'Maria <img src=x onerror=alert(1)>'});
  assert.equal(post(unsafe).ok,true);
  assert.doesNotMatch(messages[0].subject,/[\r\n]/);
  assert.doesNotMatch(messages[0].htmlBody,/<script>|<img src=x/);
  assert.match(messages[0].htmlBody,/&lt;script&gt;/);
  assert.match(messages[0].htmlBody,/&lt;img src=x/);
});
