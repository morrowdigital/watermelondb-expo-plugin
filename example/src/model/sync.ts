import { SyncDatabaseChangeSet, synchronize } from '@nozbe/watermelondb/sync';

import { database } from './database';
import { getDb } from './helpers';
import { supabase } from '../supabase/supabase-client';

export async function sync() {
  const username = await getDb().localStorage.get<string>('username');
  if (!username) {
    return console.log(`🍉 No user found. Skipping sync.`);
  }

  await synchronize({
    database,
    // with pull changes we should provide the logic to call the remote server pull function
    // that will provide the changes that happened on the server since lastPulledAt
    // Results should be in format SyncDatabaseChangeSet
    pullChanges: async ({ lastPulledAt }) => {
      console.log(
        `🍉 Pulling with lastPulledAt = ${lastPulledAt}`,
        'for user',
        username,
      );
      const { data, error } = await supabase.rpc('pull', {
        p_record_owner: username,
        last_pulled_at: lastPulledAt ?? 0,
      });

      if (error) {
        throw new Error('🍉'.concat(error.message));
      }

      // uncomment this for debugging purposes
      // console.log(JSON.stringify(data, null, 2));

      const { changes, timestamp } = data as {
        changes: SyncDatabaseChangeSet;
        timestamp: number;
      };

      console.log(`🍉 Changes pulled successfully. Timestamp: ${timestamp}`);

      return { changes, timestamp };
    },
    // with push changes we should provide the logic to call the remote server push function
    // which receives and handles client-side changes from WatermelonDB.
    // the object sent is in format SyncDatabaseChangeSet
    pushChanges: async ({ changes, lastPulledAt }) => {
      console.log(`🍉 Pushing with lastPulledAt = ${lastPulledAt}`);

      // uncomment this for debugging purposes
      // console.log('changes', JSON.stringify(changes, null, 2));

      const { error } = await supabase.rpc('push', {
        changes,
        p_record_owner: username,
      });

      if (error) {
        throw new Error('🍉'.concat(error.message));
      }

      console.log(`🍉 Changes pushed successfully.`);
    },
    // With this setting we expect from server that new rows
    // will return in 'updated' key along with updates.
    // So WatermelonDB will treat them as accordingly.
    sendCreatedAsUpdated: true,
  });
}
