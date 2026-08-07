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

export const kpiSummary: KpiSummary = {
  totalInvestigations: 148,
  activeIncidents: 12,
  critical: 4,
  medium: 21,
  low: 37,
};

export const investigations: Investigation[] = [
  {
    id: "INV-2481",
    name: "Finance phishing → credential theft",
    analyst: "M. Okafor",
    createdAt: "2026-08-07T09:31:00Z",
    status: "active",
    severity: "critical",
    riskScore: 92,
    evidenceCount: 34,
    attackCategory: "Phishing",
  },
  {
    id: "INV-2477",
    name: "Suspicious PowerShell on WKS-2213",
    analyst: "A. Lindqvist",
    createdAt: "2026-08-06T14:12:00Z",
    status: "processing",
    severity: "high",
    riskScore: 78,
    evidenceCount: 19,
    attackCategory: "Living off the land",
  },
  {
    id: "INV-2470",
    name: "Impossible travel — VPN gateway",
    analyst: "R. Delgado",
    createdAt: "2026-08-05T08:04:00Z",
    status: "active",
    severity: "medium",
    riskScore: 54,
    evidenceCount: 11,
    attackCategory: "Account compromise",
  },
  {
    id: "INV-2464",
    name: "Ransomware canary triggered — FS01",
    analyst: "M. Okafor",
    createdAt: "2026-08-03T21:47:00Z",
    status: "resolved",
    severity: "critical",
    riskScore: 88,
    evidenceCount: 42,
    attackCategory: "Ransomware",
  },
  {
    id: "INV-2459",
    name: "Excessive S3 reads from service account",
    analyst: "K. Tanaka",
    createdAt: "2026-08-02T11:20:00Z",
    status: "resolved",
    severity: "low",
    riskScore: 27,
    evidenceCount: 8,
    attackCategory: "Data exposure",
  },
  {
    id: "INV-2452",
    name: "Malicious OAuth consent grant",
    analyst: "A. Lindqvist",
    createdAt: "2026-07-31T16:38:00Z",
    status: "active",
    severity: "high",
    riskScore: 71,
    evidenceCount: 15,
    attackCategory: "Identity",
  },
];

export const severityDistribution = [
  { name: "Critical", value: 18, key: "critical" },
  { name: "High", value: 34, key: "high" },
  { name: "Medium", value: 51, key: "medium" },
  { name: "Low", value: 45, key: "low" },
];

export const attackCategories = [
  { category: "Phishing", count: 42 },
  { category: "Ransomware", count: 18 },
  { category: "Identity", count: 27 },
  { category: "Insider", count: 9 },
  { category: "Exfiltration", count: 23 },
  { category: "Malware", count: 29 },
];

export const monthlyInvestigations = [
  { month: "Feb", investigations: 14, incidents: 5 },
  { month: "Mar", investigations: 19, incidents: 7 },
  { month: "Apr", investigations: 23, incidents: 9 },
  { month: "May", investigations: 21, incidents: 6 },
  { month: "Jun", investigations: 28, incidents: 12 },
  { month: "Jul", investigations: 31, incidents: 11 },
  { month: "Aug", investigations: 26, incidents: 12 },
];

export const incidentOverview: IncidentOverview = {
  riskScore: 92,
  severity: "critical",
  affectedUsers: 3,
  affectedDevices: 5,
  malwareFamily: "AgentTesla (loader: invoice.exe)",
  attackDuration: "10 minutes",
  evidenceCount: 34,
  summary:
    "A targeted phishing email impersonating a supplier invoice reached three finance mailboxes. One user opened the link in Chrome and executed invoice.exe, which spawned an obfuscated PowerShell loader, established Run-key persistence, dumped LSASS credentials, and exfiltrated 42 MB of archived documents to an external host over HTTPS.",
};

