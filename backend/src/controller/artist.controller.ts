import { Router } from 'express';
import { ArtistService } from '../service/artist.service';

export function createArtistController(artistService: ArtistService): Router {
  const router = Router();

  router.get('/', async (req, res) => {
    const { genre, sort } = req.query;

    if (typeof genre === 'string') {
      res.json(await artistService.filterByGenre(genre));
      return;
    }

    if (sort === 'genre') {
      res.json(await artistService.sortByGenre());
      return;
    }

    res.json(await artistService.getAll());
  });

  router.get('/:id', async (req, res) => {
    const artist = await artistService.getById(req.params.id);

    if (!artist) {
      res.status(404).json({ message: `Artist ${req.params.id} not found` });
      return;
    }

    res.json(artist);
  });

  return router;
}
