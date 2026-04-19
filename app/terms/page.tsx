import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-[760px] px-6 py-16">
      <Link
        href="/"
        className="text-[13px] font-semibold text-accent hover:underline"
      >
        ← Back
      </Link>
      <h1 className="mt-6 text-[36px] font-extrabold tracking-tight text-ink">
        Terms
      </h1>
      <p className="mt-5 text-[16px] leading-[1.6] text-ink-2">
        SafeLife is offered as-is during the prototype phase. Use it to get a
        feel for the product, not to make medical or financial decisions.
      </p>
      <p className="mt-4 text-[16px] leading-[1.6] text-ink-2">
        Full terms ship with v1.
      </p>
    </main>
  );
}
