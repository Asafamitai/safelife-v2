import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-[760px] px-6 py-16">
      <Link
        href="/"
        className="text-[13px] font-semibold text-accent hover:underline"
      >
        ← Back
      </Link>
      <h1 className="mt-6 text-[36px] font-extrabold tracking-tight text-ink">
        Privacy
      </h1>
      <p className="mt-5 text-[16px] leading-[1.6] text-ink-2">
        SafeLife is opt-in. No location tracking, no live audio or video,
        no ad targeting. Each connected service (pharmacy, health device,
        carrier) is enabled one at a time and can be disconnected any time
        from the family app.
      </p>
      <p className="mt-4 text-[16px] leading-[1.6] text-ink-2">
        This is a prototype. The full privacy policy ships with v1.
      </p>
    </main>
  );
}
