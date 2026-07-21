import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('SupabaseClientProvider', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('SUPABASE_ANON_KEY', 'test-anon-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renvoie toujours la même instance (singleton)', async () => {
    const { SupabaseClientProvider } = await import('./supabase-client.provider');

    const first = SupabaseClientProvider.getInstance();
    const second = SupabaseClientProvider.getInstance();

    expect(first).toBe(second);
  });
});
