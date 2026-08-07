import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { CheckCircle2, FileWarning, Trash2, UploadCloud } from "lucide-react";
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
import type { EvidenceFile } from "@/types";
import { detectFileType, formatBytes } from "@/utils/severity";

const ACCEPTED = [".evtx", ".eml", ".csv", ".json", ".png", ".jpg"];

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "Upload Evidence — ThreatVision AI" },
      { name: "description", content: "Drag and drop EVTX, EML, CSV, JSON and image evidence to begin a new investigation." },
      { property: "og:title", content: "Upload Evidence — ThreatVision AI" },
      { property: "og:description", content: "Ingest forensic artifacts into a new DFIR case." },
    ],
  }),
  component: UploadPage,
});

const seedFiles: EvidenceFile[] = [
  { id: "f1", name: "Security.evtx", size: 8_412_160, type: detectFileType("Security.evtx"), status: "parsed", progress: 100 },
  { id: "f2", name: "invoice-88213.eml", size: 42_310, type: detectFileType("invoice-88213.eml"), status: "parsed", progress: 100 },
  { id: "f3", name: "firewall-netflow.csv", size: 1_204_992, type: detectFileType("firewall-netflow.csv"), status: "parsed", progress: 100 },
];

function UploadPage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<EvidenceFile[]>(seedFiles);
  const [caseName, setCaseName] = useState("Finance phishing — August wave");

  const simulateUpload = useCallback((id: string) => {
    const tick = () => {
      setFiles((prev) =>
        prev.map((f) => {
          if (f.id !== id || f.status === "parsed") return f;
          const next = Math.min(100, f.progress + Math.random() * 22 + 8);
          return { ...f, progress: next, status: next >= 100 ? "parsed" : "uploading" };
        }),
      );
    };
    const interval = setInterval(() => {
      tick();
      setFiles((prev) => {
        const target = prev.find((f) => f.id === id);
        if (target && target.status === "parsed") clearInterval(interval);
        return prev;
      });
    }, 320);
    setTimeout(() => clearInterval(interval), 8000);
  }, []);

  const addFiles = useCallback(
    (list: FileList | null) => {
      if (!list) return;
      const incoming: EvidenceFile[] = Array.from(list).map((file, i) => ({
        id: `${Date.now()}-${i}`,
        name: file.name,
        size: file.size,
        type: detectFileType(file.name),
        status: "uploading",
        progress: 4,
      }));
      setFiles((prev) => [...prev, ...incoming]);
      incoming.forEach((f) => simulateUpload(f.id));
    },
    [simulateUpload],
  );

  const ready = files.length > 0 && files.every((f) => f.status === "parsed");

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Step 1 of 3"
        title="Upload Evidence"
        description="Add forensic artifacts collected from affected hosts, mailboxes and network devices."
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
              dragging ? "border-primary bg-primary/8" : "border-border bg-card hover:border-primary/50",
            )}
          >
            <motion.span
              animate={{ y: dragging ? -6 : 0 }}
              className="flex size-16 items-center justify-center rounded-2xl bg-primary/12 text-primary"
            >
              <UploadCloud className="size-8" />
            </motion.span>
            <p className="mt-5 text-lg font-semibold">Drop evidence files here</p>
            <p className="mt-1 text-sm text-muted-foreground">or click to browse your workstation</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {ACCEPTED.map((ext) => (
                <span key={ext} className="rounded-full border bg-muted/60 px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
                  {ext}
                </span>
              ))}
            </div>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept={ACCEPTED.join(",")}
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />
          </motion.div>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Evidence queue ({files.length})</CardTitle>
              {files.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setFiles([])}>
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
                          <TableCell className="text-muted-foreground">{formatBytes(file.size)}</TableCell>
                          <TableCell className="text-muted-foreground">{file.type}</TableCell>
                          <TableCell className="w-52 pr-6">
                            {file.status === "parsed" ? (
                              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
                                <CheckCircle2 className="size-4" /> Parsed
                              </span>
                            ) : (
                              <div className="space-y-1.5">
                                <Progress value={file.progress} className="h-1.5" />
                                <span className="text-xs text-muted-foreground">
                                  Uploading · {Math.round(file.progress)}%
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
                <Input id="case-name" value={caseName} onChange={(e) => setCaseName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lead">Lead analyst</Label>
                <Input id="lead" defaultValue="M. Okafor" />
              </div>
              <Button
                className="w-full"
                size="lg"
                disabled={!ready}
                onClick={() => navigate({ to: "/processing" })}
              >
                Start Investigation
              </Button>
              {!ready && (
                <p className="flex items-start gap-2 text-xs text-muted-foreground">
                  <FileWarning className="mt-0.5 size-3.5 shrink-0 text-warning" />
                  Wait for every artifact to finish uploading before starting the pipeline.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-accent/40">
            <CardContent className="space-y-2 text-sm">
              <p className="font-semibold text-accent-foreground">Chain of custody</p>
              <p className="text-muted-foreground">
                Each artifact is hashed on ingest and stored write-once. Analyst actions are recorded to the case audit
                log.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
