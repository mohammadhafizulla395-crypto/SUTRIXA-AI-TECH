"use client";

import { useEffect, useState } from "react";
import Hero from "@/components/Hero";
import ValueProposition from "@/components/ValueProposition";
import HowItWorks from "@/components/HowItWorks";
import WhySutrixa from "@/components/WhySutrixa";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import ProductCard from "@/components/ProductCard";
import EmptyState from "@/components/EmptyState";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getPublishedProducts, getCategories } from "@/lib/api";
import { Product } from "@/lib/types";
import Link from "next/link";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [allProducts, cats] = await Promise.all([
          getPublishedProducts(),
          getCategories(),
        ]);
        const featured = allProducts
          .sort((a, b) => b.sortOrder - a.sortOrder)
          .slice(0, 6);
        setProducts(featured);
        setCategories(cats);
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div>
      <Hero />
      <ValueProposition />

      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground">
                Latest Products
              </h2>
              <p className="mt-2 text-muted">
                Explore our newest additions
              </p>
            </div>
            <Link
              href="/websites"
              className="text-sm text-accent transition-colors hover:text-accent-dim"
            >
              View All →
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : products.length === 0 ? (
            <EmptyState
              title="New collection coming soon"
              description="We're curating amazing digital products. Check back soon!"
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

      {categories.length > 0 && (
        <section className="bg-surface px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-foreground">
                Browse by Category
              </h2>
              <p className="mt-2 text-muted">
                Find exactly what you need
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/websites?category=${encodeURIComponent(cat)}`}
                  className="rounded-full border border-border bg-card px-5 py-2 text-sm text-muted transition-colors hover:border-accent/30 hover:text-foreground"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <HowItWorks />
      <WhySutrixa />
      <FAQ />
      <FinalCTA />
    </div>
  );
}
