import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import {
  ChevronDown,
  Download,
  KeyRound,
  Mail,
  MousePointerClick,
  Send,
  Terminal,
  ShieldPlus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SeverityBadge } from "@/components/common/SeverityBadge";
import { cn } from "@/lib/utils";
import type { TimelineEvent } from "@/types";
import { severityDot, severityText } from "@/utils/severity";

const iconFor: Record<string, LucideIcon> = {
  "evt-1": Mail,
  "evt-2": MousePointerClick,
  "evt-3": Download,
  "evt-4": Terminal,
  "evt-5": ShieldPlus,
  "evt-6": KeyRound,
  "evt-7": Send,
};

export function TimelineList({
  events,
  highlightIds,
}: {
  events: TimelineEvent[];
  highlightIds?: string[] | undefined;
}) {
  const [expanded, setExpanded] = useState<string | null>(events[0]?.id ?? null);

  return (
    <ol className="relative space-y-3 pl-2">
      <span className="absolute left-[22px] top-3 bottom-3 w-px bg-border" aria-hidden />
      {events.map((event, i) => {
        const Icon = iconFor[event.id] ?? Terminal;
        const isOpen = expanded === event.id;
        const highlighted = highlightIds?.includes(event.id);
        return (
          <motion.li
            key={event.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07, duration: 0.35 }}
            className="relative flex gap-4"
          >
            <span
              className={cn(
                "relative z-10 mt-1 flex size-10 shrink-0 items-center justify-center rounded-xl border bg-card",
                highlighted ? "border-primary ring-2 ring-primary/30" : "border-border",
              )}
            >
              <Icon className={cn("size-[18px]", severityText[event.severity])} />
            </span>

            <div
              className={cn(
                "min-w-0 flex-1 rounded-xl border bg-card p-4 transition-colors",
                highlighted && "border-primary/50 bg-primary/5",
              )}
            >
              <button
                onClick={() => setExpanded(isOpen ? null : event.id)}
                className="flex w-full items-start gap-3 text-left"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{event.time}</span>
                    <span className={cn("size-1.5 rounded-full", severityDot[event.severity])} />
                    <p className="font-semibold">{event.title}</p>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <SeverityBadge severity={event.severity} />
                  <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <dl className="mt-4 grid gap-x-6 gap-y-2 border-t pt-4 text-sm sm:grid-cols-2">
                      <Row label="Source" value={event.source} />
                      <Row label="Host" value={event.host} />
                      <Row label="Identity" value={event.user} />
                      {event.techniqueId && <Row label="ATT&CK" value={event.techniqueId} mono />}
                      {Object.entries(event.details).map(([k, v]) => (
                        <Row key={k} label={k} value={v} mono />
                      ))}
                    </dl>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className={cn("break-all", mono && "font-mono text-xs")}>{value}</dd>
    </div>
  );
}
