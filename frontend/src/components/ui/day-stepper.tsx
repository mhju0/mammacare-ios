import { type CSSProperties } from "react";
import { Check } from "lucide-react";

import { cn } from "./utils";

// ── warm-kr DayStepper (S0 definition; NOT yet adopted by any screen). ──
// Dotted day progress (e.g. 1·2·3 for the 72h observation flow) matching
// docs/mocks/warm-kr/observe-72h.png. Status-agnostic: the caller injects the
// semantic accent colour at call time (coral by default; testing amber on the
// Observe screen). Neutral defaults come from the warm-* token layer.

interface DayStepperProps {
  /** Total number of steps/dots. */
  steps?: number;
  /** 1-based index of the active step. Earlier steps read as completed, later as upcoming. */
  current: number;
  /** Optional label under each dot, e.g. ["Day 1", "Day 2", "Day 3"]. Index-aligned to steps. */
  labels?: string[];
  /**
   * Accent colour: completed dot fills + the current dot's ring/number/label.
   * Any CSS colour value; status-agnostic. Default coral `"var(--warm-cta)"` —
   * the Observe caller may inject testing amber `"var(--testing-fg)"`.
   */
  color?: string;
  /** Track line + upcoming dot background. Default soft rose `"var(--warm-surface-soft)"`. */
  trackColor?: string;
  /** Upcoming dot number colour. Default muted `"var(--warm-fg-muted)"`. */
  mutedColor?: string;
  /** Diameter of each dot in pixels. */
  dotSize?: number;
  className?: string;
  /** Accessible label for the whole stepper (e.g. "관찰 진행 단계"). */
  "aria-label"?: string;
}

type StepState = "completed" | "current" | "upcoming";

/**
 * Horizontal day stepper: N dots on a connecting track. The track fills with
 * `color` up to the current step; each dot renders completed (fill + check),
 * current (enlarged ring), or upcoming (muted). Optional labels sit under each
 * dot, aligned to its centre.
 */
export function DayStepper({
  steps = 3,
  current,
  labels,
  color = "var(--warm-cta)",
  trackColor = "var(--warm-surface-soft)",
  mutedColor = "var(--warm-fg-muted)",
  dotSize = 44,
  className,
  "aria-label": ariaLabel,
}: DayStepperProps) {
  const items = Array.from({ length: steps }, (_, i) => i + 1);
  const activeStep = Math.min(Math.max(current, 1), steps);
  // Fraction of the track behind completed steps — reaches the current dot's centre.
  const filledFraction = steps > 1 ? (activeStep - 1) / (steps - 1) : 0;
  // Track endpoints sit at the first/last dot centres, i.e. inset by half a dot.
  const inset = dotSize / 2;

  const dotStyle: Record<StepState, CSSProperties> = {
    completed: { backgroundColor: color, color: "var(--warm-brand-fg)" },
    current: {
      backgroundColor: "var(--warm-surface)",
      color,
      border: `2px solid ${color}`,
      transform: "scale(1.15)",
    },
    upcoming: { backgroundColor: trackColor, color: mutedColor },
  };

  return (
    <div
      data-slot="day-stepper"
      role="group"
      aria-label={ariaLabel}
      className={cn("w-full", className)}
    >
      <div className="relative flex items-center justify-between" style={{ height: dotSize }}>
        {/* Full track behind the dots. */}
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full"
          style={{ left: inset, right: inset, backgroundColor: trackColor }}
          aria-hidden="true"
        />
        {/* Filled portion up to the current step. */}
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full"
          style={{
            left: inset,
            width: `calc((100% - ${dotSize}px) * ${filledFraction})`,
            backgroundColor: color,
          }}
          aria-hidden="true"
        />
        {items.map((step) => {
          const state: StepState =
            step < activeStep ? "completed" : step === activeStep ? "current" : "upcoming";
          return (
            <div
              key={step}
              aria-current={state === "current" ? "step" : undefined}
              className={cn(
                "relative z-10 flex items-center justify-center rounded-full text-base font-semibold",
                state === "current" && "shadow-sm",
              )}
              style={{ width: dotSize, height: dotSize, ...dotStyle[state] }}
            >
              {state === "completed" ? (
                <Check className="size-5" aria-hidden="true" />
              ) : (
                step
              )}
            </div>
          );
        })}
      </div>
      {labels && labels.length > 0 && (
        <div className="mt-2 flex justify-between">
          {items.map((step) => {
            const isCurrent = step === activeStep;
            return (
              <span
                key={step}
                className={cn(
                  "text-center text-sm whitespace-nowrap",
                  isCurrent ? "font-bold" : "font-medium",
                )}
                style={{ width: dotSize, color: isCurrent ? color : "var(--warm-fg)" }}
              >
                {labels[step - 1]}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
