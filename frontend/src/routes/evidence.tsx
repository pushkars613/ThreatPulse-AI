import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { ChevronRight, FileText, Folder, Search } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { api, queryKeys } from "@/services/api";
import type { EvidenceNode } from "@/types";

export const Route = createFileRoute("/evidence")({
  head: () => ({
    meta: [
      { title: "Evidence Explorer — ThreatVision AI" },
      { name: "description", content: "Browse raw forensic artifacts — event logs, emails, browser history, netflow and EDR detections." },
      { property: "og:title", content: "Evidence Explorer — ThreatVision AI" },
      { property: "og:description", content: "Inspect normalized and raw evidence side by side." },
    ],
  }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData({ queryKey: queryKeys.evidence, queryFn: api.getEvidenceTree }),
  component: EvidencePage,
});

/** Lightweight token highlighter — no external syntax highlighting dependency. */
function highlight(line: string, filter: string) {
  const parts = line.split(/(\s+)/);
  return parts.map((part, i) => {
    const isKey = /^[A-Za-z_"][\w".-]*:$|^"[^"]+":$/.test(part);
    const isNum = /^-?\d[\d.:,]*$/.test(part);
    const isMatch = filter.length > 1 && part.toLowerCase().includes(filter.toLowerCase());
    return (
      <span
        key={i}
        className={cn(
          isKey && "text-info",
          isNum && "text-warning",
          isMatch && "rounded bg-primary/25 text-foreground",
        )}
      >
        {part}
      </span>
    );
  });
}

function EvidencePage() {
  const { data: tree } = useSuspenseQuery({ queryKey: queryKeys.evidence, queryFn: api.getEvidenceTree });
  const firstFile = tree.flatMap((folder) => folder.children ?? [])[0] ?? null;
  const [selected, setSelected] = useState<EvidenceNode | null>(firstFile);
  const [treeFilter, setTreeFilter] = useState("");
  const [contentFilter, setContentFilter] = useState("");

  const lines = useMemo(() => {
    if (!selected) return [];
    const all = (selected.content ?? "").split("\n");
    if (!contentFilter) return all;
    return all.filter((l) => l.toLowerCase().includes(contentFilter.toLowerCase()));
  }, [selected, contentFilter]);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="ThreatPulse"
        title="Evidence Explorer"
        description="Evidence is built from the latest backend analysis."
      />

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <Card className="h-fit">
          <CardHeader className="space-y-3">
            <CardTitle className="text-base">Evidence tree</CardTitle>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={treeFilter}
                onChange={(e) => setTreeFilter(e.target.value)}
                placeholder="Filter artifacts"
                className="h-9 pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="px-3">
            <ul className="space-y-3">
              {tree.map((folder) => {
                const children = (folder.children ?? []).filter((c) =>
                  c.label.toLowerCase().includes(treeFilter.toLowerCase()),
                );
                if (treeFilter && children.length === 0) return null;
                return (
                  <li key={folder.id}>
                    <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <Folder className="size-3.5" />
                      {folder.label}
                    </div>
                    <ul className="mt-1 space-y-0.5">
                      {children.map((file) => (
                        <li key={file.id}>
                          <button
                            onClick={() => setSelected(file)}
                            className={cn(
                              "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                              selected?.id === file.id
                                ? "bg-primary/12 font-medium text-primary"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground",
                            )}
                          >
                            <FileText className="size-3.5 shrink-0" />
                            <span className="truncate">{file.label}</span>
                            <ChevronRight className="ml-auto size-3.5 opacity-50" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader className="flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="font-mono text-sm">
                {selected?.label ?? "No evidence available"}
              </CardTitle>
              {selected?.fileType && (
                <Badge variant="secondary" className="uppercase">{selected.fileType}</Badge>
              )}
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={contentFilter}
                onChange={(e) => setContentFilter(e.target.value)}
                placeholder="Search inside artifact"
                className="h-9 pl-9"
              />
            </div>
          </CardHeader>
          <CardContent>
            <motion.div
              key={selected?.id ?? "empty"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border bg-muted/40"
            >
              <ScrollArea className="h-[560px]">
                <pre className="scroll-thin overflow-x-auto p-4 font-mono text-xs leading-relaxed">
                  {selected && lines.map((line, i) => (
                    <div key={i} className="flex gap-4 hover:bg-accent/40">
                      <span className="w-8 shrink-0 select-none text-right text-muted-foreground/60">{i + 1}</span>
                      <span className="whitespace-pre-wrap break-all">{highlight(line, contentFilter)}</span>
                    </div>
                  ))}
                  {!selected ? (
                    <span className="text-muted-foreground">Upload a CSV log file to generate evidence.</span>
                  ) : lines.length === 0 && (
                    <span className="text-muted-foreground">No lines match “{contentFilter}”.</span>
                  )}
                </pre>
              </ScrollArea>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
