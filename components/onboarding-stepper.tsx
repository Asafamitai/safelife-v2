import { cn } from "@/lib/utils";

/**
 * Four-dot step indicator for the onboarding flow. Current step is
 * filled ink; completed steps are muted; future steps are hollow.
 */
export function OnboardingStepper({
  step,
  total = 4,
}: {
  step: number;
  total?: number;
}) {
  return (
    <ol
      role="list"
      aria-label={`Step ${step + 1} of ${total}`}
      className="flex items-center gap-1.5"
    >
      {Array.from({ length: total }, (_, i) => (
        <li
          key={i}
          aria-current={i === step ? "step" : undefined}
          className={cn(
            "h-1.5 w-6 rounded-full transition-colors",
            i === step
              ? "bg-ink"
              : i < step
                ? "bg-ink-2/40"
                : "bg-line"
          )}
        />
      ))}
    </ol>
  );
}
