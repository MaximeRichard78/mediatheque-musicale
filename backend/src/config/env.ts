import 'dotenv/config';

export const env = {
  port: process.env.PORT ?? '3000',
  dataSource: process.env.DATA_SOURCE ?? 'in-memory',
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

export function requireSupabaseConfig(): { url: string; anonKey: string } {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error(
      'SUPABASE_URL et SUPABASE_ANON_KEY doivent être définis dans .env quand DATA_SOURCE=supabase',
    );
  }

  return { url: env.supabaseUrl, anonKey: env.supabaseAnonKey };
}

export function requireSupabaseServiceRoleConfig(): { url: string; serviceRoleKey: string } {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    throw new Error(
      'SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définis dans .env pour lancer le seed',
    );
  }

  return { url: env.supabaseUrl, serviceRoleKey: env.supabaseServiceRoleKey };
}
