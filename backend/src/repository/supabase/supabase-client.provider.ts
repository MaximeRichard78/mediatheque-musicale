import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { requireSupabaseConfig } from '../../config/env';

export class SupabaseClientProvider {
  private static instance: SupabaseClient | null = null;

  // Constructeur privé : empêche `new SupabaseClientProvider()` depuis l'extérieur,
  // seule la classe elle-même peut créer une instance (via getInstance()).
  private constructor() {}

  static getInstance(): SupabaseClient {
    if (!SupabaseClientProvider.instance) {
      const { url, anonKey } = requireSupabaseConfig();
      SupabaseClientProvider.instance = createClient(url, anonKey);
    }

    return SupabaseClientProvider.instance;
  }
}
