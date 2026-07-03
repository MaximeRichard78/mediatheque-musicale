import { Router } from 'express';
import { LabelService } from '../service/label.service';

export function createLabelController(labelService: LabelService): Router {
  const router = Router();

  router.get('/', async (req, res) => {
    const { country, search } = req.query;

    if (typeof country === 'string') {
      res.json(await labelService.filterByCountry(country));
      return;
    }

    if (typeof search === 'string') {
      res.json(await labelService.searchByCountryOfOrigin(search));
      return;
    }

    res.json(await labelService.getAll());
  });

  router.get('/:id', async (req, res) => {
    const label = await labelService.getById(req.params.id);

    if (!label) {
      res.status(404).json({ message: `Label ${req.params.id} not found` });
      return;
    }

    res.json(label);
  });

  return router;
}
