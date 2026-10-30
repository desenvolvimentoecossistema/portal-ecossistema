import {spawn} from 'node:child_process';
import {resolve} from 'node:path';
import {getSqliteDatabase} from '../db/sqlite.mjs';
getSqliteDatabase();
const child=spawn(process.execPath,['.next/standalone/server.js'],{stdio:'inherit',env:{...process.env,DATABASE_PATH:resolve(process.env.DATABASE_PATH||'./data/portal.sqlite'),HOSTNAME:process.env.HOSTNAME||'0.0.0.0',PORT:process.env.PORT||'3000',NEXT_TELEMETRY_DISABLED:'1'}});
for(const s of ['SIGINT','SIGTERM'])process.on(s,()=>child.kill(s));
child.on('exit',code=>process.exit(code??1));
