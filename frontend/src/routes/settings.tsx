import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "@/hooks/useTheme";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — ThreatVision AI" },
      { name: "description", content: "Configure workspace profile, detection sensitivity, retention and notification preferences." },
      { property: "og:title", content: "Settings — ThreatVision AI" },
      { property: "og:description", content: "Workspace and detection configuration for your DFIR tenant." },
    ],
  }),
  component: SettingsPage,
});

function ToggleRow({ label, description, defaultChecked = false }: { label: string; description: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-6 py-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}

function SettingsPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        description="Preferences apply to your analyst profile."
        actions={<Button onClick={() => toast.success("Settings saved")}>Save changes</Button>}
      />

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Display name</Label>
              <Input id="name" placeholder="Analyst name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="analyst@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" placeholder="Analyst role" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tz">Timezone</Label>
              <Select defaultValue="utc">
                <SelectTrigger id="tz">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="utc">UTC</SelectItem>
                  <SelectItem value="cet">Europe/Berlin</SelectItem>
                  <SelectItem value="est">America/New_York</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-6">
              <div>
                <p className="text-sm font-medium">Dark slate theme</p>
                <p className="text-xs text-muted-foreground">Recommended for extended SOC shifts.</p>
              </div>
              <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detection & analysis</CardTitle>
          </CardHeader>
          <CardContent className="divide-y py-0">
            <ToggleRow label="Auto-escalate critical findings" description="Page the on-call responder when risk score exceeds 85." defaultChecked />
            <ToggleRow label="AI narrative generation" description="Draft the executive summary as soon as correlation completes." defaultChecked />
            <ToggleRow label="Automatic IOC enrichment" description="Query threat intel providers for every extracted indicator." defaultChecked />
            <ToggleRow label="Experimental graph inference" description="Infer likely lateral movement paths from partial telemetry." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="divide-y py-0">
            <ToggleRow label="Email digests" description="Daily summary of open investigations at 08:00." defaultChecked />
            <ToggleRow label="Pipeline completion" description="Notify when evidence processing finishes." defaultChecked />
            <ToggleRow label="Weekly posture report" description="Trend report across all cases every Monday." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Evidence retention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="retention">Retention window</Label>
              <Select defaultValue="365">
                <SelectTrigger id="retention">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                  <SelectItem value="1095">3 years</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <p className="text-xs text-muted-foreground">
              Evidence is stored write-once with SHA-256 chain of custody. Deletion requires two-person approval.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
