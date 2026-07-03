import cors from 'cors';
import express, { Express } from 'express';
import { createAlbumController } from './controller/album.controller';
import { createArtistController } from './controller/artist.controller';
import { createLabelController } from './controller/label.controller';
import { InMemoryAlbumRepository } from './repository/in-memory/album.in-memory-repository';
import { InMemoryArtistRepository } from './repository/in-memory/artist.in-memory-repository';
import { InMemoryLabelRepository } from './repository/in-memory/label.in-memory-repository';
import { AlbumService } from './service/album.service';
import { ArtistService } from './service/artist.service';
import { LabelService } from './service/label.service';

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
