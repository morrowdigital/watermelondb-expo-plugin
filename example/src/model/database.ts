/* eslint-disable no-console */
import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { setGenerator } from '@nozbe/watermelondb/utils/common/randomId';
import * as Crypto from 'expo-crypto';

import { BoardGame } from './model';
import { schema } from './schema';

const adapter = new SQLiteAdapter({
  schema,
  dbName: 'boardgameapp',
  jsi: true /* Platform.OS === 'ios' */,
  onSetUpError: (error: any) => {
    console.log('error setting up database', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [BoardGame],
});

// We need to setup the random id generator to use UUID v4
// so the Ids are the same format as on the Supabase server
// Otherwise Postgres will complain.
setGenerator(() => Crypto.randomUUID());
