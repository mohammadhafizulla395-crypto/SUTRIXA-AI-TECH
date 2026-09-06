import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/websites/${product.slug}`}
      className="group block overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5"
    >
      <div className="relative aspect-video w-full bg-surface-light">
        {product.thumbnail ? (
          <Image
            src={product.thumbnail}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            No Preview
          </div>
        )}
        <div className="absolute left-3 top-3">
          <span className="rounded-full bg-background/80 px-3 py-1 text-xs font-medium text-accent backdrop-blur-sm">
            {product.category}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-base font-semibold text-foreground transition-colors group-hover:text-accent">
          {product.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted">
          {product.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {product.technologies.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="rounded-md bg-surface-light px-2 py-0.5 text-xs text-muted"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-foreground">
            {formatPrice(product.price, product.currency)}
          </span>
          <span className="text-xs text-muted transition-colors group-hover:text-accent">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
}
