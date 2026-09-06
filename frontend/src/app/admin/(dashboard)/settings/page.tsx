"use client";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted">Administrative configuration</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Account
        </h2>
        <p className="text-sm text-muted">
          Admin credentials are managed through backend environment variables
          and are not stored in the frontend.
        </p>
      </div>
    </div>
  );
}
