const requiredKeys = [
  "RETAILCRM_URL",
  "RETAILCRM_API_KEY",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "TELEGRAM_BOT_TOKEN",
  "TELEGRAM_CHAT_ID",
  "SYNC_API_SECRET",
  "CRON_SECRET",
] as const;

export type EnvKey = (typeof requiredKeys)[number];

export function getEnv(key: EnvKey): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export function hasEnv(keys: EnvKey[]): boolean {
  return keys.every((key) => Boolean(process.env[key]));
}

export function getOptionalEnv(key: EnvKey): string | undefined {
  return process.env[key];
}

export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};
