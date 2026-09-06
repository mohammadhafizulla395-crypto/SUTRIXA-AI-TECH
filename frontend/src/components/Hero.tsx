"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden px-6 pt-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,212,255,0.08)_0%,transparent_70%)]" />

      <div className="relative z-10 mx-auto max-w-5xl text-center">
        <div className="mb-6 inline-block rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-xs font-medium text-accent">
          AI-POWERED DIGITAL PRODUCTS
        </div>

        <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          BUILD YOUR{" "}
          <br className="hidden sm:block" />
          DIGITAL PRESENCE{" "}
          <br className="hidden sm:block" />
          WITH{" "}
          <span className="bg-gradient-to-r from-accent to-accent-dim bg-clip-text text-transparent">
            AI-READY WEBSITES
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
          Professionally designed websites for creators, businesses, agencies
          and modern digital brands.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/websites"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3.5 text-sm font-semibold text-background transition-colors hover:bg-accent-dim"
          >
            Explore Websites
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/websites"
            className="inline-flex items-center gap-2 rounded-full border border-border px-8 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-light"
          >
            View Collection
          </Link>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
    </section>
  );
}
