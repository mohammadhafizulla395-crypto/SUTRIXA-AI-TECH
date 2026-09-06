"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createProduct } from "@/lib/api";

const CATEGORIES = [
  "Portfolio",
  "Business",
  "Agency",
  "Restaurant",
  "Fitness",
  "Healthcare",
  "Education",
  "SaaS",
  "E-commerce",
  "Creative",
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminProductNewPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [techInput, setTechInput] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    category: "Portfolio",
    price: 0,
    currency: "USD",
    thumbnail: "",
    previewRoute: "",
    featured: false,
    sortOrder: 0,
  });

  const handleTitleChange = useCallback(
    (value: string) => {
      setForm((prev) => ({
        ...prev,
        title: value,
        slug: slugEdited ? prev.slug : slugify(value),
      }));
    },
    [slugEdited]
  );

  const handleCreate = async () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("sutrixa_admin_token");
    if (!token) return;

    if (!form.title.trim() || !form.slug.trim()) {
      setError("Title and slug are required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const technologies = techInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const created = await createProduct(token, {
        title: form.title,
        slug: form.slug,
        description: form.description,
        category: form.category,
        price: Number(form.price),
        currency: form.currency,
        thumbnail: form.thumbnail,
        previewRoute: form.previewRoute,
        technologies,
        featured: form.featured,
        status: "draft",
        sortOrder: Number(form.sortOrder),
      });

      if (created) {
        router.push(`/admin/products/${created.id}`);
      } else {
        setError("Failed to create product. A product with this slug may already exist.");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Link href="/admin/products" className="text-sm text-accent hover:underline">
          &larr; Products
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-foreground">New Product</h1>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              placeholder="Product title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Slug</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => {
                setSlugEdited(true);
                setForm((prev) => ({ ...prev, slug: e.target.value }));
              }}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground font-mono placeholder:text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              placeholder="product-slug"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={5}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors resize-y"
              placeholder="Product description..."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Price</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
                min={0}
                step={0.01}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Currency</label>
              <select
                value={form.currency}
                onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value }))}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Thumbnail URL (optional)
            </label>
            <input
              type="text"
              value={form.thumbnail}
              onChange={(e) => setForm((prev) => ({ ...prev, thumbnail: e.target.value }))}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground font-mono placeholder:text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              placeholder="/thumbnails/product.png"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Preview Route</label>
            <input
              type="text"
              value={form.previewRoute}
              onChange={(e) => setForm((prev) => ({ ...prev, previewRoute: e.target.value }))}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground font-mono placeholder:text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              placeholder="/preview/product-slug"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Technologies</label>
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              placeholder="React, Next.js, Tailwind CSS"
            />
            <p className="mt-1 text-xs text-muted">Comma-separated list</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Sort Order</label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: Number(e.target.value) }))}
              min={0}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm((prev) => ({ ...prev, featured: e.target.checked }))}
                className="h-4 w-4 rounded border-border bg-surface text-accent focus:ring-accent focus:ring-offset-0"
              />
              <div>
                <span className="text-sm font-medium text-foreground">Featured</span>
                <p className="text-xs text-muted">Show on homepage</p>
              </div>
            </label>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 text-xs text-muted">
            <p>
              New products are created as <span className="text-foreground">draft</span> and only become
              publicly visible after you publish them.
            </p>
          </div>

          <button
            onClick={handleCreate}
            disabled={saving}
            className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-background hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Product"}
          </button>
        </div>
      </div>
    </div>
  );
}