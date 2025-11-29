import { createClient } from '@supabase/supabase-js';

import { supaKey, supaUrl } from '../env';

// Create a single supabase client for interacting with your database
if (!supaUrl) {
  throw new Error('Missing env var: REACT_APP_SUPABASE_URL');
}

if (!supaKey) {
  throw new Error('Missing env var: REACT_APP_SUPABASE_URL');
}

export const supabase = createClient(supaUrl, supaKey);
