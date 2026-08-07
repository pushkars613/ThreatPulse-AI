import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bot,
  FileText,
  GitBranch,
  LayoutDashboard,
  ListTree,
  Settings,
  ShieldCheck,
  Clock3,
  UploadCloud,
  FolderSearch,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/investigations", label: "Investigations", icon: ListTree, exact: false },
  { to: "/upload", label: "Upload Evidence", icon: UploadCloud, exact: false },
  { to: "/evidence", label: "Evidence Explorer", icon: FolderSearch, exact: false },
  { to: "/attack-graph", label: "Attack Graph", icon: GitBranch, exact: false },
  { to: "/timeline", label: "Timeline", icon: Clock3, exact: false },
  { to: "/investigator", label: "AI Investigator", icon: Bot, exact: false },
  { to: "/reports", label: "Reports", icon: FileText, exact: false },
  { to: "/settings", label: "Settings", icon: Settings, exact: false },
] as const;

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <ShieldCheck className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-sidebar-foreground">ThreatVision AI</p>
          <p className="text-[11px] text-muted-foreground">DFIR Platform</p>
        </div>
      </div>

      <div className="scroll-thin flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        <p className="px-3 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Workspace
        </p>
        {navItems.map((item) => {
          const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
            >
              <item.icon className={cn("size-[18px]", active && "text-primary")} />
              <span>{item.label}</span>
              {active && <span className="ml-auto h-4 w-1 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </div>

      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-xl bg-accent/60 p-3">
          <p className="text-xs font-semibold text-accent-foreground">Detection content</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Ruleset 2026.08 · synced 4 min ago</p>
        </div>
      </div>
    </nav>
  );
}
