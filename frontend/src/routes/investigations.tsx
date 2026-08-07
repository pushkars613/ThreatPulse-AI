import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "motion/react";
import { Plus, Search } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { SeverityBadge } from "@/components/common/SeverityBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export const Route = createFileRoute("/investigations")({
  head: () => ({
    meta: [
      { title: "Investigations — ThreatVision AI" },
      { name: "description", content: "Browse, filter and open every forensic investigation case in your tenant." },
      { property: "og:title", content: "Investigations — ThreatVision AI" },
      { property: "og:description", content: "Every DFIR case with severity, risk score and evidence count." },
    ],
  }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData({ queryKey: queryKeys.investigations, queryFn: api.getInvestigations }),
  component: InvestigationsPage,
});

function InvestigationsPage() {
  const { data } = useSuspenseQuery({ queryKey: queryKeys.investigations, queryFn: api.getInvestigations });
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = data.filter((inv) => {
    const matchesQuery = `${inv.id} ${inv.name} ${inv.analyst} ${inv.attackCategory}`
      .toLowerCase()
      .includes(query.toLowerCase());
    return matchesQuery && (status === "all" || inv.status === status);
  });

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Case management"
        title="Investigations"
        description="All forensic cases, ordered by most recent activity."
        actions={
          <Button asChild>
            <Link to="/upload">
              <Plus className="size-4" /> New Investigation
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-4 px-0">
          <div className="flex flex-wrap gap-3 px-6">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter by case, analyst or category"
                className="pl-9"
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Case</TableHead>
                  <TableHead>Analyst</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead className="text-right">Risk</TableHead>
                  <TableHead className="text-right">Evidence</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-6 text-right">Opened</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((inv, i) => (
                  <motion.tr
                    key={inv.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <TableCell className="pl-6">
                      <Link to="/incident">
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
                    <TableCell className="text-right tabular-nums text-muted-foreground">{inv.evidenceCount}</TableCell>
                    <TableCell className="capitalize text-muted-foreground">{inv.status}</TableCell>
                    <TableCell className="pr-6 text-right text-muted-foreground">{formatDate(inv.createdAt)}</TableCell>
                  </motion.tr>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                      No investigations match those filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
