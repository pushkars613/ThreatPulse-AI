import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { pipelineStages } from "@/services/mockData";

export const Route = createFileRoute("/processing")({
  head: () => ({
    meta: [
      { title: "Processing Evidence — ThreatVision AI" },
      { name: "description", content: "Live view of the forensic ingestion pipeline: parsing, correlation, MITRE mapping and reporting." },
      { property: "og:title", content: "Processing Evidence — ThreatVision AI" },
      { property: "og:description", content: "Automated DFIR pipeline progress for the active investigation." },
    ],
  }),
  component: ProcessingPage,
});

function ProcessingPage() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [stageProgress, setStageProgress] = useState(0);

  useEffect(() => {
    if (current >= pipelineStages.length) return;
    const interval = setInterval(() => {
      setStageProgress((p) => {
        if (p >= 100) {
          setCurrent((c) => c + 1);
          return 0;
        }
        return p + 12;
      });
    }, 140);
    return () => clearInterval(interval);
  }, [current]);

  const done = current >= pipelineStages.length;
  const overall = Math.min(100, Math.round(((current + stageProgress / 100) / pipelineStages.length) * 100));

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader
        eyebrow="Step 2 of 3"
        title="Processing evidence"
        description="ThreatVision is reconstructing the incident from the uploaded artifacts."
      />

      <Card>
        <CardContent className="space-y-6">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium">{done ? "Analysis complete" : pipelineStages[current]?.label}</span>
              <span className="tabular-nums text-muted-foreground">{overall}%</span>
            </div>
            <Progress value={overall} className="h-2" />
          </div>

          <ol className="relative space-y-1">
            {pipelineStages.map((stage, i) => {
              const state = i < current || done ? "done" : i === current ? "active" : "pending";
              return (
                <motion.li
                  key={stage.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    "flex items-start gap-4 rounded-xl px-3 py-3 transition-colors",
                    state === "active" && "bg-primary/8",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold",
                      state === "done" && "border-success/40 bg-success/15 text-success",
                      state === "active" && "border-primary/40 bg-primary/15 text-primary",
                      state === "pending" && "border-border bg-muted text-muted-foreground",
                    )}
                  >
                    {state === "done" ? (
                      <Check className="size-3.5" />
                    ) : state === "active" ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      i + 1
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className={cn("text-sm font-medium", state === "pending" && "text-muted-foreground")}>
                      {stage.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{stage.description}</p>
                    {state === "active" && <Progress value={stageProgress} className="mt-2 h-1 w-40" />}
                  </div>
                </motion.li>
              );
            })}
          </ol>

          <Button className="w-full" size="lg" disabled={!done} onClick={() => navigate({ to: "/incident" })}>
            {done ? "View Incident Overview" : "Analysis in progress…"}
          </Button>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
