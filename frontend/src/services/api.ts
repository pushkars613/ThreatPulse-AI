import type {
  AnalysisResult,
  EvidenceNode,
  GraphEdgeData,
  GraphNodeData,
  IncidentOverview,
  Investigation,
  Ioc,
  KpiSummary,
  MitreTechnique,
  TimelineEvent,
} from "@/types";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "/api").replace(
  /\/$/,
  "",
);
const ANALYSIS_STORAGE_KEY = "threatpulse.latestAnalysis";

const isBrowser = () => typeof window !== "undefined";

const severityFromScore = (score: number): TimelineEvent["severity"] => {
  if (score >= 86) return "critical";
  if (score >= 61) return "high";
  if (score >= 31) return "medium";
  if (score >= 1) return "low";
  return "info";
};

const getStoredAnalysis = (): AnalysisResult | null => {
  if (!isBrowser()) return null;
  const value = window.localStorage.getItem(ANALYSIS_STORAGE_KEY);
  if (!value) return null;
  try {
    return JSON.parse(value) as AnalysisResult;
  } catch {
    window.localStorage.removeItem(ANALYSIS_STORAGE_KEY);
    return null;
  }
};

const saveAnalysis = (analysis: AnalysisResult) => {
  if (isBrowser()) {
    window.localStorage.setItem(ANALYSIS_STORAGE_KEY, JSON.stringify(analysis));
  }
};

const analysisTitle = (analysis: AnalysisResult) =>
  analysis.attackCategory.toLowerCase() === "safe" ? "No attack detected" : analysis.attackCategory;

const analysisToInvestigation = (analysis: AnalysisResult): Investigation => ({
  id: "latest",
  name: analysisTitle(analysis),
  analyst: "Current analyst",
  createdAt: new Date().toISOString(),
  status: "active",
  severity: severityFromScore(analysis.severityScore),
  riskScore: analysis.severityScore,
  evidenceCount: analysis.timeline.length,
  attackCategory: analysis.attackCategory,
});

const analysisToKpi = (analysis: AnalysisResult | null): KpiSummary => {
  const severity = analysis ? severityFromScore(analysis.severityScore) : "info";
  return {
    totalInvestigations: analysis ? 1 : 0,
    activeIncidents:
      analysis && analysis.attackCategory.toLowerCase() !== "safe" && analysis.severityScore > 0 ? 1 : 0,
    critical: severity === "critical" ? 1 : 0,
    medium: severity === "medium" ? 1 : 0,
    low: severity === "low" ? 1 : 0,
  };
};

export const analysisToOverview = (analysis: AnalysisResult): IncidentOverview => ({
  riskScore: analysis.severityScore,
  severity: severityFromScore(analysis.severityScore),
  affectedUsers: analysis.attackCategory.toLowerCase() === "safe" ? 0 : 1,
  affectedDevices: analysis.attackCategory.toLowerCase() === "safe" ? 0 : 1,
  malwareFamily:
    analysis.attackCategory.toLowerCase() === "safe" ? "safe" : analysis.attackCategory,
  attackDuration:
    analysis.timeline.length > 1
      ? `${analysis.timeline[0].timestamp} -> ${analysis.timeline[analysis.timeline.length - 1].timestamp}`
      : (analysis.timeline[0]?.timestamp ?? "safe"),
  evidenceCount: analysis.timeline.length,
  summary:
    analysis.attackCategory.toLowerCase() === "safe"
      ? "Kimi found no concrete evidence of malicious or suspicious activity in the uploaded logs."
      : `Kimi identified ${analysis.attackCategory}. Probable intent: ${analysis.probableIntent}. Damage done: ${analysis.damageDone}.`,
});

export const analysisToTimeline = (analysis: AnalysisResult): TimelineEvent[] =>
  analysis.timeline.map((event, index) => ({
    id: `evt-${index + 1}`,
    time: event.timestamp || "Unknown",
    title: event.event || `Evidence event ${index + 1}`,
    description: event.evidence || event.event || "Kimi marked this event as supporting evidence.",
    severity: severityFromScore(analysis.severityScore),
    source: event.source || "Uploaded log",
    host: "Unknown",
    user: "Unknown",
    details: {
      Evidence: event.evidence || "Not provided",
    },
  }));

export const analysisToGraph = (
  analysis: AnalysisResult,
): { nodes: GraphNodeData[]; edges: GraphEdgeData[] } => ({
  nodes: analysis.flowchart.nodes.map((node, index) => ({
    id: node.id,
    label: node.label,
    detail: node.detail,
    kind:
      index === 0
        ? "attacker"
        : index === analysis.flowchart.nodes.length - 1
          ? "system"
          : "process",
    severity: severityFromScore(analysis.severityScore),
    position: {
      x: (index % 3) * 280,
      y: Math.floor(index / 3) * 170,
    },
  })),
  edges: analysis.flowchart.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
  })),
});

