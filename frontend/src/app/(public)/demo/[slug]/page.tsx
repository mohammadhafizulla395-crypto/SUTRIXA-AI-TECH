"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getProductBySlug } from "@/lib/api";
import { Product } from "@/lib/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ArrowLeft } from "lucide-react";

export default function DemoPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getProductBySlug(slug);
        if (data) {
          setProduct(data);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    if (slug) load();
  }, [slug]);

  if (loading) {
    return (
      <section className="flex min-h-screen items-center justify-center px-6 pt-16">
        <LoadingSpinner />
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="flex min-h-screen flex-col items-center justify-center px-6 pt-16 text-center">
        <h1 className="text-2xl font-bold text-foreground">
          Preview Not Available
        </h1>
        <p className="mt-3 text-muted">
          The product preview could not be loaded.
        </p>
        <Link
          href="/websites"
          className="mt-6 inline-flex items-center gap-2 text-sm text-accent hover:text-accent-dim"
        >
          <ArrowLeft size={16} />
          Back to Collection
        </Link>
      </section>
    );
  }

  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-6 pt-16">
      <div className="relative mx-auto w-full max-w-4xl">
        <div className="absolute -inset-px rounded-2xl border border-border bg-gradient-to-b from-accent/5 to-transparent" />

        <div className="relative rounded-2xl border border-border bg-card p-12 text-center">
          <div className="mb-6 inline-flex items-center gap-2">
            <span className="text-lg font-bold text-foreground">SUTRIXA</span>
            <span className="text-lg font-bold text-accent">AI</span>
          </div>

          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-accent/20 bg-accent/5">
            <div className="h-4 w-4 animate-pulse rounded-full bg-accent" />
          </div>

          <h1 className="text-2xl font-bold text-foreground">
            {product.title}
          </h1>

          <div className="mt-3 flex items-center justify-center gap-3 text-sm text-muted">
            <span className="rounded-full bg-accent/10 px-3 py-0.5 text-xs text-accent">
              {product.category}
            </span>
            <span>•</span>
            <span>{product.technologies.join(", ")}</span>
          </div>

          <p className="mx-auto mt-8 max-w-md text-muted">
            Preview is being prepared. Check back soon to see this resource in
            action.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:-0.3s]" />
            <div className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:-0.15s]" />
            <div className="h-2 w-2 animate-bounce rounded-full bg-accent" />
          </div>

          <Link
            href={`/websites/${product.slug}`}
            className="mt-10 inline-flex items-center gap-2 text-sm text-accent transition-colors hover:text-accent-dim"
          >
            <ArrowLeft size={16} />
            Back to Details
          </Link>
        </div>
      </div>
    </section>
  );
}
