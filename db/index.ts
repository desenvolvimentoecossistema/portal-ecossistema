import {drizzle} from 'drizzle-orm/sqlite-proxy';
import * as schema from './schema';
import {executeQuery,executeBatch,getSqliteDatabase} from './sqlite.mjs';
export {getSqliteDatabase};
export function getDb(){return drizzle(executeQuery,executeBatch,{schema});}
