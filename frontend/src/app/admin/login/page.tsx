"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminLogin, verifyOwner } from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [verificationToken, setVerificationToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("sutrixa_admin_token");
    if (token) {
      router.replace("/admin/dashboard");
    }
  }, [router]);

  const resetToStep1 = () => {
    setVerificationToken("");
    setSecret("");
    setError("");
    setStep(1);
  };

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const result = await adminLogin(email, password);
      if (result.verificationToken) {
        setVerificationToken(result.verificationToken);
        setSecret("");
        setStep(2);
      } else {
        setError(result.error || "Invalid admin credentials.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!secret) {
      setError("Owner verification key is required");
      return;
    }

    setLoading(true);
    try {
      const result = await verifyOwner(verificationToken, secret);
      if (result.token) {
        localStorage.setItem("sutrixa_admin_token", result.token);
        router.push("/admin/dashboard");
      } else {
        setError(result.error || "Verification failed");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
            <span className="text-lg font-bold text-background">S</span>
          </div>
          <h1 className="text-xl font-semibold text-foreground">SUTRIXA AI</h1>
          <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-muted">
            Private Admin
          </p>
          <p className="mt-3 text-xs uppercase tracking-widest text-muted/70">
            Step {step} of 2
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleStep1} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                Admin email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                placeholder="admin email"
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                placeholder="Enter password"
                autoComplete="current-password"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-background hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Verifying...
                </>
              ) : (
                "Continue"
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-surface p-4">
              <h2 className="text-sm font-semibold text-foreground">Owner Verification</h2>
              <p className="mt-1 text-xs text-muted">
                Enter your private owner verification key.
              </p>
            </div>

            <form onSubmit={handleStep2} className="space-y-4">
              <div>
                <label htmlFor="secret" className="block text-sm font-medium text-foreground mb-1.5">
                  Owner verification key
                </label>
                <input
                  id="secret"
                  type="password"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                  placeholder="Enter owner verification key"
                  autoComplete="off"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-background hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Enter Admin"
                )}
              </button>

              <button
                type="button"
                onClick={resetToStep1}
                disabled={loading}
                className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-muted hover:text-foreground transition-colors disabled:opacity-50"
              >
                Back
              </button>
            </form>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-muted">
          Authorized personnel only.
        </p>
      </div>
    </div>
  );
}