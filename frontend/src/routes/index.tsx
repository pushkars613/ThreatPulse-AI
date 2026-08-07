import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Layers,
  Plus,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { MetricCard } from "@/components/common/MetricCard";
import { SeverityBadge } from "@/components/common/SeverityBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api, queryKeys } from "@/services/api";
import { formatDate } from "@/utils/severity";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SOC Dashboard — ThreatVision AI" },
      {
        name: "description",
        content:
          "Live DFIR dashboard with investigation KPIs, incident severity breakdown and attack category analytics.",
      },
      { property: "og:title", content: "SOC Dashboard — ThreatVision AI" },
      {
        property: "og:description",
        content: "AI-powered digital forensics and incident response command center.",
      },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData({ queryKey: queryKeys.kpi, queryFn: api.getKpiSummary }),
      context.queryClient.ensureQueryData({
        queryKey: queryKeys.investigations,
        queryFn: api.getInvestigations,
      }),
      context.queryClient.ensureQueryData({
        queryKey: queryKeys.severity,
        queryFn: api.getSeverityDistribution,
      }),
      context.queryClient.ensureQueryData({
        queryKey: queryKeys.categories,
        queryFn: api.getAttackCategories,
      }),
      context.queryClient.ensureQueryData({
        queryKey: queryKeys.monthly,
        queryFn: api.getMonthlyInvestigations,
      }),
    ]);
  },
  component: DashboardPage,
});

const statusStyles: Record<string, string> = {
  active: "text-info",
  processing: "text-warning",
  resolved: "text-success",
  draft: "text-muted-foreground",
};

function DashboardPage() {
  const { data: kpi } = useSuspenseQuery({ queryKey: queryKeys.kpi, queryFn: api.getKpiSummary });
  const { data: investigations } = useSuspenseQuery({
    queryKey: queryKeys.investigations,
    queryFn: api.getInvestigations,
  });
  const { data: severity } = useSuspenseQuery({
    queryKey: queryKeys.severity,
    queryFn: api.getSeverityDistribution,
  });
  const { data: categories } = useSuspenseQuery({
    queryKey: queryKeys.categories,
    queryFn: api.getAttackCategories,
  });
  const { data: monthly } = useSuspenseQuery({
    queryKey: queryKeys.monthly,
    queryFn: api.getMonthlyInvestigations,
  });

  const severityColors = [
    "var(--color-critical)",
    "var(--color-destructive)",
    "var(--color-warning)",
    "var(--color-success)",
  ];

  const tooltipStyle = {
    backgroundColor: "var(--color-popover)",
    border: "1px solid var(--color-border)",
    borderRadius: "10px",
    color: "var(--color-popover-foreground)",
    fontSize: "12px",
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Operations"
        title="Security Operations Dashboard"
        description="Current posture across all open forensic investigations and detected incidents."
        actions={
          <Button asChild size="lg">
            <Link to="/upload">
              <Plus className="size-4" />
              Start New Investigation
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Total Investigations" value={kpi.totalInvestigations} hint="All time" icon={Layers} index={0} />
        <MetricCard label="Active Incidents" value={kpi.activeIncidents} hint="Requires triage" icon={Activity} tone="info" index={1} />
        <MetricCard label="Critical Cases" value={kpi.critical} hint="SLA 1 hour" icon={ShieldAlert} tone="critical" index={2} />
        <MetricCard label="Medium Severity" value={kpi.medium} hint="Queued for review" icon={AlertTriangle} tone="warning" index={3} />
        <MetricCard label="Low Severity" value={kpi.low} hint="Monitoring only" icon={ShieldCheck} tone="success" index={4} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="card-lift">
          <CardHeader>
            <CardTitle className="text-base">Incident severity</CardTitle>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={severity} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={3} stroke="none">
                  {severity.map((entry, i) => (
                    <Cell key={entry.key} fill={severityColors[i]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="card-lift">
          <CardHeader>
            <CardTitle className="text-base">Attack categories</CardTitle>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categories} margin={{ left: -20, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: "var(--color-muted)" }} contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="card-lift">
          <CardHeader>
            <CardTitle className="text-base">Monthly investigations</CardTitle>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly} margin={{ left: -20, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="investigations" stroke="var(--color-primary)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="incidents" stroke="var(--color-warning)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="duration-500 animate-in fade-in">
        <Card className="mt-6">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Recent investigations</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/investigations">
                View all <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Case</TableHead>
                    <TableHead>Analyst</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead className="text-right">Risk</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-6 text-right">Opened</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {investigations.slice(0, 5).map((inv) => (
                    <TableRow key={inv.id} className="cursor-pointer">
                      <TableCell className="pl-6">
                        <Link to="/incident" className="block">
                          <span className="font-mono text-xs text-muted-foreground">{inv.id}</span>
                          <p className="font-medium">{inv.name}</p>
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{inv.analyst}</TableCell>
                      <TableCell className="text-muted-foreground">{inv.attackCategory}</TableCell>
                      <TableCell>
                        <SeverityBadge severity={inv.severity} />
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">{inv.riskScore}</TableCell>
                      <TableCell className={`capitalize ${statusStyles[inv.status]}`}>{inv.status}</TableCell>
                      <TableCell className="pr-6 text-right text-muted-foreground">{formatDate(inv.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
