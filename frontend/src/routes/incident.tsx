import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { useState } from "react";
import {
  Bot,
  Bug,
  Clock3,
  Cpu,
  FileStack,
  Gauge,
  Users,
  ArrowRight,
} from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { MetricCard } from "@/components/common/MetricCard";
import { SeverityBadge } from "@/components/common/SeverityBadge";
import { TimelineList } from "@/components/investigation/TimelineList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { api, queryKeys } from "@/services/api";
import { severityBorder } from "@/utils/severity";

export const Route = createFileRoute("/incident")({
  head: () => ({
    meta: [
      { title: "Incident Overview — ThreatVision AI" },
      { name: "description", content: "Risk score, blast radius, malware attribution and MITRE ATT&CK mapping for the active incident." },
      { property: "og:title", content: "Incident Overview — ThreatVision AI" },
      { property: "og:description", content: "Executive view of a confirmed phishing-to-exfiltration intrusion." },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData({ queryKey: queryKeys.overview, queryFn: api.getIncidentOverview }),
      context.queryClient.ensureQueryData({ queryKey: queryKeys.timeline, queryFn: api.getTimeline }),
      context.queryClient.ensureQueryData({ queryKey: queryKeys.mitre, queryFn: api.getMitreTechniques }),
    ]);
  },
  component: IncidentPage,
});

function IncidentPage() {
  const { data: overview } = useSuspenseQuery({ queryKey: queryKeys.overview, queryFn: api.getIncidentOverview });
  const { data: events } = useSuspenseQuery({ queryKey: queryKeys.timeline, queryFn: api.getTimeline });
  const { data: techniques } = useSuspenseQuery({ queryKey: queryKeys.mitre, queryFn: api.getMitreTechniques });
  const [selected, setSelected] = useState<string | null>(null);

  const active = techniques.find((t) => t.id === selected);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="INV-2481 · Step 3 of 3"
        title="Finance phishing → credential theft"
        description={overview.summary}
        actions={
          <>
            <SeverityBadge severity={overview.severity} size="lg" />
            <Button asChild>
              <Link to="/reports">
                Open Report <ArrowRight className="size-4" />
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Risk Score" value={`${overview.riskScore}/100`} hint="Weighted by impact + confidence" icon={Gauge} tone="critical" index={0} />
        <MetricCard label="Affected Users" value={overview.affectedUsers} hint="1 confirmed compromise" icon={Users} tone="warning" index={1} />
        <MetricCard label="Affected Devices" value={overview.affectedDevices} hint="1 host isolated" icon={Cpu} tone="warning" index={2} />
        <MetricCard label="Evidence Count" value={overview.evidenceCount} hint="Across 6 artifact types" icon={FileStack} index={3} />
        <MetricCard label="Malware Family" value={overview.malwareFamily} icon={Bug} tone="critical" index={4} />
        <MetricCard label="Attack Duration" value={overview.attackDuration} hint="09:31 → 09:41 UTC" icon={Clock3} tone="info" index={5} />
        <MetricCard label="Severity" value="Critical" hint="Escalated automatically" icon={Gauge} tone="critical" index={6} />
        <MetricCard label="AI Confidence" value="94%" hint="Cross-source corroboration" icon={Bot} tone="success" index={7} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_1fr]">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-base">MITRE ATT&CK mapping</CardTitle>
            <p className="text-sm text-muted-foreground">
              Select a technique to highlight the evidence that supports it.
            </p>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {techniques.map((t, i) => (
              <motion.button
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setSelected(selected === t.id ? null : t.id)}
                className={cn(
                  "card-lift rounded-xl border bg-card p-4 text-left",
                  selected === t.id ? "border-primary ring-2 ring-primary/25" : severityBorder[t.severity],
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-primary">{t.id}</span>
                  <SeverityBadge severity={t.severity} />
                </div>
                <p className="mt-2 font-semibold leading-tight">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.tactic}</p>
                <p className="mt-2 text-xs text-muted-foreground">{t.description}</p>
                <div className="mt-3 flex items-center gap-2">
                  <Progress value={t.confidence} className="h-1.5" />
                  <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">{t.confidence}%</span>
                </div>
              </motion.button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">
              {active ? `Evidence for ${active.id}` : "Attack chronology"}
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/timeline">Full timeline</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <TimelineList
              events={active ? events.filter((e) => active.relatedEventIds.includes(e.id)) : events}
              highlightIds={active?.relatedEventIds}
            />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
