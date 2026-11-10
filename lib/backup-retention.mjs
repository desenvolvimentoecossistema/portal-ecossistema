import {readdirSync,lstatSync,unlinkSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
export function pruneApplicationBackups(directory,now=new Date().toISOString()){
 const cutoff=Date.parse(now)-30*24*3600000;if(!Number.isFinite(cutoff))throw Error('Data inválida.');
 const root=resolve(directory);if(!existsSync(root))return 0;
 let deleted=0;
 for(const name of readdirSync(root)){
  const match=/^portal-(\d{4}-\d\d-\d\d)T(\d\d)-(\d\d)-(\d\d)-(\d{3})Z\.sqlite$/.exec(name);
  if(!match)continue;
  const timestamp=Date.parse(`${match[1]}T${match[2]}:${match[3]}:${match[4]}.${match[5]}Z`);
  const path=join(root,name),info=lstatSync(path);
  if(info.isFile()&&!info.isSymbolicLink()&&Number.isFinite(timestamp)&&timestamp<cutoff&&info.mtimeMs<cutoff){unlinkSync(path);deleted++;}
 }
 return deleted;
}
