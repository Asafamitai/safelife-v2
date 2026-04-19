import type { FC, ReactNode } from "react";
import { CategoryTag, type CategoryVariant } from "./category-tag";

const bgByVariant: Record<CategoryVariant, string> = {
  scam: "bg-scam-bg",
  med: "bg-med-bg",
  family: "bg-family-bg",
  ride: "bg-ride-bg",
  ok: "bg-ok-bg",
};

interface Props {
  variant: CategoryVariant;
  tag: string;
  title: string;
  body?: string;
  time?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}

export const FeedCard: FC<Props> = ({
  variant,
  tag,
  title,
  body,
  time,
  icon,
  actions,
}) => (
  <div
    className={`grid grid-cols-[36px_1fr_auto] items-start gap-2.5 rounded-2xl p-3.5 ${bgByVariant[variant]}`}
  >
    <div className="grid h-9 w-9 place-items-center rounded-xl bg-white text-lg shadow-[0_0_0_1px_rgba(0,0,0,0.06)]">
      {icon}
    </div>
    <div className="min-w-0">
      <CategoryTag variant={variant}>{tag}</CategoryTag>
      <div className="mt-0.5 text-sm font-bold text-ink">{title}</div>
      {body ? (
        <div className="mt-1 text-[13px] leading-snug text-ink-2">{body}</div>
      ) : null}
      {actions ? <div className="mt-2.5 flex gap-2">{actions}</div> : null}
    </div>
    {time ? (
      <div className="whitespace-nowrap pt-0.5 text-[11px] text-muted">
        {time}
      </div>
    ) : null}
  </div>
);
