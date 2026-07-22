import { Router } from 'express';
import { AlbumService } from '../service/album.service';

export function createAlbumController(albumService: AlbumService): Router {
  const router = Router();

  router.get('/', async (req, res) => {
    const { sort, order, group } = req.query;

    if (group === 'era') {
      res.json(await albumService.groupByEra());
      return;
    }

    if (sort === 'year') {
      const sortOrder = order === 'desc' ? 'desc' : 'asc';
      res.json(await albumService.sortByReleaseYear(sortOrder));
      return;
    }

    res.json(await albumService.getAll());
  });

  router.post('/recommendations', async (req, res) => {
    const { favoriteIds } = req.body;
    const boostRecent = req.query.boostRecent === 'true';

    if (!Array.isArray(favoriteIds) || favoriteIds.length === 0) {
      res.status(400).json({ message: 'favoriteIds must be a non-empty array of album ids' });
      return;
    }

    res.json(await albumService.recommend(favoriteIds, boostRecent));
  });

  router.get('/:id', async (req, res) => {
    const album = await albumService.getById(req.params.id);

    if (!album) {
      res.status(404).json({ message: `Album ${req.params.id} not found` });
      return;
    }

    res.json(album);
  });

  return router;
}
