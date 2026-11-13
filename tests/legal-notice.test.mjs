import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const code=await readFile(new URL('../public/portal-legal.js',import.meta.url),'utf8');
async function visit({path='/',accepted=true,admin=false}={}){
 const changes=[],buttons=[];
 const nav={querySelector:()=>null,append:button=>buttons.push(button)};
 const document={head:{append(){}},querySelector:()=>null,querySelectorAll:()=>[nav],createElement:()=>({setAttribute(){},addEventListener:(event,fn)=>changes.push(fn)})};
 const redirects=[];
 await vm.runInNewContext(code,{document,location:{pathname:path,search:'',replace:url=>redirects.push(url),assign:url=>redirects.push(url)},encodeURIComponent,fetch:async()=>({ok:true,json:async()=>({accepted,canPreview:admin})})});
 return {buttons,redirects,click:()=>changes[0]?.()};
}
test('o primeiro acesso vai para o aceite e a leitura dos documentos continua disponível',async()=>{
 assert.equal((await visit({accepted:false})).redirects[0],'/aceite?return_to=%2F');
 for(const path of ['/termos-de-uso','/privacidade','/aceite'])assert.equal((await visit({path,accepted:false})).redirects.length,0);
 assert.equal((await visit()).redirects.length,0);
});
test('somente administradores veem os comprovantes e a prévia abre sem registrar aceite',async()=>{
 const admin=await visit({admin:true});assert.equal(admin.buttons.length,2);assert.equal(admin.buttons.find(item=>item.textContent==='Registros de aceite').href,'/administracao/aceites');admin.click();assert(admin.redirects[0].startsWith('/aceite?preview=1'));
 assert.equal((await visit()).buttons.length,0);
});
