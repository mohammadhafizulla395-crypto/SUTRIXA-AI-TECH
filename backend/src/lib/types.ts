export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  thumbnail: string;
  previewRoute: string;
  technologies: string[];
  featured: boolean;
  status: 'draft' | 'published' | 'archived';
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCredentials {
  email: string;
  password: string;
}
