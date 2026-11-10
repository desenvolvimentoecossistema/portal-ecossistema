import {backup} from 'node:sqlite';
import {getSqliteDatabase} from '../db/sqlite.mjs';
import {mkdirSync,chmodSync} from 'node:fs';
import {resolve,dirname,join} from 'node:path';
import {runPrivacyRetention} from '../lib/privacy-retention.mjs';
import {pruneApplicationBackups} from '../lib/backup-retention.mjs';
const folder=resolve(process.env.BACKUP_DIRECTORY||join(dirname(resolve(process.env.DATABASE_PATH||'./data/portal.sqlite')),'backups'));
mkdirSync(folder,{recursive:true,mode:0o700});runPrivacyRetention({force:true});
const dest=join(folder,'portal-'+new Date().toISOString().replace(/[:.]/g,'-')+'.sqlite');await backup(getSqliteDatabase(),dest);chmodSync(dest,0o600);pruneApplicationBackups(folder);console.log(dest);
