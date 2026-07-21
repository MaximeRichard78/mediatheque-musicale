import { env } from '../config/env';
import { AlbumRepository } from './album.repository';
import { ArtistRepository } from './artist.repository';
import { InMemoryAlbumRepository } from './in-memory/album.in-memory-repository';
import { InMemoryArtistRepository } from './in-memory/artist.in-memory-repository';
import { InMemoryLabelRepository } from './in-memory/label.in-memory-repository';
import { LabelRepository } from './label.repository';
import { SupabaseAlbumRepository } from './supabase/album.supabase-repository';
import { SupabaseArtistRepository } from './supabase/artist.supabase-repository';
import { SupabaseClientProvider } from './supabase/supabase-client.provider';
import { SupabaseLabelRepository } from './supabase/label.supabase-repository';

export interface Repositories {
  artistRepository: ArtistRepository;
  albumRepository: AlbumRepository;
  labelRepository: LabelRepository;
}

export class RepositoryFactory {
  static create(): Repositories {
    if (env.dataSource === 'supabase') {
      const client = SupabaseClientProvider.getInstance();

      return {
        artistRepository: new SupabaseArtistRepository(client),
        albumRepository: new SupabaseAlbumRepository(client),
        labelRepository: new SupabaseLabelRepository(client),
      };
    }

    return {
      artistRepository: new InMemoryArtistRepository(),
      albumRepository: new InMemoryAlbumRepository(),
      labelRepository: new InMemoryLabelRepository(),
    };
  }
}
