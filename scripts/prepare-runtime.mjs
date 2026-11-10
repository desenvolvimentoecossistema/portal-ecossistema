import {cpSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
const target='.next/standalone';
mkdirSync(join(target,'.next'),{recursive:true});
cpSync('.next/static',join(target,'.next/static'),{recursive:true});
cpSync('public',join(target,'public'),{recursive:true});
cpSync('database',join(target,'database'),{recursive:true});
// Keep local maintenance commands available in the standalone/Docker image.
for(const file of ['scripts/import-data.mjs','scripts/migrate.mjs','scripts/backup.mjs','scripts/production-start.mjs','scripts/email-worker.mjs','scripts/privacy-worker.mjs','scripts/privacy-hold.mjs','db/sqlite.mjs','lib/portal-import.ts','lib/map-storage.mjs','lib/generated-map.js','lib/email-notifications.mjs','lib/legal-archive.mjs','lib/legal-document-history.json','lib/privacy-retention.mjs','lib/backup-retention.mjs']){
 mkdirSync(join(target,file.slice(0,file.lastIndexOf('/'))),{recursive:true});
 cpSync(file,join(target,file));
}
console.log('Aplicação independente preparada em .next/standalone.');
