/**
 * Mock API layer.
 *
 * Every function here returns a promise so the UI already behaves like it is
 * talking to a real backend. To connect a real API later, replace the body of
 * each function with a fetch/server-function call — signatures stay the same.
 */
import {
  aiAnswers,
  attackCategories,
  evidenceTree,
  fallbackAnswer,
  graphEdges,
  graphNodes,
  incidentOverview,
  investigations,
  iocs,
  kpiSummary,
  mitreTechniques,
  monthlyInvestigations,
  pipelineStages,
  severityDistribution,
  timelineEvents,
} from "./mockData";
import type {
  EvidenceNode,
  GraphEdgeData,
  GraphNodeData,
  IncidentOverview,
  Investigation,
  Ioc,
  KpiSummary,
  MitreTechnique,
  PipelineStage,
  TimelineEvent,
} from "@/types";

const delay = <T,>(data: T, ms = 320): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), ms));

export const api = {
  getKpiSummary: (): Promise<KpiSummary> => delay(kpiSummary),
  getInvestigations: (): Promise<Investigation[]> => delay(investigations),
  getSeverityDistribution: () => delay(severityDistribution),
  getAttackCategories: () => delay(attackCategories),
  getMonthlyInvestigations: () => delay(monthlyInvestigations),
  getIncidentOverview: (): Promise<IncidentOverview> => delay(incidentOverview),
  getTimeline: (): Promise<TimelineEvent[]> => delay(timelineEvents),
  getMitreTechniques: (): Promise<MitreTechnique[]> => delay(mitreTechniques),
  getIocs: (): Promise<Ioc[]> => delay(iocs),
  getEvidenceTree: (): Promise<EvidenceNode[]> => delay(evidenceTree),
  getAttackGraph: (): Promise<{ nodes: GraphNodeData[]; edges: GraphEdgeData[] }> =>
    delay({ nodes: graphNodes, edges: graphEdges }),
  getPipelineStages: (): Promise<PipelineStage[]> => delay(pipelineStages, 0),
  askInvestigator: (question: string): Promise<string> => {
    const hit = aiAnswers.find((entry) => entry.match.test(question));
    return delay(hit ? hit.answer : fallbackAnswer, 900);
  },
};

export const queryKeys = {
  kpi: ["kpi"] as const,
  investigations: ["investigations"] as const,
  severity: ["severity-distribution"] as const,
  categories: ["attack-categories"] as const,
  monthly: ["monthly-investigations"] as const,
  overview: ["incident-overview"] as const,
  timeline: ["timeline"] as const,
  mitre: ["mitre"] as const,
  iocs: ["iocs"] as const,
  evidence: ["evidence-tree"] as const,
  graph: ["attack-graph"] as const,
};
