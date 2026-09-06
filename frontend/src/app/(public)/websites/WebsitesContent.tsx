"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import EmptyState from "@/components/EmptyState";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getPublishedProducts, getCategories } from "@/lib/api";
import { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function WebsitesContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async (category: string, query: string) => {
    setLoading(true);
    try {
      const cat = category === "All" ? undefined : category;
      const result = await getPublishedProducts(cat, query || undefined);
      setProducts(result);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(selectedCategory, search);
    }, 0);
    return () => clearTimeout(timer);
  }, [selectedCategory, search, fetchProducts]);

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  return (
    <section className="px-6 pb-24 pt-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground">
            WEBSITE COLLECTION
          </h1>
          <p className="mt-2 text-muted">
            Browse our curated selection of premium digital products
          </p>
        </div>

        <div className="relative mb-8">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-card py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted focus:border-accent/50 focus:outline-none"
          />
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory("All")}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              selectedCategory === "All"
                ? "bg-accent text-background"
                : "border border-border bg-card text-muted hover:text-foreground"
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                selectedCategory === cat
                  ? "bg-accent text-background"
                  : "border border-border bg-card text-muted hover:text-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : products.length === 0 ? (
          <EmptyState
            title="No products found"
            description="Try adjusting your search or filter to find what you're looking for."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
