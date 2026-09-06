import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-foreground">SUTRIXA</span>
              <span className="text-lg font-bold text-accent">AI</span>
            </div>
            <p className="mt-1 text-xs font-semibold tracking-wider text-accent">
              BUILD WITH AI
            </p>
            <p className="mt-3 text-sm text-muted">
              Premium digital products and resources, crafted for modern builders.
            </p>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              Explore
            </h3>
            <div className="flex flex-col gap-2">
              <Link
                href="/websites"
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                Websites
              </Link>
              <Link
                href="/categories"
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                Categories
              </Link>
              <Link
                href="/about"
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                About
              </Link>
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              Support
            </h3>
            <div className="flex flex-col gap-2">
              <Link
                href="/contact"
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                Contact
              </Link>
              <span className="text-sm text-muted">support@sutrixa.ai</span>
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              Legal
            </h3>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-muted">Privacy Policy</span>
              <span className="text-sm text-muted">Terms of Service</span>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-6 text-center text-sm text-muted">
          &copy; {new Date().getFullYear()} SUTRIXA AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
