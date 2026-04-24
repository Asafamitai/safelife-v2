"use client";

import { useState } from "react";

type Role = "family" | "senior" | "other";
type Status = "idle" | "loading" | "success" | "error";

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "family", label: "I'm family" },
  { value: "senior", label: "I'm a senior" },
  { value: "other", label: "Something else" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function WaitlistForm({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("family");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const onDark = variant === "dark";
  const formspreeId = process.env.NEXT_PUBLIC_FORMSPREE_ID;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;

    if (!EMAIL_RE.test(email.trim())) {
      setStatus("error");
      setMessage("Please enter a valid email.");
      return;
    }

    setStatus("loading");
    setMessage(null);

    try {
      if (formspreeId) {
        const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            role,
            source: "safelife-waitlist",
          }),
        });
        if (!res.ok) {
          setStatus("error");
          setMessage("Something went wrong. Please try again.");
          return;
        }
      } else {
        console.log("[waitlist] demo mode (no NEXT_PUBLIC_FORMSPREE_ID):", {
          email: email.trim(),
          role,
        });
        await new Promise((r) => setTimeout(r, 400));
      }

      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div
        className={`rounded-2xl border p-6 ${
          onDark
            ? "border-white/20 bg-white/10 text-white"
            : "border-line bg-ok-bg text-ok-ink"
        }`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          <span aria-hidden className="text-[24px]">
            ✅
          </span>
          <div>
            <p className="text-[16px] font-bold">You&apos;re on the list.</p>
            <p
              className={`mt-1 text-[14px] leading-[1.5] ${
                onDark ? "text-white/80" : "text-ok-ink/80"
              }`}
            >
              We&apos;ll reach out as soon as early access opens. Thanks for the
              interest.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3" noValidate>
      <div className="flex flex-wrap gap-2">
        {ROLE_OPTIONS.map((opt) => {
          const selected = role === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRole(opt.value)}
              aria-pressed={selected}
              className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors ${
                selected
                  ? onDark
                    ? "border-white bg-white text-ink"
                    : "border-ink bg-ink text-white"
                  : onDark
                    ? "border-white/30 bg-white/5 text-white/80 hover:bg-white/10"
                    : "border-line bg-white text-ink-2 hover:bg-panel"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="waitlist-email" className="sr-only">
          Email address
        </label>
        <input
          id="waitlist-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className={`min-h-[48px] flex-1 rounded-[14px] border px-4 text-[15px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
            onDark
              ? "border-white/30 bg-white/5 text-white placeholder:text-white/50 focus-visible:ring-white focus-visible:ring-offset-ink"
              : "border-line bg-white text-ink placeholder:text-muted focus-visible:ring-accent"
          }`}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className={`min-h-[48px] rounded-[14px] px-6 text-[15px] font-semibold transition-all hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
            onDark
              ? "bg-white text-ink focus-visible:ring-white focus-visible:ring-offset-ink"
              : "bg-ink text-white focus-visible:ring-accent"
          }`}
        >
          {status === "loading" ? "Joining…" : "Join the waitlist →"}
        </button>
      </div>

      {status === "error" && message && (
        <p
          role="alert"
          className={`text-[13px] font-medium ${
            onDark ? "text-[#FFB4B4]" : "text-scam-ink"
          }`}
        >
          {message}
        </p>
      )}
      <p
        className={`text-[12px] ${
          onDark ? "text-white/60" : "text-muted"
        }`}
      >
        No spam. One email when early access opens.
      </p>
    </form>
  );
}
