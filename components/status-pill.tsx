import type { FC } from "react";

interface Props {
  children: React.ReactNode;
  tone?: "ok" | "warn";
}

export const StatusPill: FC<Props> = ({ children, tone = "ok" }) => {
  const palette =
    tone === "ok"
      ? "bg-ok-bg text-ok-ink"
      : "bg-scam-bg text-scam-ink";
  const dot = tone === "ok" ? "bg-ok-ink" : "bg-scam-ink";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${palette}`}
    >
      <span className={`h-[7px] w-[7px] rounded-full ${dot}`} />
      {children}
    </span>
  );
};
