"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getAdminProduct, updateProduct, updateProductStatus, deleteProduct, uploadThumbnail } from "@/lib/api";
import { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import LoadingSpinner from "@/components/LoadingSpinner";

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

export default function AdminProductEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [techInput, setTechInput] = useState("");
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [thumbnailError, setThumbnailError] = useState("");

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
    status: "draft" as Product["status"],
    sortOrder: 0,
  });

  const [slugEdited, setSlugEdited] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (typeof window === "undefined") return;
      const token = localStorage.getItem("sutrixa_admin_token");
      if (!token) return;
      try {
        const data = await getAdminProduct(token, id);
        if (data) {
          setProduct(data);
          setForm({
            title: data.title,
            slug: data.slug,
            description: data.description,
            category: data.category,
            price: data.price,
            currency: data.currency,
            thumbnail: data.thumbnail,
            previewRoute: data.previewRoute,
            featured: data.featured,
            status: data.status,
            sortOrder: data.sortOrder,
          });
          setTechInput(data.technologies.join(", "));
        }
      } catch {
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

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

  const handleSave = async () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("sutrixa_admin_token");
    if (!token) return;

    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const technologies = techInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const ok = await updateProduct(token, id, {
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
        sortOrder: Number(form.sortOrder),
      });

      if (ok) {
        setSuccess("Product saved successfully");
      } else {
        setError("Failed to save product");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("sutrixa_admin_token");
    if (!token) return;

    setStatusChanging(true);
    setError("");
    setSuccess("");

    try {
      const ok = await updateProductStatus(token, id, newStatus);
      if (ok) {
        setForm((prev) => ({ ...prev, status: newStatus as Product["status"] }));
        setProduct((prev) => (prev ? { ...prev, status: newStatus as Product["status"] } : prev));
        setSuccess(`Product ${newStatus === "published" ? "published" : newStatus === "archived" ? "archived" : "unpublished"} successfully`);
      } else {
        setError("Failed to change status");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setStatusChanging(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product? This cannot be undone.")) return;
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("sutrixa_admin_token");
    if (!token) return;

    try {
      const ok = await deleteProduct(token, id);
      if (ok) {
        router.push("/admin/products");
      } else {
        setError("Failed to delete product");
      }
    } catch {
      setError("Something went wrong");
    }
  };

  const handleThumbnailUpload = async (file: File) => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("sutrixa_admin_token");
    if (!token) return;
    if (!form.slug.trim()) {
      setThumbnailError("Save the slug first, then upload the thumbnail.");
      return;
    }

    setThumbnailUploading(true);
    setThumbnailError("");
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        const uploaded = await uploadThumbnail(token, form.slug, dataUrl);
        if (uploaded) {
          setForm((prev) => ({ ...prev, thumbnail: uploaded }));
          setSuccess("Thumbnail uploaded successfully. Remember to save changes.");
        } else {
          setThumbnailError("Upload failed. Any image type is accepted, up to 50MB.");
        }
        setThumbnailUploading(false);
      };
      reader.onerror = () => {
        setThumbnailError("Could not read the selected image.");
        setThumbnailUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setThumbnailError("Upload failed.");
      setThumbnailUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="space-y-4">
        <Link href="/admin/products" className="text-sm text-accent hover:underline">
          &larr; Back to Products
        </Link>
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          Product not found.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/products" className="text-sm text-accent hover:underline">
            &larr; Products
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-foreground">Edit Product</h1>
        </div>
        <button
          onClick={handleDelete}
          className="rounded-lg border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          Delete
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-400">
          {success}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          {/* Title */}
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

          {/* Slug */}
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

          {/* Description */}
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

          {/* Category & Price Row */}
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

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Thumbnail Image</label>
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-border bg-surface p-3">
              {form.thumbnail ? (
                <img
                  src={form.thumbnail}
                  alt="Thumbnail preview"
                  className="h-16 w-28 shrink-0 rounded-md border border-border bg-background object-cover"
                />
              ) : (
                <div className="flex h-16 w-28 shrink-0 items-center justify-center rounded-md border border-border bg-background text-xs text-muted">
                  No image
                </div>
              )}
              <div className="min-w-0 flex-1">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-accent/90">
                  {thumbnailUploading ? "Uploading..." : "Upload Image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={thumbnailUploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleThumbnailUpload(file);
                    }}
                  />
                </label>
                <p className="mt-1.5 text-xs text-muted">
                  Pick from your laptop or phone. Any image type is accepted, up
                  to 50MB.
                </p>
              </div>
            </div>
            {thumbnailError && (
              <p className="mt-1.5 text-xs text-red-400">{thumbnailError}</p>
            )}

            <label className="mt-3 block text-sm font-medium text-foreground mb-1.5">
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

          {/* Preview Route */}
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

          {/* Technologies */}
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
            {techInput && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {techInput
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .map((tech, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent"
                    >
                      {tech}
                    </span>
                  ))}
              </div>
            )}
          </div>

          {/* Sort Order */}
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

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h3 className="text-sm font-medium text-foreground">Status</h3>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                  form.status === "published" && "bg-green-500/10 text-green-400",
                  form.status === "draft" && "bg-yellow-500/10 text-yellow-400",
                  form.status === "archived" && "bg-gray-500/10 text-gray-400"
                )}
              >
                {form.status}
              </span>
            </div>
            <div className="space-y-2">
              {form.status !== "published" && (
                <button
                  onClick={() => handleStatusChange("published")}
                  disabled={statusChanging}
                  className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {statusChanging ? "Publishing..." : "Publish"}
                </button>
              )}
              {form.status === "published" && (
                <button
                  onClick={() => handleStatusChange("draft")}
                  disabled={statusChanging}
                  className="w-full rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-light transition-colors disabled:opacity-50"
                >
                  {statusChanging ? "Unpublishing..." : "Unpublish"}
                </button>
              )}
              {form.status !== "archived" && (
                <button
                  onClick={() => handleStatusChange("archived")}
                  disabled={statusChanging}
                  className="w-full rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:bg-surface-light hover:text-foreground transition-colors disabled:opacity-50"
                >
                  {statusChanging ? "Archiving..." : "Archive"}
                </button>
              )}
            </div>
          </div>

          {/* Featured */}
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

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-background hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          {/* Meta */}
          <div className="rounded-xl border border-border bg-card p-5 text-xs text-muted space-y-1">
            <p>ID: {product.id}</p>
            <p>Created: {new Date(product.createdAt).toLocaleString()}</p>
            <p>Updated: {new Date(product.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
