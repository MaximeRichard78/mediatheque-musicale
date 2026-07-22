import cors from 'cors';
import express, { Express } from 'express';
import { createAlbumController } from './controller/album.controller';
import { createArtistController } from './controller/artist.controller';
import { createLabelController } from './controller/label.controller';
import { RepositoryFactory } from './repository/repository.factory';
import './repository/repository.registrations';
import { AlbumService } from './service/album.service';
import { ArtistService } from './service/artist.service';
import { LabelService } from './service/label.service';

export function createApp(): Express {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const { artistRepository, albumRepository, labelRepository } = RepositoryFactory.create();
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
