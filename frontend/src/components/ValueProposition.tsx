"use client";

import { Palette, Code2, Settings, UserCheck, DollarSign } from "lucide-react";

const values = [
  {
    icon: Palette,
    title: "Professional Design",
    description:
      "Pixel-perfect designs crafted for modern brands with attention to every detail.",
  },
  {
    icon: Code2,
    title: "Modern Technology",
    description:
      "Built with the latest web technologies and frameworks for optimal performance.",
  },
  {
    icon: Settings,
    title: "Ready to Customize",
    description:
      "Clean, well-documented code you can easily modify to match your requirements.",
  },
  {
    icon: UserCheck,
    title: "Developer Friendly",
    description:
      "Optimized for performance and developer experience with scalable architecture.",
  },
  {
    icon: DollarSign,
    title: "Affordable Resources",
    description:
      "Premium quality at prices that make sense. No subscriptions, one-time purchase.",
  },
];

export default function ValueProposition() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-foreground">
            Why Choose SUTRIXA AI
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted">
            We deliver premium quality digital products that save you time and
            elevate your projects.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {values.map((value) => (
            <div
              key={value.title}
              className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-accent/20"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <value.icon size={24} className="text-accent" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                {value.title}
              </h3>
              <p className="mt-2 text-sm text-muted">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
