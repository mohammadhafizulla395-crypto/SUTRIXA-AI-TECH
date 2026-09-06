"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getProductBySlug } from "@/lib/api";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import LoadingSpinner from "@/components/LoadingSpinner";
import WhatsAppOrderForm from "@/components/WhatsAppOrderForm";
import { ChevronRight, ExternalLink } from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getProductBySlug(slug);
        if (data) {
          setProduct(data);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    if (slug) load();
  }, [slug]);

  if (loading) {
    return (
      <section className="px-6 pb-24 pt-32">
        <div className="mx-auto max-w-5xl">
          <LoadingSpinner />
        </div>
      </section>
    );
  }

  if (notFound || !product) {
    return (
      <section className="px-6 pb-24 pt-32">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="text-3xl font-bold text-foreground">
            Product Not Found
          </h1>
          <p className="mt-4 text-muted">
            The product you are looking for does not exist or has been removed.
          </p>
          <Link
            href="/websites"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-accent-dim"
          >
            Browse Collection
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 pb-24 pt-32">
      <div className="mx-auto max-w-5xl">
        <nav className="mb-8 flex items-center gap-2 text-sm text-muted">
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <ChevronRight size={14} />
          <Link
            href="/websites"
            className="transition-colors hover:text-foreground"
          >
            Websites
          </Link>
          <ChevronRight size={14} />
          <span className="text-foreground">{product.title}</span>
        </nav>

        <div className="mb-8 overflow-hidden rounded-2xl border border-border bg-card">
          {product.thumbnail ? (
            <div className="relative aspect-video w-full">
              <Image
                src={product.thumbnail}
                alt={product.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center bg-surface-light text-muted">
              No Preview Available
            </div>
          )}
        </div>

        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <span className="mb-3 inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              {product.category}
            </span>
            <h1 className="mt-3 text-3xl font-bold text-foreground">
              {product.title}
            </h1>
            <p className="mt-4 text-muted">{product.description}</p>

            <div className="mt-8">
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                Technologies Used
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-lg border border-border bg-surface-light px-3 py-1 text-xs text-muted"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                Features
              </h3>
              <ul className="space-y-2">
                {product.technologies.map((tech) => (
                  <li
                    key={tech}
                    className="flex items-center gap-2 text-sm text-muted"
                  >
                    <span className="h-1 w-1 rounded-full bg-accent" />
                    {tech} powered implementation
                  </li>
                ))}
                <li className="flex items-center gap-2 text-sm text-muted">
                  <span className="h-1 w-1 rounded-full bg-accent" />
                  Clean, production-ready code
                </li>
                <li className="flex items-center gap-2 text-sm text-muted">
                  <span className="h-1 w-1 rounded-full bg-accent" />
                  Fully responsive design
                </li>
                <li className="flex items-center gap-2 text-sm text-muted">
                  <span className="h-1 w-1 rounded-full bg-accent" />
                  Easy to customize and extend
                </li>
              </ul>
            </div>

            <div id="order-now" className="mt-8 scroll-mt-28">
              <WhatsAppOrderForm product={product} />
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-28 rounded-xl border border-border bg-card p-6">
              <div className="mb-2 text-3xl font-bold text-foreground">
                {formatPrice(product.price, product.currency)}
              </div>
              <p className="mb-6 text-sm text-muted">
                One-time purchase. Lifetime access.
              </p>

              {(() => {
                const previewRoute = product.previewRoute?.trim();
                if (
                  previewRoute &&
                  (previewRoute.startsWith("http://") ||
                    previewRoute.startsWith("https://"))
                ) {
                  return (
                    <a
                      href={previewRoute}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface-light px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface"
                    >
                      <ExternalLink size={16} />
                      Live Demo
                    </a>
                  );
                }
                return (
                  <Link
                    href={previewRoute || `/demo/${product.slug}`}
                    className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface-light px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface"
                  >
                    <ExternalLink size={16} />
                    Live Demo
                  </Link>
                );
              })()}

              <Link
                href="#order-now"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-background transition-colors hover:bg-accent-dim"
              >
                Get This Resource
              </Link>

              <div className="mt-6 space-y-3 border-t border-border pt-6 text-sm text-muted">
                <div className="flex justify-between">
                  <span>Category</span>
                  <span className="text-foreground">{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status</span>
                  <span className="capitalize text-foreground">
                    {product.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Updated</span>
                  <span className="text-foreground">
                    {new Date(product.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
