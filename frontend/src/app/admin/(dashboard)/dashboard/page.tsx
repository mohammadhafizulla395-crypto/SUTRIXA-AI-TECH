"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminProducts } from "@/lib/api";
import { Product } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Stats {
  total: number;
  published: number;
  draft: number;
  archived: number;
  featured: number;
}

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 50, published: 0, draft: 50, archived: 0, featured: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      if (typeof window === "undefined") return;
      const token = localStorage.getItem("sutrixa_admin_token");
      if (!token) return;

      try {
        const data = await getAdminProducts(token);
        setProducts(data);
        setStats({
          total: data.length,
          published: data.filter((p) => p.status === "published").length,
          draft: data.filter((p) => p.status === "draft").length,
          archived: data.filter((p) => p.status === "archived").length,
          featured: data.filter((p) => p.featured).length,
        });
      } catch {
        // keep default stats
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const recentProducts = [...products]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const statCards = [
    { label: "Total Products", value: stats.total, color: "text-foreground" },
    { label: "Published", value: stats.published, color: "text-green-400" },
    { label: "Draft", value: stats.draft, color: "text-yellow-400" },
    { label: "Archived", value: stats.archived, color: "text-muted" },
    { label: "Featured", value: stats.featured, color: "text-accent" },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">Overview of your product catalog</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-border bg-card p-5"
          >
            <p className="text-sm text-muted">{card.label}</p>
            <p className={`mt-1 text-3xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-background hover:bg-accent/90 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
              </svg>
              Manage Products
            </Link>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface-light transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Product
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Updates</h2>
          {recentProducts.length === 0 ? (
            <p className="text-sm text-muted">No products yet.</p>
          ) : (
            <div className="space-y-3">
              {recentProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/admin/products/${product.id}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-surface-light transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {product.title}
                    </p>
                    <p className="text-xs text-muted">{product.category}</p>
                  </div>
                  <span className="ml-4 shrink-0 text-xs text-muted">
                    {formatDate(product.updatedAt)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
