import { Router, Request, Response } from 'express';
import { getPublishedProducts, getProductBySlug } from '../lib/content';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    let products = await getPublishedProducts();

    const { category, search } = _req.query;

    if (typeof category === 'string' && category) {
      products = products.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (typeof search === 'string' && search) {
      const term = search.toLowerCase();
      products = products.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          p.technologies.some((t) => t.toLowerCase().includes(term))
      );
    }

    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch products' });
  }
});

router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const product = await getProductBySlug(req.params.slug as string);
    if (!product) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch product' });
  }
});

export default router;