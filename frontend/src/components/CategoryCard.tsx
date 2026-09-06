import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface CategoryCardProps {
  name: string;
  productCount: number;
}

export default function CategoryCard({ name, productCount }: CategoryCardProps) {
  return (
    <Link
      href={`/websites?category=${encodeURIComponent(name)}`}
      className="group flex items-center justify-between rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-accent/30 hover:shadow-[0_0_30px_rgba(0,212,255,0.06)]"
    >
      <div>
        <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-accent">
          {name}
        </h3>
        <p className="mt-1 text-sm text-muted">
          {productCount} {productCount === 1 ? "website" : "websites"}
        </p>
      </div>
      <ArrowRight className="h-5 w-5 text-muted transition-all group-hover:translate-x-1 group-hover:text-accent" />
    </Link>
  );
}
