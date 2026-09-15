import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { authMiddleware } from '../middleware/auth';
import {
  readProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
} from '../lib/content';
import { githubWriteFile } from '../lib/github';
import { Product } from '../lib/types';

const router = Router();

async function saveThumbnail(slug: string, dataUrl: string): Promise<string | null> {
  const match = dataUrl.match(/^data:(image\/([a-z0-9.+-]+));base64,(.+)$/i);
  if (!match) return null;

  const mime = match[2].toLowerCase();
  const extMap: Record<string, string> = {
    'svg+xml': 'svg',
    jpeg: 'jpg',
    'x-icon': 'ico',
    'vnd.microsoft.icon': 'ico',
  };
  const ext = extMap[mime] || mime.replace('+xml', '').replace('x-', '');
  const base64Data = match[3];
  const buffer = Buffer.from(base64Data, 'base64');
  if (buffer.length === 0 || buffer.length > 50 * 1024 * 1024) return null;

  const safeSlug = slug.replace(/[^a-z0-9-]/gi, '').slice(0, 80) || 'thumbnail';
  const fileName = `${safeSlug}.${ext}`;
  const repoPath = `frontend/public/thumbnails/${fileName}`;

  const committed = await githubWriteFile(repoPath, base64Data, `Upload thumbnail: ${fileName}`);
  if (committed) {
    return `/thumbnails/${fileName}`;
  }

  if (process.env.GITHUB_TOKEN && process.env.GITHUB_OWNER && process.env.GITHUB_REPO) {
    return null;
  }

  const fs = await import('fs');
  const path = await import('path');
  const THUMB_DIR = path.resolve(__dirname, '../../../frontend/public/thumbnails');
  if (!fs.existsSync(THUMB_DIR)) {
    fs.mkdirSync(THUMB_DIR, { recursive: true });
  }
  fs.writeFileSync(path.join(THUMB_DIR, fileName), buffer);
  return `/thumbnails/${fileName}`;
}

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_OWNER_SECRET_HASH = process.env.ADMIN_OWNER_SECRET_HASH;

const OWNER_VERIFY_TTL_MS = 10 * 60 * 1000;
const ownerVerificationTokens = new Map<string, { email: string; expiresAt: number }>();

function purgeExpiredVerifications(): void {
  const now = Date.now();
  for (const [token, entry] of ownerVerificationTokens) {
    if (entry.expiresAt < now) ownerVerificationTokens.delete(token);
  }
}

router.post('/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password are required' });
      return;
    }

    if (!JWT_SECRET || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      res.status(503).json({ success: false, error: 'Admin authentication is not configured on the server' });
      return;
    }

    purgeExpiredVerifications();

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      res.status(401).json({ success: false, error: 'Invalid admin credentials.' });
      return;
    }

    const verificationToken = randomBytes(32).toString('hex');
    ownerVerificationTokens.set(verificationToken, {
      email,
      expiresAt: Date.now() + OWNER_VERIFY_TTL_MS,
    });

    res.json({ success: true, data: { verificationToken } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

router.post('/verify-owner', (req: Request, res: Response) => {
  try {
    const { verificationToken, secret } = req.body;

    if (!verificationToken || !secret) {
      res.status(400).json({ success: false, error: 'Verification token and owner secret are required' });
      return;
    }

    if (!ADMIN_OWNER_SECRET_HASH || !JWT_SECRET) {
      res.status(503).json({ success: false, error: 'Owner verification is not configured on the server' });
      return;
    }

    const entry = ownerVerificationTokens.get(verificationToken);
    ownerVerificationTokens.delete(verificationToken);

    if (!entry || entry.expiresAt < Date.now()) {
      res.status(401).json({ success: false, error: 'Invalid or expired verification session' });
      return;
    }

    let secretValid = false;
    try {
      secretValid = bcrypt.compareSync(secret, ADMIN_OWNER_SECRET_HASH);
    } catch {
      secretValid = false;
    }

    if (!secretValid) {
      res.status(401).json({ success: false, error: 'Invalid owner verification secret.' });
      return;
    }

    const token = jwt.sign({ email: entry.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, data: { token, email: entry.email } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Verification failed' });
  }
});

router.post('/upload-thumbnail', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { slug, dataUrl } = req.body;
    if (!slug || !dataUrl) {
      res.status(400).json({ success: false, error: 'slug and dataUrl are required' });
      return;
    }
    const thumbPath = await saveThumbnail(slug, dataUrl);
    if (!thumbPath) {
      res.status(400).json({ success: false, error: 'Invalid or unsupported image. Use any image under 50MB.' });
      return;
    }
    res.json({ success: true, data: { thumbnail: thumbPath } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to upload thumbnail' });
  }
});

router.get('/products', authMiddleware, async (_req: Request, res: Response) => {
  try {
    const products = await readProducts();
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch products' });
  }
});

router.post('/products', authMiddleware, async (req: Request, res: Response) => {
  try {
    const {
      title,
      slug,
      description,
      category,
      price,
      currency,
      thumbnail,
      previewRoute,
      technologies,
      featured,
      status,
      sortOrder,
    } = req.body;

    if (!title || !slug || !description || !category) {
      res.status(400).json({
        success: false,
        error: 'title, slug, description, and category are required',
      });
      return;
    }

    const products = await readProducts();
    if (products.some((p) => p.slug === slug)) {
      res.status(409).json({ success: false, error: 'A product with this slug already exists' });
      return;
    }

    const now = new Date().toISOString();
    const newProduct: Product = {
      id: crypto.randomUUID(),
      title,
      slug,
      description,
      category,
      price: price || 0,
      currency: currency || 'USD',
      thumbnail: thumbnail || '',
      previewRoute: previewRoute || '',
      technologies: technologies || [],
      featured: featured || false,
      status: status || 'draft',
      sortOrder: sortOrder || 0,
      createdAt: now,
      updatedAt: now,
    };

    await createProduct(newProduct);
    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create product' });
  }
});

router.get('/products/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const product = await getProductById(id);
    if (!product) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch product' });
  }
});

router.put('/products/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const existing = await getProductById(id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }

    const updated = await updateProduct(id, req.body);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update product' });
  }
});

router.patch('/products/:id/status', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    if (!status || !['draft', 'published', 'archived'].includes(status)) {
      res.status(400).json({
        success: false,
        error: 'Status must be one of: draft, published, archived',
      });
      return;
    }

    const existing = await getProductById(id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }

    const updated = await updateProduct(id, { status });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update product status' });
  }
});

router.delete('/products/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const existing = await getProductById(id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }

    await deleteProduct(id);
    res.json({ success: true, data: { message: 'Product deleted' } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete product' });
  }
});

export default router;