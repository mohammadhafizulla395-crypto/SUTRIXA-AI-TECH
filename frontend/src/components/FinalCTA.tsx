import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-surface px-8 py-16 text-center sm:px-16 sm:py-20">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-20 -top-20 h-[300px] w-[300px] rounded-full bg-accent/5 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-[300px] w-[300px] rounded-full bg-accent/5 blur-3xl" />
          </div>

          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              READY TO BUILD SOMETHING{" "}
              <span className="text-accent">BETTER?</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted">
              Explore our collection of professionally designed websites and find
              the perfect starting point for your next project.
            </p>
            <div className="mt-8">
              <Link
                href="/websites"
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-8 py-3.5 text-sm font-semibold text-background transition-all hover:bg-accent/90 hover:shadow-[0_0_30px_rgba(0,212,255,0.3)]"
              >
                Explore Websites
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
