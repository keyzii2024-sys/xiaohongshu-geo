const SUPABASE_URL_ENV = "NEXT_PUBLIC_SUPABASE_URL";
const SUPABASE_ANON_KEY_ENV = "NEXT_PUBLIC_SUPABASE_ANON_KEY";

function requireEnv(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getSupabaseUrl() {
  return requireEnv(SUPABASE_URL_ENV, process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function getSupabaseAnonKey() {
  return requireEnv(
    SUPABASE_ANON_KEY_ENV,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
