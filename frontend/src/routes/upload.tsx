import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { CheckCircle2, FileWarning, Loader2, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  analysisToGraph,
  analysisToOverview,
  analysisToTimeline,
  api,
  queryKeys,
} from "@/services/api";
import type { EvidenceFile } from "@/types";
import { detectFileType, formatBytes } from "@/utils/severity";

const ACCEPTED = [".csv"];

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "Upload Evidence — ThreatVision AI" },
      { name: "description", content: "Upload CSV logs for Kimi-powered security analysis." },
      { property: "og:title", content: "Upload Evidence — ThreatVision AI" },
      { property: "og:description", content: "Analyze logs with the ThreatPulse backend." },
    ],
  }),
  component: UploadPage,
});

function UploadPage() {
  const navigate = useNavigate();
  const { queryClient } = Route.useRouteContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<EvidenceFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caseName, setCaseName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const addFiles = useCallback((list: FileList | null) => {
    if (!list) return;
    const csvFiles = Array.from(list).filter((file) => file.name.toLowerCase().endsWith(".csv"));
    if (csvFiles.length === 0) {
      toast.error("Upload a CSV log file to start analysis.");
      return;
    }

    const file = csvFiles[0];
    const incoming: EvidenceFile[] = [
      {
        id: `${Date.now()}`,
        name: file.name,
        size: file.size,
        type: detectFileType(file.name),
        status: "queued",
        progress: 0,
      },
    ];

    setSelectedFile(file);
    setFiles(incoming);

    if (csvFiles.length > 1) {
      toast.info("Using the first CSV file. Upload one log file per investigation.");
    }
  }, []);

  const ready = Boolean(selectedFile) && !isAnalyzing;

  const startAnalysis = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setFiles((prev) => prev.map((file) => ({ ...file, status: "uploading", progress: 45 })));

    try {
      const analysis = await api.uploadEvidence(selectedFile);
      queryClient.setQueryData(queryKeys.latestAnalysis, analysis);
      queryClient.setQueryData(queryKeys.overview, analysisToOverview(analysis));
      queryClient.setQueryData(queryKeys.timeline, analysisToTimeline(analysis));
      queryClient.setQueryData(queryKeys.graph, analysisToGraph(analysis));
      queryClient.invalidateQueries({ queryKey: queryKeys.overview });
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline });
      queryClient.invalidateQueries({ queryKey: queryKeys.graph });

      setFiles((prev) => prev.map((file) => ({ ...file, status: "parsed", progress: 100 })));
      toast.success("Kimi analysis complete.");
      navigate({ to: "/processing" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Analysis failed";
      setFiles((prev) => prev.map((file) => ({ ...file, status: "failed", progress: 100 })));
      toast.error(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Step 1 of 3"
        title="Upload Logs"
        description="Add a CSV log file. Kimi will analyze only the uploaded evidence and return safe when no attack is supported."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <motion.div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              addFiles(e.dataTransfer.files);
            }}
            onClick={() => inputRef.current?.click()}
            animate={{ scale: dragging ? 1.01 : 1 }}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-16 text-center transition-colors",
              dragging
                ? "border-primary bg-primary/8"
                : "border-border bg-card hover:border-primary/50",
            )}
          >
            <motion.span
              animate={{ y: dragging ? -6 : 0 }}
              className="flex size-16 items-center justify-center rounded-2xl bg-primary/12 text-primary"
            >
              <UploadCloud className="size-8" />
            </motion.span>
            <p className="mt-5 text-lg font-semibold">Drop a CSV log file here</p>
            <p className="mt-1 text-sm text-muted-foreground">
              or click to browse your workstation
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {ACCEPTED.map((ext) => (
                <span
                  key={ext}
                  className="rounded-full border bg-muted/60 px-2.5 py-1 font-mono text-[11px] text-muted-foreground"
                >
                  {ext}
                </span>
              ))}
            </div>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED.join(",")}
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />
          </motion.div>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Evidence queue ({files.length})</CardTitle>
              {files.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFiles([]);
                    setSelectedFile(null);
                  }}
                >
                  <Trash2 className="size-4" /> Clear
                </Button>
              )}
            </CardHeader>
            <CardContent className="px-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">Filename</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Detected type</TableHead>
                      <TableHead className="pr-6">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence initial={false}>
                      {files.map((file) => (
                        <motion.tr
                          key={file.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="border-b"
                        >
                          <TableCell className="pl-6 font-mono text-xs">{file.name}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatBytes(file.size)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{file.type}</TableCell>
                          <TableCell className="w-52 pr-6">
                            {file.status === "parsed" ? (
                              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
                                <CheckCircle2 className="size-4" /> Analyzed
                              </span>
                            ) : file.status === "failed" ? (
                              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-destructive">
                                <FileWarning className="size-4" /> Failed
                              </span>
                            ) : file.status === "queued" ? (
                              <span className="text-sm font-medium text-muted-foreground">
                                Ready
                              </span>
                            ) : (
                              <div className="space-y-1.5">
                                <Progress value={file.progress} className="h-1.5" />
                                <span className="text-xs text-muted-foreground">
                                  Analyzing · {Math.round(file.progress)}%
                                </span>
                              </div>
                            )}
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                    {files.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                          No evidence queued yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Case details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="case-name">Investigation name</Label>
                <Input
                  id="case-name"
                  value={caseName}
                  onChange={(e) => setCaseName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lead">Lead analyst</Label>
                <Input id="lead" placeholder="Analyst name" />
              </div>
              <Button className="w-full" size="lg" disabled={!ready} onClick={startAnalysis}>
                {isAnalyzing ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Analyzing Logs
                  </>
                ) : (
                  "Start Investigation"
                )}
              </Button>
              {!ready && (
                <p className="flex items-start gap-2 text-xs text-muted-foreground">
                  <FileWarning className="mt-0.5 size-3.5 shrink-0 text-warning" />
                  Select one CSV log file before starting the Kimi analysis.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-accent/40">
            <CardContent className="space-y-2 text-sm">
              <p className="font-semibold text-accent-foreground">Backend contract</p>
              <p className="text-muted-foreground">
                The API returns severity score, attack category, intent, damage, timeline and an
                attack flowchart. Safe logs return safe values and an empty flowchart.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
