import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getEnv, hasEnv, publicEnv } from "@/lib/env";

let serverClient: SupabaseClient | null = null;
let readClient: SupabaseClient | null = null;

export function getSupabaseAdminClient(): SupabaseClient {
  if (serverClient) {
    return serverClient;
  }

  serverClient = createClient(getEnv("SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return serverClient;
}

export function canUseSupabaseAdmin(): boolean {
  return hasEnv(["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]);
}

export function getSupabaseReadClient(): SupabaseClient {
  if (readClient) {
    return readClient;
  }

  if (!publicEnv.supabaseUrl || !publicEnv.supabaseAnonKey) {
    throw new Error("Supabase public credentials are not configured");
  }

  readClient = createClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return readClient;
}

export function canUseSupabaseRead(): boolean {
  return Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey);
}