const analysisToEvidenceTree = (analysis: AnalysisResult | null): EvidenceNode[] => {
  if (!analysis) return [];

  return [
    {
      id: "analysis",
      label: "Backend analysis",
      kind: "folder",
      children: [
        {
          id: "analysis-summary",
          label: "summary.json",
          kind: "file",
          fileType: "json",
          content: JSON.stringify(analysis, null, 2),
        },
        ...analysis.timeline.map((event, index) => ({
          id: `timeline-${index + 1}`,
          label: `timeline-${index + 1}.json`,
          kind: "file" as const,
          fileType: "json",
          content: JSON.stringify(event, null, 2),
        })),
      ],
    },
  ];
};

export const api = {
  getKpiSummary: async (): Promise<KpiSummary> => analysisToKpi(getStoredAnalysis()),
  getInvestigations: async (): Promise<Investigation[]> => {
    const analysis = getStoredAnalysis();
    return analysis ? [analysisToInvestigation(analysis)] : [];
  },
  getSeverityDistribution: async () => {
    const analysis = getStoredAnalysis();
    if (!analysis) return [];
    const severity = severityFromScore(analysis.severityScore);
    return severity === "info" ? [] : [{ name: severity, value: 1, key: severity }];
  },
  getAttackCategories: async () => {
    const analysis = getStoredAnalysis();
    if (!analysis || analysis.attackCategory.toLowerCase() === "safe") return [];
    return [{ category: analysis.attackCategory, count: 1 }];
  },
  getMonthlyInvestigations: async () => [],
  uploadEvidence: async (file: File): Promise<AnalysisResult> => {
    const form = new FormData();
    form.append("file", file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      body: form,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.detail ?? `Upload failed with status ${response.status}`);
    }

    const analysis = (await response.json()) as AnalysisResult;
    saveAnalysis(analysis);
    return analysis;
  },
  getLatestAnalysis: async (): Promise<AnalysisResult | null> => getStoredAnalysis(),
  getIncidentOverview: async (): Promise<IncidentOverview> => {
    const analysis = getStoredAnalysis();
    return analysis
      ? analysisToOverview(analysis)
      : {
          riskScore: 0,
          severity: "info",
          affectedUsers: 0,
          affectedDevices: 0,
          malwareFamily: "none",
          attackDuration: "none",
          evidenceCount: 0,
          summary: "Upload a CSV log file to generate an incident overview.",
        };
  },
  getTimeline: async (): Promise<TimelineEvent[]> => {
    const analysis = getStoredAnalysis();
    return analysis ? analysisToTimeline(analysis) : [];
  },
  getMitreTechniques: async (): Promise<MitreTechnique[]> => [],
  getIocs: async (): Promise<Ioc[]> => [],
  getEvidenceTree: async (): Promise<EvidenceNode[]> => analysisToEvidenceTree(getStoredAnalysis()),
  getAttackGraph: async (): Promise<{ nodes: GraphNodeData[]; edges: GraphEdgeData[] }> => {
    const analysis = getStoredAnalysis();
    return analysis ? analysisToGraph(analysis) : { nodes: [], edges: [] };
  },
  askInvestigator: async (question: string): Promise<string> => {
    const analysis = getStoredAnalysis();
    if (!analysis) {
      return "Upload and analyze a CSV log file first. I can only answer from backend analysis data.";
    }

    const lower = question.toLowerCase();
    if (lower.includes("timeline") || lower.includes("event")) {
      if (analysis.timeline.length === 0) return "The backend returned no supporting timeline events.";
      return analysis.timeline
        .map((event, index) => `${index + 1}. ${event.timestamp || "Unknown"} - ${event.event}`)
        .join("\n");
    }

    if (lower.includes("damage")) return analysis.damageDone;
    if (lower.includes("intent")) return analysis.probableIntent;
    if (lower.includes("category") || lower.includes("attack")) return analysis.attackCategory;
    if (lower.includes("score") || lower.includes("severity")) {
      return `${analysis.severityScore}/100 (${severityFromScore(analysis.severityScore)})`;
    }

    return `Backend analysis: ${analysisTitle(analysis)}. Intent: ${analysis.probableIntent}. Damage: ${analysis.damageDone}.`;
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
  latestAnalysis: ["latest-analysis"] as const,
};

export const latestAnalysisTitle = () => {
  const analysis = getStoredAnalysis();
  return analysis ? analysisTitle(analysis) : "Active investigation";
};
