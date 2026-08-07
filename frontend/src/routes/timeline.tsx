import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { GitBranch } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { TimelineList } from "@/components/investigation/TimelineList";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api, queryKeys } from "@/services/api";

export const Route = createFileRoute("/timeline")({
  head: () => ({
    meta: [
      { title: "Incident Timeline — ThreatVision AI" },
      { name: "description", content: "Minute-by-minute reconstruction of the intrusion from phishing delivery to data exfiltration." },
      { property: "og:title", content: "Incident Timeline — ThreatVision AI" },
      { property: "og:description", content: "Expandable forensic timeline correlated across hosts and identities." },
    ],
  }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData({ queryKey: queryKeys.timeline, queryFn: api.getTimeline }),
  component: TimelinePage,
});

function TimelinePage() {
  const { data: events } = useSuspenseQuery({ queryKey: queryKeys.timeline, queryFn: api.getTimeline });

  return (
    <PageContainer className="max-w-5xl">
      <PageHeader
        eyebrow="INV-2481"
        title="Incident Timeline"
        description="7 correlated events spanning 10 minutes on 07 August 2026. Select an event to inspect raw fields."
        actions={
          <Button variant="outline" asChild>
            <Link to="/attack-graph">
              <GitBranch className="size-4" /> View Attack Graph
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent>
          <TimelineList events={events} />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
