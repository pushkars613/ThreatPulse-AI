import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

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
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (progress >= 100) return;
    const interval = setInterval(() => {
      setProgress((value) => Math.min(100, value + 12));
    }, 140);
    return () => clearInterval(interval);
  }, [progress]);

  const done = progress >= 100;

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
              <span className="font-medium">{done ? "Analysis complete" : "Preparing results"}</span>
              <span className="tabular-nums text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 rounded-xl bg-primary/8 px-3 py-3"
          >
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/15 text-primary">
              {done ? <Check className="size-3.5" /> : <Loader2 className="size-3.5 animate-spin" />}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {done ? "Backend analysis ready" : "Loading backend analysis"}
              </p>
              <p className="text-xs text-muted-foreground">
                Results are generated from the uploaded CSV response.
              </p>
            </div>
          </motion.div>

          <Button className="w-full" size="lg" disabled={!done} onClick={() => navigate({ to: "/incident" })}>
            {done ? "View Incident Overview" : "Analysis in progress…"}
          </Button>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
