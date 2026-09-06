import { Product, ApiResponse } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function resolveApiUrl(): string {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not set. Configure it in frontend/.env.local for development (e.g. http://localhost:4000) and in the Vercel project environment (e.g. https://YOUR-RENDER-BACKEND.onrender.com) for production."
    );
  }
  return API_URL;
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${resolveApiUrl()}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    const data = await res.json();
    return data;
  } catch {
    return { success: false, error: 'Failed to connect to server' };
  }
}

export async function getPublishedProducts(category?: string, search?: string): Promise<Product[]> {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (search) params.set('search', search);
  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetchApi<Product[]>(`/api/products${query}`);
  return res.data || [];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const res = await fetchApi<Product>(`/api/products/${slug}`);
  return res.data || null;
}

export async function getCategories(): Promise<string[]> {
  const products = await getPublishedProducts();
  const categories = [...new Set(products.map(p => p.category))];
  return categories.sort();
}

export async function adminLogin(
  email: string,
  password: string
): Promise<{ verificationToken?: string; error?: string }> {
  const res = await fetch(`${resolveApiUrl()}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (data.success && data.data?.verificationToken) {
    return { verificationToken: data.data.verificationToken };
  }
  return { error: data.error || 'Login failed' };
}

export async function verifyOwner(
  verificationToken: string,
  secret: string
): Promise<{ token?: string; error?: string }> {
  const res = await fetch(`${resolveApiUrl()}/api/admin/verify-owner`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ verificationToken, secret }),
  });
  const data = await res.json();
  if (data.success && data.data?.token) {
    return { token: data.data.token };
  }
  return { error: data.error || 'Verification failed' };
}

export async function getAdminProducts(token: string): Promise<Product[]> {
  const res = await fetch(`${resolveApiUrl()}/api/admin/products`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.data || [];
}

export async function getAdminProduct(token: string, id: string): Promise<Product | null> {
  const res = await fetch(`${resolveApiUrl()}/api/admin/products/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.data || null;
}

export async function createProduct(
  token: string,
  data: Omit<Product, "id" | "createdAt" | "updatedAt">
): Promise<Product | null> {
  const res = await fetch(`${resolveApiUrl()}/api/admin/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  return result.data || null;
}

export async function updateProduct(token: string, id: string, updates: Partial<Product>): Promise<boolean> {
  const res = await fetch(`${resolveApiUrl()}/api/admin/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  return data.success;
}

export async function uploadThumbnail(token: string, slug: string, dataUrl: string): Promise<string | null> {
  const res = await fetch(`${resolveApiUrl()}/api/admin/upload-thumbnail`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ slug, dataUrl }),
  });
  const data = await res.json();
  return data?.data?.thumbnail || null;
}

export async function updateProductStatus(token: string, id: string, status: string): Promise<boolean> {
  const res = await fetch(`${resolveApiUrl()}/api/admin/products/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  return data.success;
}

export async function deleteProduct(token: string, id: string): Promise<boolean> {
  const res = await fetch(`${resolveApiUrl()}/api/admin/products/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.success;
}
