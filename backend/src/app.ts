import { createClient } from '@supabase/supabase-js';
import cors from 'cors';
import express, { Express } from 'express';
import { env, requireSupabaseConfig } from './config/env';
import { createAlbumController } from './controller/album.controller';
import { createArtistController } from './controller/artist.controller';
import { createLabelController } from './controller/label.controller';
import { AlbumRepository } from './repository/album.repository';
import { ArtistRepository } from './repository/artist.repository';
import { InMemoryAlbumRepository } from './repository/in-memory/album.in-memory-repository';
import { InMemoryArtistRepository } from './repository/in-memory/artist.in-memory-repository';
import { InMemoryLabelRepository } from './repository/in-memory/label.in-memory-repository';
import { LabelRepository } from './repository/label.repository';
import { SupabaseAlbumRepository } from './repository/supabase/album.supabase-repository';
import { SupabaseArtistRepository } from './repository/supabase/artist.supabase-repository';
import { SupabaseLabelRepository } from './repository/supabase/label.supabase-repository';
import { AlbumService } from './service/album.service';
import { ArtistService } from './service/artist.service';
import { LabelService } from './service/label.service';

interface Repositories {
  artistRepository: ArtistRepository;
  albumRepository: AlbumRepository;
  labelRepository: LabelRepository;
}

function createRepositories(): Repositories {
  if (env.dataSource === 'supabase') {
    const { url, anonKey } = requireSupabaseConfig();
    const client = createClient(url, anonKey);

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

export function createApp(): Express {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const { artistRepository, albumRepository, labelRepository } = createRepositories();
  const artistService = new ArtistService(artistRepository);
  const albumService = new AlbumService(albumRepository);
  const labelService = new LabelService(labelRepository);

  app.use('/artists', createArtistController(artistService));
  app.use('/albums', createAlbumController(albumService));
  app.use('/labels', createLabelController(labelService));

  app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.method} ${req.path} not found` });
  });

  return app;
}
