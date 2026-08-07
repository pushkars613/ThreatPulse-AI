export type Severity = "critical" | "high" | "medium" | "low" | "info";

export type InvestigationStatus = "active" | "processing" | "resolved" | "draft";

export interface Investigation {
  id: string;
  name: string;
  analyst: string;
  createdAt: string;
  status: InvestigationStatus;
  severity: Severity;
  riskScore: number;
  evidenceCount: number;
  attackCategory: string;
}

export interface KpiSummary {
  totalInvestigations: number;
  activeIncidents: number;
  critical: number;
  medium: number;
  low: number;
}

export interface EvidenceFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: "queued" | "uploading" | "parsed" | "failed";
  progress: number;
}

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  severity: Severity;
  source: string;
  host: string;
  user: string;
  techniqueId?: string;
  details: Record<string, string>;
}

export interface MitreTechnique {
  id: string;
  name: string;
  tactic: string;
  confidence: number;
  severity: Severity;
  description: string;
  relatedEventIds: string[];
}

export interface IncidentOverview {
  riskScore: number;
  severity: Severity;
  affectedUsers: number;
  affectedDevices: number;
  malwareFamily: string;
  attackDuration: string;
  evidenceCount: number;
  summary: string;
}

export interface EvidenceNode {
  id: string;
  label: string;
  kind: "folder" | "file";
  fileType?: string;
  children?: EvidenceNode[];
  content?: string;
}

export interface GraphNodeData {
  id: string;
  label: string;
  kind:
    "attacker" | "email" | "user" | "app" | "file" | "process" | "registry" | "system" | "server";
  detail: string;
  severity: Severity;
  position: { x: number; y: number };
}

export interface GraphEdgeData {
  id: string;
  source: string;
  target: string;
  label: string;
}

export interface Ioc {
  type: string;
  value: string;
  severity: Severity;
  context: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}

export interface PipelineStage {
  id: string;
  label: string;
  description: string;
}

export interface AnalysisTimelineItem {
  timestamp: string;
  source: string;
  event: string;
  evidence: string;
}

export interface AnalysisFlowchartNode {
  id: string;
  label: string;
  detail: string;
}

export interface AnalysisFlowchartEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}

export interface AnalysisResult {
  severityScore: number;
  attackCategory: string;
  probableIntent: string;
  damageDone: string;
  timeline: AnalysisTimelineItem[];
  flowchart: {
    nodes: AnalysisFlowchartNode[];
    edges: AnalysisFlowchartEdge[];
  };
}
