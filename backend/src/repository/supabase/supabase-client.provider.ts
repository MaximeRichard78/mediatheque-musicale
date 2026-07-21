import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { requireSupabaseConfig } from '../../config/env';

export class SupabaseClientProvider {
  private static instance: SupabaseClient | null = null;

  static getInstance(): SupabaseClient {
    if (!SupabaseClientProvider.instance) {
      const { url, anonKey } = requireSupabaseConfig();
      SupabaseClientProvider.instance = createClient(url, anonKey);
    }

    return SupabaseClientProvider.instance;
  }
}
