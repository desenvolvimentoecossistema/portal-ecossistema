import {runPrivacyRetention} from '../lib/privacy-retention.mjs';
import {seedLegalHistory} from '../lib/legal-archive.mjs';
import {pruneApplicationBackups} from '../lib/backup-retention.mjs';
import {resolve,dirname,join} from 'node:path';
seedLegalHistory();
function maintain(){try{const result=runPrivacyRetention();const folder=resolve(process.env.BACKUP_DIRECTORY||join(dirname(resolve(process.env.DATABASE_PATH||'./data/portal.sqlite')),'backups'));pruneApplicationBackups(folder);if(folder!==resolve('backups'))pruneApplicationBackups('backups');if(!result.skipped)console.log('Conservação de dados concluída:',JSON.stringify(result));}catch{console.error('A rotina de conservação de dados não foi concluída; será repetida.');}}
maintain();setInterval(maintain,3600000);
