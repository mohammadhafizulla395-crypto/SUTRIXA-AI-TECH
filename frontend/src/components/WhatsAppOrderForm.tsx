"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { MessageCircle } from "lucide-react";

// TODO: Set the receiving WhatsApp number (full international format, no "+").
// Example: Indian number 98765 43210 -> "919876543210"
const BUSINESS_WHATSAPP = "919100527275";

export default function WhatsAppOrderForm({ product }: { product: Product }) {
  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");

  const amount = formatPrice(product.price, product.currency);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const name = fullName.trim();
    const phone = whatsapp.trim();
    const mail = email.trim();

    if (!name) {
      setError("Please enter your full name.");
      return;
    }
    if (!phone) {
      setError("Please enter your WhatsApp number.");
      return;
    }
    if (!mail) {
      setError("Please enter your email address.");
      return;
    }
    if (!agreed) {
      setError("Please agree to the order to continue.");
      return;
    }

    const optionalMessage = message.trim()
      ? `\n\nMessage: ${message.trim()}`
      : "";
    const text =
      `New order request for ${product.title}.\n\n` +
      `Product: ${product.title}\n` +
      `Amount: ${amount}\n\n` +
      `Full Name: ${name}\n` +
      `WhatsApp Number: ${phone}\n` +
      `Email: ${mail}` +
      optionalMessage;

    const url = `https://wa.me/${BUSINESS_WHATSAPP}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-xl font-bold text-foreground">
        Get the {product.title} Source Code
      </h2>
      <p className="mt-2 text-sm text-muted">
        Complete the details below and submit your request. Your order opens in
        WhatsApp, where the payment is handled manually before delivery.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Step 1 - Your Order */}
        <div>
          <div className="mb-3 flex items-center gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-background">
              1
            </span>
            <h3 className="text-sm font-semibold text-foreground">
              Your Order
            </h3>
          </div>

          <div className="overflow-hidden rounded-lg border border-border bg-surface-light">
            <div className="flex items-center gap-4 p-4">
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md bg-background">
                {product.thumbnail ? (
                  <Image
                    src={product.thumbnail}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted">
                    No Preview
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {product.title}
                </p>
                <p className="mt-1 text-xs text-muted">
                  Premium {product.category} Website Source Code
                </p>
              </div>
              <div className="shrink-0 rounded-lg bg-accent/10 px-3 py-1.5 text-sm font-bold text-background">
                {amount}
              </div>
            </div>
            <div className="border-t border-border px-4 py-3 text-xs text-muted">
              You are ordering the {product.title} source code for {amount}{" "}
              (one-time). After you submit your details, we will continue the
              payment process with you on WhatsApp (UPI / PhonePe).
            </div>
          </div>
        </div>

        {/* Step 2 - Your Details */}
        <div>
          <div className="mb-3 flex items-center gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-background">
              2
            </span>
            <h3 className="text-sm font-semibold text-foreground">
              Your Details
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                WhatsApp Number <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Your WhatsApp number with country code"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Email Address <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Optional Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Any questions or notes for us (optional)"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors resize-y"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border bg-surface text-accent focus:ring-accent focus:ring-offset-0"
          />
          <span className="text-xs text-muted">
            By submitting, you agree to the {amount} order and will continue the
            payment on WhatsApp.
          </span>
        </label>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-background transition-colors hover:bg-accent-dim"
        >
          <MessageCircle size={16} />
          Submit &amp; Continue on WhatsApp
        </button>

        <p className="text-xs text-muted">
          Payment is handled manually on WhatsApp and verified before
          source-code delivery. Your details are only placed into the WhatsApp
          message when you submit this form.
        </p>
      </form>
    </div>
  );
}
