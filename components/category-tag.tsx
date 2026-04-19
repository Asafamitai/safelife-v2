import type { FC } from "react";

export type CategoryVariant = "scam" | "med" | "family" | "ride" | "ok";

const classes: Record<CategoryVariant, string> = {
  scam: "text-scam-ink",
  med: "text-med-ink",
  family: "text-family-ink",
  ride: "text-ride-ink",
  ok: "text-ok-ink",
};

interface Props {
  variant: CategoryVariant;
  children: React.ReactNode;
}

export const CategoryTag: FC<Props> = ({ variant, children }) => (
  <span
    className={`text-[11px] font-bold uppercase tracking-[0.08em] ${classes[variant]}`}
  >
    {children}
  </span>
);
