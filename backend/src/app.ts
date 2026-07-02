import cors from 'cors';
import express, { Express } from 'express';
import { createAlbumController } from './controller/album';
import { createArtistController } from './controller/artist';
import { createLabelController } from './controller/label';
import { InMemoryAlbumRepository } from './repository/in-memory/album';
import { InMemoryArtistRepository } from './repository/in-memory/artist';
import { InMemoryLabelRepository } from './repository/in-memory/label';
import { AlbumService } from './service/album';
import { ArtistService } from './service/artist';
import { LabelService } from './service/label';

export function createApp(): Express {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const artistService = new ArtistService(new InMemoryArtistRepository());
  const albumService = new AlbumService(new InMemoryAlbumRepository());
  const labelService = new LabelService(new InMemoryLabelRepository());

  app.use('/artists', createArtistController(artistService));
  app.use('/albums', createAlbumController(albumService));
  app.use('/labels', createLabelController(labelService));

  app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.method} ${req.path} not found` });
  });

  return app;
}
