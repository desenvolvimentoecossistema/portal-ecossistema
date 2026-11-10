import {spawn} from 'node:child_process';
import {getSqliteDatabase} from '../db/sqlite.mjs';
getSqliteDatabase();
const server=spawn(process.execPath,['server.js'],{stdio:'inherit',env:process.env});
let stopping=false,worker;
function startWorker(){if(stopping)return;worker=spawn(process.execPath,['scripts/email-worker.mjs'],{stdio:'inherit',env:process.env});worker.on('exit',()=>{if(!stopping)setTimeout(startWorker,5000);});}
startWorker();
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{stopping=true;server.kill(signal);worker?.kill(signal);});
server.on('exit',code=>{stopping=true;worker?.kill();process.exitCode=code??1;});