export const timelineEvents: TimelineEvent[] = [
  {
    id: "evt-1",
    time: "09:31:04",
    title: "Phishing email received",
    description: "Invoice-themed email from spoofed supplier domain delivered to finance mailbox.",
    severity: "medium",
    source: "Exchange message trace",
    host: "MAIL-EDGE-01",
    user: "j.rivera@northwind.io",
    techniqueId: "T1566.002",
    details: {
      Sender: "billing@northwmd-supplies.com",
      Subject: "Outstanding invoice #INV-88213 — action required",
      SPF: "fail",
      DKIM: "none",
      "Link domain": "cdn-invoicecloud[.]net",
    },
  },
  {
    id: "evt-2",
    time: "09:34:47",
    title: "User clicked embedded link",
    description: "Chrome navigated to attacker-controlled landing page hosting a fake document viewer.",
    severity: "high",
    source: "Proxy logs",
    host: "WKS-2213",
    user: "j.rivera",
    techniqueId: "T1566.002",
    details: {
      URL: "https://cdn-invoicecloud[.]net/view/88213",
      "Response code": "200",
      Referrer: "Outlook desktop",
      "Bytes received": "184 KB",
    },
  },
  {
    id: "evt-3",
    time: "09:35:22",
    title: "invoice.exe downloaded",
    description: "Executable written to the user Downloads folder, unsigned and freshly compiled.",
    severity: "critical",
    source: "Sysmon EID 11",
    host: "WKS-2213",
    user: "j.rivera",
    techniqueId: "T1204.002",
    details: {
      Path: "C:\\Users\\j.rivera\\Downloads\\invoice.exe",
      SHA256: "9f2b1c4e77aa03e1b8de4a51c2f0b9d3e7a6c8f10b2d4e6a8c0f2b4d6e8a0c22",
      Signer: "unsigned",
      Size: "412 KB",
    },
  },
  {
    id: "evt-4",
    time: "09:36:09",
    title: "PowerShell executed with encoded command",
    description: "invoice.exe spawned powershell.exe with a base64 -EncodedCommand payload.",
    severity: "critical",
    source: "Sysmon EID 1",
    host: "WKS-2213",
    user: "j.rivera",
    techniqueId: "T1059.001",
    details: {
      Parent: "invoice.exe",
      "Command line": "powershell.exe -nop -w hidden -EncodedCommand JABzAD0A...",
      "Integrity level": "Medium",
      "Network calls": "2",
    },
  },
  {
    id: "evt-5",
    time: "09:37:31",
    title: "Persistence added via Run key",
    description: "Registry autorun value created pointing at the loader in AppData.",
    severity: "high",
    source: "Sysmon EID 13",
    host: "WKS-2213",
    user: "j.rivera",
    techniqueId: "T1547.001",
    details: {
      Key: "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run",
      Value: "OneDriveSyncHost",
      Data: "C:\\Users\\j.rivera\\AppData\\Roaming\\odsync.exe",
    },
  },
  {
    id: "evt-6",
    time: "09:39:12",
    title: "Credential dumping against LSASS",
    description: "Handle opened to lsass.exe with read-memory access from the PowerShell process.",
    severity: "critical",
    source: "Sysmon EID 10",
    host: "WKS-2213",
    user: "j.rivera",
    techniqueId: "T1003.001",
    details: {
      Target: "lsass.exe (PID 728)",
      "Granted access": "0x1010",
      "Call trace": "UNKNOWN(ntdll.dll+9a534)",
      "Credentials at risk": "4 cached accounts",
    },
  },
  {
    id: "evt-7",
    time: "09:41:58",
    title: "Data exfiltration to external server",
    description: "42 MB archive uploaded over HTTPS to an unclassified hosting provider.",
    severity: "critical",
    source: "Firewall netflow",
    host: "WKS-2213",
    user: "j.rivera",
    techniqueId: "T1041",
    details: {
      Destination: "185.212.44.19:443",
      "Bytes out": "42.3 MB",
      Duration: "94 s",
      "ASN": "AS204957 — bulletproof hosting",
    },
  },
];

export const mitreTechniques: MitreTechnique[] = [
  {
    id: "T1566.002",
    name: "Spearphishing Link",
    tactic: "Initial Access",
    confidence: 96,
    severity: "high",
    description: "Invoice-themed email with a link to an attacker-controlled document viewer.",
    relatedEventIds: ["evt-1", "evt-2"],
  },
  {
    id: "T1204.002",
    name: "Malicious File",
    tactic: "Execution",
    confidence: 93,
    severity: "critical",
    description: "User executed the downloaded invoice.exe loader.",
    relatedEventIds: ["evt-3"],
  },
  {
    id: "T1059.001",
    name: "PowerShell",
    tactic: "Execution",
    confidence: 98,
    severity: "critical",
    description: "Hidden, encoded PowerShell command launched by the loader.",
    relatedEventIds: ["evt-4"],
  },
  {
    id: "T1547.001",
    name: "Registry Run Keys",
    tactic: "Persistence",
    confidence: 89,
    severity: "high",
    description: "Autorun value created to survive reboot.",
    relatedEventIds: ["evt-5"],
  },
  {
    id: "T1003.001",
    name: "LSASS Memory",
    tactic: "Credential Access",
    confidence: 91,
    severity: "critical",
    description: "Memory read handle opened against LSASS to harvest credentials.",
    relatedEventIds: ["evt-6"],
  },
  {
    id: "T1041",
    name: "Exfiltration Over C2 Channel",
    tactic: "Exfiltration",
    confidence: 87,
    severity: "critical",
    description: "Archived documents sent to external infrastructure over HTTPS.",
    relatedEventIds: ["evt-7"],
  },
  {
    id: "T1112",
    name: "Modify Registry",
    tactic: "Defense Evasion",
    confidence: 64,
    severity: "medium",
    description: "Defender exclusion path added under the user profile.",
    relatedEventIds: ["evt-5"],
  },
  {
    id: "T1082",
    name: "System Information Discovery",
    tactic: "Discovery",
    confidence: 58,
    severity: "low",
    description: "Host inventory commands run shortly after execution.",
    relatedEventIds: ["evt-4"],
  },
];

