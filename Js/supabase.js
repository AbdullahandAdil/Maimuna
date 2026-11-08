
import { createClient } from
  'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL =
  'https://ktxkqcojemnwfvapifwm.supabase.co';

const SUPABASE_KEY =
  'sb_publishable_1NdRsDXQUe06dglZf8QBAQ_d1vqWUMi';

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);
