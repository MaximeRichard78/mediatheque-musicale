import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('RepositoryFactory', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('crée les repositories in-memory par défaut', async () => {
    vi.stubEnv('DATA_SOURCE', 'in-memory');

    const { RepositoryFactory } = await import('./repository.factory');
    const { InMemoryArtistRepository } = await import('./in-memory/artist.in-memory-repository');

    const repositories = RepositoryFactory.create();

    expect(repositories.artistRepository).toBeInstanceOf(InMemoryArtistRepository);
  });

  it('crée les repositories Supabase quand DATA_SOURCE=supabase', async () => {
    vi.stubEnv('DATA_SOURCE', 'supabase');
    vi.stubEnv('SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('SUPABASE_ANON_KEY', 'test-anon-key');

    const { RepositoryFactory } = await import('./repository.factory');
    const { SupabaseArtistRepository } = await import('./supabase/artist.supabase-repository');

    const repositories = RepositoryFactory.create();

    expect(repositories.artistRepository).toBeInstanceOf(SupabaseArtistRepository);
  });
});