export const iocs: Ioc[] = [
  { type: "Domain", value: "cdn-invoicecloud[.]net", severity: "critical", context: "Phishing landing page" },
  { type: "IPv4", value: "185.212.44.19", severity: "critical", context: "Exfiltration endpoint" },
  {
    type: "SHA256",
    value: "9f2b1c4e77aa03e1b8de4a51c2f0b9d3e7a6c8f10b2d4e6a8c0f2b4d6e8a0c22",
    severity: "critical",
    context: "invoice.exe loader",
  },
  { type: "Email", value: "billing@northwmd-supplies.com", severity: "high", context: "Spoofed sender" },
  {
    type: "Registry",
    value: "HKCU\\...\\Run\\OneDriveSyncHost",
    severity: "high",
    context: "Persistence mechanism",
  },
  { type: "Filename", value: "odsync.exe", severity: "medium", context: "Copied loader in AppData" },
];

export const graphNodes: GraphNodeData[] = [
  { id: "attacker", label: "Attacker", kind: "attacker", detail: "AS204957 · bulletproof hosting", severity: "critical", position: { x: 0, y: 0 } },
  { id: "email", label: "Phishing Email", kind: "email", detail: "INV-88213 · SPF fail", severity: "high", position: { x: 0, y: 130 } },
  { id: "victim", label: "j.rivera", kind: "user", detail: "Finance · WKS-2213", severity: "high", position: { x: 0, y: 260 } },
  { id: "chrome", label: "chrome.exe", kind: "app", detail: "Opened landing page", severity: "medium", position: { x: 0, y: 390 } },
  { id: "invoice", label: "invoice.exe", kind: "file", detail: "Unsigned loader · 412 KB", severity: "critical", position: { x: 0, y: 520 } },
  { id: "powershell", label: "powershell.exe", kind: "process", detail: "-EncodedCommand · hidden", severity: "critical", position: { x: 0, y: 650 } },
  { id: "registry", label: "Registry Run Key", kind: "registry", detail: "OneDriveSyncHost", severity: "high", position: { x: -220, y: 780 } },
  { id: "lsass", label: "LSASS", kind: "system", detail: "Credential dumping", severity: "critical", position: { x: 220, y: 780 } },
  { id: "external", label: "185.212.44.19", kind: "server", detail: "42.3 MB exfiltrated", severity: "critical", position: { x: 0, y: 910 } },
];

export const graphEdges: GraphEdgeData[] = [
  { id: "e1", source: "attacker", target: "email", label: "sent" },
  { id: "e2", source: "email", target: "victim", label: "delivered" },
  { id: "e3", source: "victim", target: "chrome", label: "clicked link" },
  { id: "e4", source: "chrome", target: "invoice", label: "downloaded" },
  { id: "e5", source: "invoice", target: "powershell", label: "spawned" },
  { id: "e6", source: "powershell", target: "registry", label: "persistence" },
  { id: "e7", source: "powershell", target: "lsass", label: "read memory" },
  { id: "e8", source: "lsass", target: "external", label: "credentials out" },
  { id: "e9", source: "registry", target: "external", label: "beacon" },
];

