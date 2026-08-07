import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  index = 0,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "critical" | "warning" | "success" | "info";
  index?: number;
}) {
  const toneClasses: Record<string, string> = {
    default: "bg-primary/12 text-primary",
    critical: "bg-critical/15 text-critical",
    warning: "bg-warning/15 text-warning",
    success: "bg-success/15 text-success",
    info: "bg-info/15 text-info",
  };

  return (
    <div
      className="duration-500 animate-in fade-in slide-in-from-bottom-2"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: "backwards" }}
    >
      <Card className="card-lift gap-0 p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          {Icon && (
            <span className={cn("flex size-8 items-center justify-center rounded-lg", toneClasses[tone])}>
              <Icon className="size-4" />
            </span>
          )}
        </div>
        <p className="mt-3 text-3xl font-bold tabular-nums tracking-tight">{value}</p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </Card>
    </div>
  );
}
