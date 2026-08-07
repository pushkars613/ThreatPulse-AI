import type { Severity } from "@/types";

export const severityLabel: Record<Severity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
  info: "Info",
};

/** Tailwind classes built from semantic design tokens only. */
export const severityChip: Record<Severity, string> = {
  critical: "bg-critical/15 text-critical border-critical/30",
  high: "bg-destructive/12 text-destructive border-destructive/25",
  medium: "bg-warning/15 text-warning border-warning/30",
  low: "bg-success/15 text-success border-success/30",
  info: "bg-info/15 text-info border-info/30",
};

export const severityDot: Record<Severity, string> = {
  critical: "bg-critical",
  high: "bg-destructive",
  medium: "bg-warning",
  low: "bg-success",
  info: "bg-info",
};

export const severityText: Record<Severity, string> = {
  critical: "text-critical",
  high: "text-destructive",
  medium: "text-warning",
  low: "text-success",
  info: "text-info",
};

export const severityBorder: Record<Severity, string> = {
  critical: "border-critical/50",
  high: "border-destructive/40",
  medium: "border-warning/45",
  low: "border-success/45",
  info: "border-info/45",
};

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  });
}

export function detectFileType(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    evtx: "Windows Event Log",
    eml: "Email Message",
    csv: "Tabular Log",
    json: "Structured Log",
    png: "Screenshot",
    jpg: "Screenshot",
    jpeg: "Screenshot",
  };
  return map[ext] ?? "Unknown";
}
