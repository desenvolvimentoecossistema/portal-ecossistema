import {cpSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
const target='.next/standalone';
mkdirSync(join(target,'.next'),{recursive:true});
cpSync('.next/static',join(target,'.next/static'),{recursive:true});
cpSync('public',join(target,'public'),{recursive:true});
cpSync('database',join(target,'database'),{recursive:true});
console.log('Aplicação independente preparada em .next/standalone.');
