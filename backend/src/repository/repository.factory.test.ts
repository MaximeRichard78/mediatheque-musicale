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
    await import('./repository.registrations');
    const { InMemoryArtistRepository } = await import('./in-memory/artist.in-memory-repository');

    const repositories = RepositoryFactory.create();

    expect(repositories.artistRepository).toBeInstanceOf(InMemoryArtistRepository);
  });

  it('crée les repositories Supabase quand DATA_SOURCE=supabase', async () => {
    vi.stubEnv('DATA_SOURCE', 'supabase');
    vi.stubEnv('SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('SUPABASE_ANON_KEY', 'test-anon-key');

    const { RepositoryFactory } = await import('./repository.factory');
    await import('./repository.registrations');
    const { SupabaseArtistRepository } = await import('./supabase/artist.supabase-repository');

    const repositories = RepositoryFactory.create();

    expect(repositories.artistRepository).toBeInstanceOf(SupabaseArtistRepository);
  });

  it('lève une erreur si DATA_SOURCE ne correspond à aucune implémentation enregistrée', async () => {
    vi.stubEnv('DATA_SOURCE', 'inconnu');

    const { RepositoryFactory } = await import('./repository.factory');
    await import('./repository.registrations');

    expect(() => RepositoryFactory.create()).toThrow(/Aucune implémentation enregistrée/);
  });

  it("permet d'enregistrer une nouvelle implémentation sans modifier RepositoryFactory", async () => {
    vi.stubEnv('DATA_SOURCE', 'fake');

    const { RepositoryFactory } = await import('./repository.factory');

    class FakeArtistRepository {
      async findAll() {
        return [];
      }
      async findById() {
        return null;
      }
    }

    RepositoryFactory.register('fake', () => ({
      artistRepository: new FakeArtistRepository() as never,
      albumRepository: new FakeArtistRepository() as never,
      labelRepository: new FakeArtistRepository() as never,
    }));

    const repositories = RepositoryFactory.create();

    expect(repositories.artistRepository).toBeInstanceOf(FakeArtistRepository);
  });
});
