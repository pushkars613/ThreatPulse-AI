import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { FileDown, FileJson, FileText } from "lucide-react";
import { toast } from "sonner";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { SeverityBadge } from "@/components/common/SeverityBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api, queryKeys } from "@/services/api";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Incident Report — ThreatVision AI" },
      { name: "description", content: "Export-ready incident report with executive summary, timeline, ATT&CK mapping, IOCs and recommendations." },
      { property: "og:title", content: "Incident Report — ThreatVision AI" },
      { property: "og:description", content: "Professional DFIR report generated from the case evidence." },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData({ queryKey: queryKeys.overview, queryFn: api.getIncidentOverview }),
      context.queryClient.ensureQueryData({ queryKey: queryKeys.timeline, queryFn: api.getTimeline }),
      context.queryClient.ensureQueryData({ queryKey: queryKeys.mitre, queryFn: api.getMitreTechniques }),
      context.queryClient.ensureQueryData({ queryKey: queryKeys.iocs, queryFn: api.getIocs }),
    ]);
  },
  component: ReportsPage,
});

const recommendations = [
  "Isolate WKS-2213 and reimage from a known-good baseline before returning it to the user.",
  "Force password reset and revoke sessions for all four accounts cached on the host.",
  "Block cdn-invoicecloud[.]net and 185.212.44.19 at the proxy, firewall and mail gateway.",
  "Enable LSASS protection (RunAsPPL) and Attack Surface Reduction rules fleet-wide.",
  "Retire the legacy supplier-domain allow-list that let an SPF-failing message through.",
  "Add a detection for autorun keys created by processes running from user-writable paths.",
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t px-8 py-8 duration-500 animate-in fade-in first:border-t-0">
      <h2 className="mb-4 text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}

function ReportsPage() {
  const { data: overview } = useSuspenseQuery({ queryKey: queryKeys.overview, queryFn: api.getIncidentOverview });
  const { data: events } = useSuspenseQuery({ queryKey: queryKeys.timeline, queryFn: api.getTimeline });
  const { data: techniques } = useSuspenseQuery({ queryKey: queryKeys.mitre, queryFn: api.getMitreTechniques });
  const { data: iocs } = useSuspenseQuery({ queryKey: queryKeys.iocs, queryFn: api.getIocs });

  const exportAs = (format: string) =>
    toast.success(`${format} export queued`, { description: "INV-2481 report will download once rendered." });

  return (
    <PageContainer className="max-w-5xl">
      <PageHeader
        eyebrow="INV-2481"
        title="Incident Report"
        description="Generated 07 Aug 2026 · Lead analyst M. Okafor · Classification: Internal / Restricted"
        actions={
          <>
            <Button variant="outline" onClick={() => exportAs("PDF")}>
              <FileDown className="size-4" /> Export PDF
            </Button>
            <Button variant="outline" onClick={() => exportAs("Markdown")}>
              <FileText className="size-4" /> Export Markdown
            </Button>
            <Button variant="outline" onClick={() => exportAs("JSON")}>
              <FileJson className="size-4" /> Export JSON
            </Button>
          </>
        }
      />

      <Card className="overflow-hidden p-0">
        <CardContent className="p-0">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-accent/40 px-8 py-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Case</p>
              <p className="text-xl font-bold">Finance phishing → credential theft</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Risk score</p>
                <p className="text-2xl font-bold tabular-nums">{overview.riskScore}/100</p>
              </div>
              <SeverityBadge severity={overview.severity} size="lg" />
            </div>
          </div>

          <Section title="1. Executive Summary">
            <p className="text-sm leading-relaxed text-muted-foreground">{overview.summary}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              {[
                ["Affected users", overview.affectedUsers],
                ["Affected devices", overview.affectedDevices],
                ["Attack duration", overview.attackDuration],
                ["Evidence items", overview.evidenceCount],
              ].map(([label, value]) => (
                <div key={label as string} className="rounded-xl border bg-muted/40 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
                  <p className="mt-1 font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="2. Timeline of Events">
            <ol className="space-y-3">
              {events.map((e) => (
                <li key={e.id} className="flex gap-4 text-sm">
                  <span className="w-20 shrink-0 font-mono text-xs text-muted-foreground">{e.time}</span>
                  <div>
                    <p className="font-medium">{e.title}</p>
                    <p className="text-muted-foreground">{e.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Section>

          <Section title="3. MITRE ATT&CK Mapping">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Technique</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Tactic</TableHead>
                    <TableHead className="text-right">Confidence</TableHead>
                    <TableHead>Severity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {techniques.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono text-xs text-primary">{t.id}</TableCell>
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell className="text-muted-foreground">{t.tactic}</TableCell>
                      <TableCell className="text-right tabular-nums">{t.confidence}%</TableCell>
                      <TableCell>
                        <SeverityBadge severity={t.severity} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Section>

          <Section title="4. Indicators of Compromise">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Context</TableHead>
                    <TableHead>Severity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {iocs.map((ioc) => (
                    <TableRow key={ioc.value}>
                      <TableCell className="text-muted-foreground">{ioc.type}</TableCell>
                      <TableCell className="max-w-xs break-all font-mono text-xs">{ioc.value}</TableCell>
                      <TableCell className="text-muted-foreground">{ioc.context}</TableCell>
                      <TableCell>
                        <SeverityBadge severity={ioc.severity} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Section>

          <Section title="5. Risk Assessment">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["Confidentiality", "High", "Credentials and finance documents exfiltrated."],
                ["Integrity", "Medium", "Persistence installed; no data tampering observed."],
                ["Availability", "Low", "No destructive or ransomware payload deployed."],
              ].map(([dim, level, note]) => (
                <div key={dim} className="rounded-xl border p-4">
                  <p className="text-sm font-semibold">{dim}</p>
                  <p className="mt-1 text-lg font-bold">{level}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{note}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="6. Recommendations">
            <ol className="space-y-2.5">
              {recommendations.map((rec, i) => (
                <li key={rec} className="flex gap-3 text-sm">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/12 text-xs font-semibold text-primary">
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground">{rec}</span>
                </li>
              ))}
            </ol>
          </Section>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