export const evidenceTree: EvidenceNode[] = [
  {
    id: "windows",
    label: "Windows Logs",
    kind: "folder",
    children: [
      {
        id: "security-evtx",
        label: "Security.evtx",
        kind: "file",
        fileType: "evtx",
        content: `EventID: 4624  Logon Type: 2   Account: NORTHWIND\\j.rivera   Host: WKS-2213  Time: 09:12:41
EventID: 4688  New Process: C:\\Users\\j.rivera\\Downloads\\invoice.exe  Parent: chrome.exe  Time: 09:35:58
EventID: 4688  New Process: powershell.exe -nop -w hidden -EncodedCommand JABzAD0A...  Time: 09:36:09
EventID: 4657  Registry value modified: HKCU\\...\\Run\\OneDriveSyncHost  Time: 09:37:31
EventID: 4663  Object Access: lsass.exe  Access: 0x1010  Time: 09:39:12`,
      },
      {
        id: "sysmon-evtx",
        label: "Sysmon-Operational.evtx",
        kind: "file",
        fileType: "evtx",
        content: `EID 1  ProcessCreate  Image=invoice.exe  Hashes=SHA256=9f2b1c4e77aa...  ParentImage=chrome.exe
EID 3  NetworkConnect Image=powershell.exe DestinationIp=185.212.44.19 DestinationPort=443
EID 10 ProcessAccess  SourceImage=powershell.exe TargetImage=lsass.exe GrantedAccess=0x1010
EID 11 FileCreate     TargetFilename=C:\\Users\\j.rivera\\AppData\\Roaming\\odsync.exe
EID 13 RegistryEvent  TargetObject=HKCU\\...\\Run\\OneDriveSyncHost Details=odsync.exe`,
      },
    ],
  },
  {
    id: "emails",
    label: "Emails",
    kind: "folder",
    children: [
      {
        id: "invoice-eml",
        label: "invoice-88213.eml",
        kind: "file",
        fileType: "eml",
        content: `From: "Northwind Supplies Billing" <billing@northwmd-supplies.com>
To: j.rivera@northwind.io
Subject: Outstanding invoice #INV-88213 - action required
Date: Fri, 07 Aug 2026 09:31:04 +0000
Authentication-Results: spf=fail dkim=none dmarc=fail
X-Originating-IP: 185.212.44.19

Dear Jordan,

Your invoice remains unpaid. Review the statement here:
https://cdn-invoicecloud[.]net/view/88213

Regards,
Accounts Receivable`,
      },
    ],
  },
  {
    id: "browser",
    label: "Browser",
    kind: "folder",
    children: [
      {
        id: "history-json",
        label: "chrome-history.json",
        kind: "file",
        fileType: "json",
        content: `[
  { "ts": "09:34:47", "url": "https://cdn-invoicecloud[.]net/view/88213", "title": "Invoice Viewer", "transition": "link" },
  { "ts": "09:35:12", "url": "https://cdn-invoicecloud[.]net/dl/invoice.exe", "title": "Download", "transition": "auto" },
  { "ts": "09:35:22", "url": "file:///C:/Users/j.rivera/Downloads/invoice.exe", "title": "invoice.exe", "transition": "generated" }
]`,
      },
    ],
  },
  {
    id: "screenshots",
    label: "Screenshots",
    kind: "folder",
    children: [
      {
        id: "ss1",
        label: "landing-page.png",
        kind: "file",
        fileType: "png",
        content: `[image/png] landing-page.png · 1440x900 · captured 09:34:59
OCR extract:
  "Your document is protected. Download the secure viewer to continue."
  Button label: "Download Viewer (invoice.exe)"
Perceptual hash: p:8f31a0c7b2d94e15`,
      },
    ],
  },
  {
    id: "csv",
    label: "CSV Logs",
    kind: "folder",
    children: [
      {
        id: "netflow-csv",
        label: "firewall-netflow.csv",
        kind: "file",
        fileType: "csv",
        content: `timestamp,src_ip,dst_ip,dst_port,proto,bytes_out,verdict
09:36:11,10.14.22.31,185.212.44.19,443,tcp,4821,allow
09:39:20,10.14.22.31,185.212.44.19,443,tcp,118422,allow
09:41:58,10.14.22.31,185.212.44.19,443,tcp,44312880,allow
09:43:30,10.14.22.31,185.212.44.19,443,tcp,2140,allow`,
      },
    ],
  },
  {
    id: "jsonlogs",
    label: "JSON Logs",
    kind: "folder",
    children: [
      {
        id: "edr-json",
        label: "edr-detections.json",
        kind: "file",
        fileType: "json",
        content: `{
  "detections": [
    { "id": "d-1", "rule": "Encoded PowerShell from user-writable path", "severity": "critical", "ts": "09:36:09" },
    { "id": "d-2", "rule": "LSASS handle with read access", "severity": "critical", "ts": "09:39:12" },
    { "id": "d-3", "rule": "Autorun key created by non-installer", "severity": "high", "ts": "09:37:31" }
  ],
  "host": "WKS-2213",
  "agent_version": "7.4.1"
}`,
      },
    ],
  },
];

