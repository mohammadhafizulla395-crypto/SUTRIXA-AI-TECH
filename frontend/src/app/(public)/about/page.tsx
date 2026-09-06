import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "About - SUTRIXA AI",
  description:
    "Learn about SUTRIXA AI and our mission to empower builders with premium digital products.",
};

const offerings = [
  {
    title: "Website Templates",
    description:
      "Modern, responsive templates built with cutting-edge frameworks and design systems.",
  },
  {
    title: "Source Code",
    description:
      "Production-ready codebases with clean architecture and comprehensive documentation.",
  },
  {
    title: "AI Prompts",
    description:
      "Curated prompt collections for AI-assisted development, design, and content creation.",
  },
  {
    title: "Digital Resources",
    description:
      "UI kits, design assets, tools, and resources to accelerate your workflow.",
  },
];

export default function AboutPage() {
  return (
    <section className="px-6 pb-24 pt-32">
      <div className="mx-auto max-w-4xl">
        <div className="mb-16 text-center">
          <h1 className="text-3xl font-bold text-foreground">
            ABOUT SUTRIXA AI
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
            Empowering builders with premium digital products, crafted with AI
            and designed for modern workflows.
          </p>
        </div>

        <div className="mb-20 space-y-16">
          <div>
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              Our Story
            </h2>
            <div className="space-y-4 text-muted">
              <p>
                SUTRIXA AI was born from a simple observation: builders spend too
                much time starting from scratch. Whether you are launching a
                startup, prototyping an idea, or building client projects, the
                process of setting up boilerplate, choosing design systems, and
                configuring infrastructure is repetitive and time-consuming.
              </p>
              <p>
                We set out to change that by creating a curated collection of
                premium digital products — each one built with modern tools,
                best practices, and a keen eye for design quality.
              </p>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              Our Mission
            </h2>
            <p className="text-muted">
              To accelerate the build process for developers, designers, and
              entrepreneurs by providing high-quality, production-ready digital
              resources. We believe that great products should start with great
              foundations.
            </p>
          </div>

          <div>
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              What We Offer
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {offerings.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-border bg-card p-6"
                >
                  <h3 className="text-base font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              Our Approach
            </h2>
            <div className="space-y-4 text-muted">
              <p>
                Every product in our collection goes through a rigorous process
                of design, development, and quality assurance. We use
                cutting-edge AI tools alongside traditional craftsmanship to
                ensure each resource meets our standards.
              </p>
              <p>
                We are a small team of builders, designers, and technologists
                who are passionate about creating tools that make a difference.
                Our products reflect the same quality we expect in our own
                projects.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/websites"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3 text-sm font-semibold text-background transition-colors hover:bg-accent-dim"
          >
            Explore Collection
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
