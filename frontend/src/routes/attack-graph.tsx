import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { motion } from "motion/react";
import {
  AppWindow,
  Database,
  FileCode2,
  Mail,
  Server,
  Skull,
  TerminalSquare,
  User,
  KeySquare,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { SeverityBadge } from "@/components/common/SeverityBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { api, queryKeys } from "@/services/api";
import type { GraphNodeData, Severity } from "@/types";
import { severityBorder, severityText } from "@/utils/severity";

export const Route = createFileRoute("/attack-graph")({
  head: () => ({
    meta: [
      { title: "Attack Graph — ThreatVision AI" },
      {
        name: "description",
        content:
          "Interactive attack path graph linking attacker infrastructure, users, processes and exfiltration endpoints.",
      },
      { property: "og:title", content: "Attack Graph — ThreatVision AI" },
      {
        property: "og:description",
        content: "Zoomable reconstruction of the full intrusion path.",
      },
    ],
  }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData({ queryKey: queryKeys.graph, queryFn: api.getAttackGraph }),
  component: AttackGraphPage,
});

const kindIcon: Record<GraphNodeData["kind"], LucideIcon> = {
  attacker: Skull,
  email: Mail,
  user: User,
  app: AppWindow,
  file: FileCode2,
  process: TerminalSquare,
  registry: Database,
  system: KeySquare,
  server: Server,
};

type FlowNodeData = {
  label: string;
  detail: string;
  severity: Severity;
  kind: GraphNodeData["kind"];
};

function AttackNode({ data, selected }: NodeProps) {
  const d = data as unknown as FlowNodeData;
  const Icon = kindIcon[d.kind];
  return (
    <div
      className={cn(
        "w-56 rounded-xl border-2 bg-card p-3 shadow-soft transition-all",
        severityBorder[d.severity],
        selected && "ring-2 ring-primary",
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!size-2 !border-none !bg-muted-foreground"
      />
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted",
            severityText[d.severity],
          )}
        >
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{d.label}</p>
          <p className="truncate text-[11px] text-muted-foreground">{d.detail}</p>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!size-2 !border-none !bg-muted-foreground"
      />
    </div>
  );
}

function AttackGraphPage() {
  const { data } = useSuspenseQuery({ queryKey: queryKeys.graph, queryFn: api.getAttackGraph });
  const [selected, setSelected] = useState<GraphNodeData | null>(null);

  const nodeTypes = useMemo(() => ({ attack: AttackNode }), []);

  const nodes: Node[] = useMemo(
    () =>
      data.nodes.map((n) => ({
        id: n.id,
        type: "attack",
        position: n.position,
        data: { label: n.label, detail: n.detail, severity: n.severity, kind: n.kind },
      })),
    [data.nodes],
  );

  const edges: Edge[] = useMemo(
    () =>
      data.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        animated: true,
        style: { strokeWidth: 1.6 },
        labelStyle: { fontSize: 11, fill: "var(--color-muted-foreground)" },
        labelBgStyle: { fill: "var(--color-background)" },
      })),
    [data.edges],
  );

  const onNodeClick = useCallback(
    (_: unknown, node: Node) => {
      setSelected(data.nodes.find((n) => n.id === node.id) ?? null);
    },
    [data.nodes],
  );

  return (
    <PageContainer>
      <PageHeader
        eyebrow="ThreatPulse"
        title="Attack Flowchart"
        description="Kimi-generated attack path from the uploaded logs. Safe results return an empty graph."
        actions={
          <Button variant="outline" asChild>
            <Link to="/evidence">Open Evidence Explorer</Link>
          </Button>
        }
      />

      {data.nodes.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-[360px] flex-col items-center justify-center text-center">
            <span className="flex size-14 items-center justify-center rounded-xl bg-success/15 text-success">
              <ShieldCheck className="size-7" />
            </span>
            <p className="mt-4 text-lg font-semibold">No attack flowchart</p>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Kimi did not find concrete evidence of an attack, so the backend returned safe values
              and no attack path.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="h-[640px] overflow-hidden rounded-2xl border bg-card"
          >
            <ReactFlowProvider>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodeClick={onNodeClick}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                proOptions={{ hideAttribution: true }}
                minZoom={0.2}
              >
                <Background
                  variant={BackgroundVariant.Dots}
                  gap={20}
                  size={1}
                  color="var(--color-border)"
                />
                <Controls
                  className="!rounded-lg !border !bg-card !shadow-soft"
                  showInteractive={false}
                />
                <MiniMap
                  pannable
                  zoomable
                  className="!rounded-lg !border !bg-card"
                  maskColor="color-mix(in oklab, var(--color-muted) 60%, transparent)"
                  nodeColor="var(--color-primary)"
                />
              </ReactFlow>
            </ReactFlowProvider>
          </motion.div>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-base">Node details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selected ? (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">{selected.label}</p>
                    <SeverityBadge severity={selected.severity} />
                  </div>
                  <p className="text-sm text-muted-foreground">{selected.detail}</p>
                  <dl className="space-y-2 border-t pt-3 text-sm">
                    <div>
                      <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Entity type
                      </dt>
                      <dd className="capitalize">{selected.kind}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Node ID
                      </dt>
                      <dd className="font-mono text-xs">{selected.id}</dd>
                    </div>
                  </dl>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link to="/timeline">See related events</Link>
                  </Button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Select any node in the graph to inspect the entity and pivot into its evidence.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
