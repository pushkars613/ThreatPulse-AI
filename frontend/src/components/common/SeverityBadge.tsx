import { cn } from "@/lib/utils";
import { severityChip, severityDot, severityLabel } from "@/utils/severity";
import type { Severity } from "@/types";

export function SeverityBadge({
  severity,
  className,
  size = "sm",
}: {
  severity: Severity;
  className?: string;
  size?: "sm" | "lg";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold",
        severityChip[severity],
        size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3.5 py-1.5 text-sm",
        className,
      )}
    >
      <span className={cn("rounded-full", severityDot[severity], size === "sm" ? "size-1.5" : "size-2")} />
      {severityLabel[severity]}
    </span>
  );
}
