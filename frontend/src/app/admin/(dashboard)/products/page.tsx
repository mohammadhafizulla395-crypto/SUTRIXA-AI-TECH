"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { getAdminProducts, updateProductStatus } from "@/lib/api";
import { Product } from "@/lib/types";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";

type SortKey = "title" | "category" | "price" | "status" | "updatedAt";

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  return (
    <span className={cn("ml-1 inline-flex flex-col", active ? "text-accent" : "text-muted/50")}>
      <svg className={cn("h-2.5 w-2.5", active && dir === "asc" && "text-accent")} viewBox="0 0 8 5" fill="currentColor">
        <path d="M4 0L8 5H0z" />
      </svg>
      <svg className={cn("h-2.5 w-2.5 -mt-0.5", active && dir === "desc" && "text-accent")} viewBox="0 0 8 5" fill="currentColor">
        <path d="M4 5L0 0h8z" />
      </svg>
    </span>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (typeof window === "undefined") return;
      const token = localStorage.getItem("sutrixa_admin_token");
      if (!token) return;
      try {
        const data = await getAdminProducts(token);
        setProducts(data);
      } catch {
        // empty
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filtered = useMemo(() => {
    let list = products;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "title") cmp = a.title.localeCompare(b.title);
      else if (sortKey === "category") cmp = a.category.localeCompare(b.category);
      else if (sortKey === "price") cmp = a.price - b.price;
      else if (sortKey === "status") cmp = a.status.localeCompare(b.status);
      else if (sortKey === "updatedAt")
        cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [products, search, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("sutrixa_admin_token");
    if (!token) return;
    setTogglingId(id);
    try {
      const ok = await updateProductStatus(token, id, status);
      if (ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: status as Product["status"] } : p))
        );
      }
    } catch {
      // ignore
    } finally {
      setTogglingId(null);
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("sutrixa_admin_token");
    if (!token) return;
    setTogglingId(product.id);
    try {
      const { updateProduct } = await import("@/lib/api");
      const ok = await updateProduct(token, product.id, { featured: !product.featured });
      if (ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, featured: !p.featured } : p))
        );
      }
    } catch {
      // ignore
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="mt-1 text-sm text-muted">{products.length} total products</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-background hover:bg-accent/90 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Product
        </Link>
      </div>

      <div className="relative max-w-sm">
        <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No products found"
          description={search ? "Try a different search term." : "Get started by adding your first product."}
          action={
            !search ? (
              <Link
                href="/admin/products/new"
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-background hover:bg-accent/90 transition-colors"
              >
                Add Product
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="px-4 py-3 font-medium text-muted">Product</th>
                <th className="px-4 py-3 font-medium text-muted cursor-pointer select-none" onClick={() => toggleSort("category")}>
                  <span className="inline-flex items-center">Category <SortIcon active={sortKey === "category"} dir={sortDir} /></span>
                </th>
                <th className="px-4 py-3 font-medium text-muted cursor-pointer select-none" onClick={() => toggleSort("price")}>
                  <span className="inline-flex items-center">Price <SortIcon active={sortKey === "price"} dir={sortDir} /></span>
                </th>
                <th className="px-4 py-3 font-medium text-muted cursor-pointer select-none" onClick={() => toggleSort("status")}>
                  <span className="inline-flex items-center">Status <SortIcon active={sortKey === "status"} dir={sortDir} /></span>
                </th>
                <th className="px-4 py-3 font-medium text-muted">Featured</th>
                <th className="px-4 py-3 font-medium text-muted cursor-pointer select-none" onClick={() => toggleSort("updatedAt")}>
                  <span className="inline-flex items-center">Updated <SortIcon active={sortKey === "updatedAt"} dir={sortDir} /></span>
                </th>
                <th className="px-4 py-3 font-medium text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-surface-light/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-surface border border-border">
                        {product.thumbnail ? (
                          <Image
                            src={product.thumbnail}
                            alt={product.title}
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="font-medium text-foreground hover:text-accent transition-colors truncate block"
                        >
                          {product.title}
                        </Link>
                        <p className="text-xs text-muted truncate">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{product.category}</td>
                  <td className="px-4 py-3 text-foreground font-medium">{formatPrice(product.price, product.currency)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        product.status === "published" && "bg-green-500/10 text-green-400",
                        product.status === "draft" && "bg-yellow-500/10 text-yellow-400",
                        product.status === "archived" && "bg-gray-500/10 text-gray-400"
                      )}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleFeatured(product)}
                      disabled={togglingId === product.id}
                      className="transition-colors disabled:opacity-50"
                    >
                      <svg
                        className={cn("h-5 w-5", product.featured ? "text-yellow-400" : "text-muted/30")}
                        fill={product.featured ? "currentColor" : "none"}
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                      </svg>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-muted">{formatDate(product.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="rounded p-1.5 text-muted hover:text-foreground hover:bg-surface-light transition-colors"
                        title="Edit"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </Link>
                      <button
                        onClick={() =>
                          handleStatusChange(
                            product.id,
                            product.status === "published" ? "draft" : "published"
                          )
                        }
                        disabled={togglingId === product.id}
                        className={cn(
                          "rounded p-1.5 transition-colors disabled:opacity-50",
                          product.status === "published"
                            ? "text-green-400 hover:bg-green-500/10"
                            : "text-muted hover:text-foreground hover:bg-surface-light"
                        )}
                        title={product.status === "published" ? "Unpublish" : "Publish"}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleStatusChange(product.id, "archived")}
                        disabled={togglingId === product.id || product.status === "archived"}
                        className="rounded p-1.5 text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-30"
                        title="Archive"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
