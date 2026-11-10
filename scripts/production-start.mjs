import {spawn} from 'node:child_process';
import {getSqliteDatabase} from '../db/sqlite.mjs';
import {runPrivacyRetention} from '../lib/privacy-retention.mjs';
import {seedLegalHistory} from '../lib/legal-archive.mjs';
getSqliteDatabase();
seedLegalHistory();runPrivacyRetention({force:true});
const server=spawn(process.execPath,['server.js'],{stdio:'inherit',env:process.env});
let stopping=false;const workers=new Set();
function startWorker(file){if(stopping)return;const worker=spawn(process.execPath,[file],{stdio:'inherit',env:process.env});workers.add(worker);worker.on('exit',()=>{workers.delete(worker);if(!stopping)setTimeout(()=>startWorker(file),5000);});}
startWorker('scripts/email-worker.mjs');startWorker('scripts/privacy-worker.mjs');
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{stopping=true;server.kill(signal);for(const worker of workers)worker.kill(signal);});
server.on('exit',code=>{stopping=true;for(const worker of workers)worker.kill();process.exitCode=code??1;});
