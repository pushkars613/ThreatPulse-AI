import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Bot, Send, User } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { api } from "@/services/api";
import type { ChatMessage } from "@/types";

export const Route = createFileRoute("/investigator")({
  head: () => ({
    meta: [
      { title: "AI Investigator — ThreatVision AI" },
      { name: "description", content: "Ask natural-language questions about the incident and get evidence-backed forensic answers." },
      { property: "og:title", content: "AI Investigator — ThreatVision AI" },
      { property: "og:description", content: "Conversational DFIR assistant grounded in the case evidence." },
    ],
  }),
  component: InvestigatorPage,
});

/** Minimal markdown renderer for assistant answers. */
function Markdown({ text }: { text: string }) {
  const blocks = text.split("\n");
  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {blocks.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;
        const inline = line
          .split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
          .map((part, j) => {
            if (part.startsWith("**")) return <strong key={j}>{part.slice(2, -2)}</strong>;
            if (part.startsWith("`"))
              return (
                <code key={j} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[12px] break-all">
                  {part.slice(1, -1)}
                </code>
              );
            return <span key={j}>{part}</span>;
          });
        if (line.startsWith("- ")) return <li key={i} className="ml-4 list-disc">{inline}</li>;
        if (line.startsWith("|"))
          return (
            <div key={i} className="font-mono text-xs text-muted-foreground">
              {line}
            </div>
          );
        return <p key={i}>{inline}</p>;
      })}
    </div>
  );
}

function InvestigatorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Upload and analyze a CSV log file, then ask me about the backend analysis.",
      createdAt: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || thinking) return;
    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", content: question, createdAt: Date.now() },
    ]);
    setThinking(true);
    const answer = await api.askInvestigator(question);
    setThinking(false);
    setMessages((prev) => [
      ...prev,
      { id: `a-${Date.now()}`, role: "assistant", content: answer, createdAt: Date.now() },
    ]);
  };

  return (
    <PageContainer className="max-w-4xl">
      <PageHeader
        eyebrow="ThreatPulse"
        title="AI Investigator"
        description="Answers are derived from the latest backend analysis."
      />

      <Card className="flex h-[calc(100vh-260px)] min-h-[520px] flex-col overflow-hidden py-0">
        <CardContent className="scroll-thin flex-1 space-y-5 overflow-y-auto p-6">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex gap-3", m.role === "user" && "justify-end")}
              >
                {m.role === "assistant" && (
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
                    <Bot className="size-4" />
                  </span>
                )}
                <div
                  className={cn(
                    "max-w-[78%] rounded-2xl border px-4 py-3",
                    m.role === "user" ? "bg-primary/10 border-primary/20" : "bg-card",
                  )}
                >
                  <Markdown text={m.content} />
                </div>
                {m.role === "user" && (
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <User className="size-4" />
                  </span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {thinking && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/12 text-primary">
                <Bot className="size-4" />
              </span>
              <div className="flex items-center gap-1.5 rounded-2xl border bg-card px-4 py-3">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
                    className="size-1.5 rounded-full bg-muted-foreground"
                  />
                ))}
                <span className="ml-2 text-xs text-muted-foreground">Correlating evidence…</span>
              </div>
            </motion.div>
          )}
          <div ref={endRef} />
        </CardContent>

        <div className="border-t bg-card p-4">
          <div className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              placeholder="Ask about the intrusion…"
              className="max-h-32 min-h-11 resize-none"
              rows={1}
            />
            <Button size="icon" className="size-11 shrink-0" onClick={() => void send(input)} disabled={thinking}>
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
}
