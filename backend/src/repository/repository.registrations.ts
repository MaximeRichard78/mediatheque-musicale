import { InMemoryAlbumRepository } from './in-memory/album.in-memory-repository';
import { InMemoryArtistRepository } from './in-memory/artist.in-memory-repository';
import { InMemoryLabelRepository } from './in-memory/label.in-memory-repository';
import { RepositoryFactory } from './repository.factory';
import { SupabaseAlbumRepository } from './supabase/album.supabase-repository';
import { SupabaseArtistRepository } from './supabase/artist.supabase-repository';
import { SupabaseLabelRepository } from './supabase/label.supabase-repository';
import { SupabaseClientProvider } from './supabase/supabase-client.provider';

RepositoryFactory.register('in-memory', () => ({
  artistRepository: new InMemoryArtistRepository(),
  albumRepository: new InMemoryAlbumRepository(),
  labelRepository: new InMemoryLabelRepository(),
}));

RepositoryFactory.register('supabase', () => {
  const client = SupabaseClientProvider.getInstance();

  return {
    artistRepository: new SupabaseArtistRepository(client),
    albumRepository: new SupabaseAlbumRepository(client),
    labelRepository: new SupabaseLabelRepository(client),
  };
});
