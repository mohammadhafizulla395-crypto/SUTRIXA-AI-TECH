"use client";

import { Search, Eye, Code, ShoppingCart, Download } from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Choose a Website",
    description:
      "Browse our curated collection and find the perfect template for your project.",
    icon: Search,
  },
  {
    step: "02",
    title: "Explore the Design",
    description:
      "Preview the live demo, inspect the layout, and see how it looks on every screen size.",
    icon: Eye,
  },
  {
    step: "03",
    title: "View Technology & Details",
    description:
      "Review the tech stack, features, and architecture to ensure it fits your needs.",
    icon: Code,
  },
  {
    step: "04",
    title: "Request the Resource",
    description:
      "Click Get This Resource and follow the simple purchase process to acquire the template.",
    icon: ShoppingCart,
  },
  {
    step: "05",
    title: "Receive the Source Code",
    description:
      "Get instant access to the complete source code and all assets. Start building immediately.",
    icon: Download,
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-surface px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-foreground">How It Works</h2>
          <p className="mt-4 text-muted">
            Five simple steps to get started
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-8 top-0 hidden h-full w-px bg-border md:block" style={{ left: "calc(2rem + 1px)" }} />

          <div className="space-y-8">
            {steps.map((item) => (
              <div key={item.step} className="relative flex items-start gap-6">
                <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-accent/20 bg-accent/5">
                  <item.icon size={24} className="text-accent" />
                </div>
                <div className="pt-2">
                  <div className="mb-1 text-xs font-semibold text-accent">
                    STEP {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
