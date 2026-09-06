"use client";

import { useEffect, useState } from "react";
import { getCategories, getPublishedProducts } from "@/lib/api";
import CategoryCard from "@/components/CategoryCard";
import EmptyState from "@/components/EmptyState";
import LoadingSpinner from "@/components/LoadingSpinner";

interface CategoryInfo {
  name: string;
  count: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [cats, products] = await Promise.all([
          getCategories(),
          getPublishedProducts(),
        ]);
        const categoryMap = cats.map((cat) => ({
          name: cat,
          count: products.filter((p) => p.category === cat).length,
        }));
        setCategories(categoryMap);
      } catch {
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <section className="px-6 pb-24 pt-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground">
            BROWSE BY CATEGORY
          </h1>
          <p className="mt-2 text-muted">
            Find the perfect product for your project
          </p>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : categories.length === 0 ? (
          <EmptyState
            title="No categories yet"
            description="Products will be organized into categories once they are published."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <CategoryCard
                key={cat.name}
                name={cat.name}
                productCount={cat.count}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
