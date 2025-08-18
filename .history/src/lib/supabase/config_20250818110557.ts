// /src/lib/supabase/config.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
// This client is ONLY for server/admin code and should NEVER be exposed to the client!
export function createAdminClient() {
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false }
  });
}