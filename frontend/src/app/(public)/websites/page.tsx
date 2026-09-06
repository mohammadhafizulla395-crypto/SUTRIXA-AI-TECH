import { Suspense } from "react";
import WebsitesContent from "./WebsitesContent";

export default function WebsitesPage() {
  return (
    <Suspense
      fallback={
        <section className="px-6 pb-24 pt-32">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10">
              <h1 className="text-3xl font-bold text-foreground">
                WEBSITE COLLECTION
              </h1>
            </div>
            <div className="flex items-center justify-center py-24">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
            </div>
          </div>
        </section>
      }
    >
      <WebsitesContent />
    </Suspense>
  );
}