export const pipelineStages: PipelineStage[] = [
  { id: "upload", label: "Uploading Evidence", description: "Transferring artifacts to the secure evidence store" },
  { id: "parse", label: "Parsing Files", description: "Decoding EVTX, EML, CSV and JSON structures" },
  { id: "extract", label: "Extracting Events", description: "Pulling atomic events from every artifact" },
  { id: "normalize", label: "Normalizing Evidence", description: "Mapping fields to the unified schema" },
  { id: "timeline", label: "Building Timeline", description: "Ordering events into a single chronology" },
  { id: "correlate", label: "Correlating Events", description: "Linking activity across hosts and identities" },
  { id: "detect", label: "Threat Detection", description: "Scoring behaviours against detection logic" },
  { id: "mitre", label: "MITRE Mapping", description: "Attributing behaviours to ATT&CK techniques" },
  { id: "graph", label: "Generating Attack Graph", description: "Reconstructing the attack path" },
  { id: "report", label: "Generating Report", description: "Drafting the incident narrative" },
];

export const suggestedPrompts = [
  "How did the attacker gain access?",
  "Which file started the attack?",
  "Show persistence methods.",
  "Was data exfiltrated?",
  "What indicators of compromise were found?",
];

export const aiAnswers: { match: RegExp; answer: string }[] = [
  {
    match: /access|initial|entry|phish/i,
    answer: `**Initial access was a spearphishing link (T1566.002).**

At 09:31:04 a message impersonating *Northwind Supplies* reached j.rivera@northwind.io. SPF failed and DKIM was absent, but the mail passed the legacy allow-list rule for supplier domains.

At 09:34:47 the user opened \`https://cdn-invoicecloud[.]net/view/88213\` in Chrome — a fake document viewer that offered a "secure viewer" download.

Confidence: **96%**, corroborated by the Exchange message trace, proxy logs and the landing page screenshot.`,
  },
  {
    match: /file|started|loader|invoice/i,
    answer: `**invoice.exe** started the intrusion.

- Path: \`C:\\Users\\j.rivera\\Downloads\\invoice.exe\`
- SHA256: \`9f2b1c4e77aa03e1b8de4a51c2f0b9d3e7a6c8f10b2d4e6a8c0f2b4d6e8a0c22\`
- Unsigned, compiled 6 hours before delivery, 412 KB
- Written at 09:35:22 by chrome.exe, executed at 09:35:58

It acted purely as a loader: it dropped \`odsync.exe\` into AppData and launched an encoded PowerShell stage (T1204.002 → T1059.001).`,
  },
  {
    match: /persist/i,
    answer: `**One persistence mechanism was confirmed (T1547.001).**

At 09:37:31 the PowerShell stage created:

\`HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\OneDriveSyncHost\` → \`C:\\Users\\j.rivera\\AppData\\Roaming\\odsync.exe\`

No scheduled task, service, or WMI subscription was observed. A Defender exclusion for the AppData path was also added (T1112), which is a supporting evasion rather than persistence.`,
  },
  {
    match: /exfil|data|leak|stolen/i,
    answer: `**Yes — 42.3 MB left the environment.**

At 09:41:58 WKS-2213 uploaded a single archive to \`185.212.44.19:443\` over HTTPS in 94 seconds (T1041). Netflow shows three earlier beacons of a few kilobytes each, consistent with C2 check-ins.

Based on file-access telemetry immediately prior, the archive most likely contained finance share documents from \`\\\\FS01\\Finance\\2026\\Q3\`. No DLP inspection was possible because the channel was TLS-encrypted.`,
  },
  {
    match: /ioc|indicator|compromise/i,
    answer: `**Six high-confidence indicators were extracted:**

| Type | Value | Context |
| --- | --- | --- |
| Domain | cdn-invoicecloud[.]net | Phishing landing page |
| IPv4 | 185.212.44.19 | C2 / exfiltration |
| SHA256 | 9f2b1c4e77aa… | invoice.exe loader |
| Email | billing@northwmd-supplies.com | Spoofed sender |
| Registry | HKCU\\…\\Run\\OneDriveSyncHost | Persistence |
| Filename | odsync.exe | AppData loader copy |

All six are ready to push to the EDR block list and mail gateway.`,
  },
];

export const fallbackAnswer = `I correlated 34 evidence artifacts for **INV-2481** but could not match that question to a specific finding.

Here is the short version of the incident: a spearphishing link led to execution of \`invoice.exe\` on WKS-2213 at 09:35, an encoded PowerShell stage established Run-key persistence, dumped LSASS credentials, and exfiltrated 42.3 MB to 185.212.44.19 by 09:42.

Try asking about initial access, persistence, credential access, or exfiltration.`;
