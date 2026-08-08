import json
from collections import Counter

from dotenv import load_dotenv
from openai import APIError, OpenAI
from pydantic import ValidationError

from app.config import get_settings
from app.models import AnalysisResult

load_dotenv()

SAFE_RESULT = {
    "severityScore": 0,
    "attackCategory": "safe",
    "probableIntent": "safe",
    "damageDone": "safe",
    "timeline": [],
    "flowchart": {
        "nodes": [],
        "edges": [],
    },
}

SYSTEM_PROMPT = """
You are a cybersecurity log analyst. Analyze only the supplied logs.

Return a JSON object with exactly these fields:
- severityScore: integer from 0 to 100
- attackCategory: string
- probableIntent: string
- damageDone: string
- timeline: array of objects with timestamp, source, event, and evidence strings
- flowchart: object with nodes and edges arrays
  - nodes: array of objects with id, label, and detail strings
  - edges: array of objects with id, source, target, and label strings

Rules:
- Do not assume an attack happened.
- If the logs do not contain concrete evidence of malicious or suspicious activity,
  return:
  {
    "severityScore": 0,
    "attackCategory": "safe",
    "probableIntent": "safe",
    "damageDone": "safe",
    "timeline": [],
    "flowchart": {
      "nodes": [],
      "edges": []
    }
  }
- If an attack is detected, base every conclusion on the given log entries.
- The supplied logs may be compacted from a large CSV. Treat counts and sampled
  rows as evidence, but do not invent details that are not present.
- If an attack is detected, build the flowchart as a concise attack path from
  first evidenced step to final evidenced outcome.
- Flowchart node ids must be stable short strings such as "step-1", "step-2".
- Flowchart edges must connect existing node ids.
- Severity scoring guide:
  0 = safe, 1-30 = low, 31-60 = medium, 61-85 = high, 86-100 = critical.
- The timeline must include only events that support the conclusion, ordered by time
  when timestamps allow ordering.
- Return JSON only. Do not include markdown or prose outside the JSON object.
""".strip()


HIGH_SIGNAL_TERMS = (
    "critical",
    "error",
    "warning",
    "fail",
    "failed",
    "malware",
    "phishing",
    "credential",
    "powershell",
    "encoded",
    "lsass",
    "ransom",
    "exfil",
    "unauthorized",
    "suspicious",
    "blocked",
    "denied",
    "logon",
    "authentication",
    "privilege",
    "admin",
    "firewall",
    "dns",
)


def _event_key(event):
    return (
        str(event.get("timestamp", "")),
        str(event.get("source", "")),
        str(event.get("event", "")),
        str(event.get("severity", "")),
    )


def _event_text(event):
    return " ".join(str(value) for value in event.values()).lower()


def _compact_events(events, settings):
    counts_by_severity = Counter(str(event.get("severity") or "Unknown") for event in events)
    counts_by_source = Counter(str(event.get("source") or "Unknown") for event in events)
    unique_events = []
    seen = set()

    for event in events:
        key = _event_key(event)
        if key in seen:
            continue
        seen.add(key)
        unique_events.append(event)

    def priority(event):
        text = _event_text(event)
        score = 0
        severity = str(event.get("severity", "")).lower()
        if severity in {"critical", "error", "warning", "high"}:
            score += 10
        score += sum(1 for term in HIGH_SIGNAL_TERMS if term in text)
        return score

    high_signal = [event for event in unique_events if priority(event) > 0]
    high_signal.sort(key=priority, reverse=True)

    selected = []
    selected_keys = set()
    for event in high_signal:
        selected.append(event)
        selected_keys.add(_event_key(event))
        if len(selected) >= settings.max_ai_events:
            break

    if len(selected) < settings.max_ai_events:
        remaining_slots = settings.max_ai_events - len(selected)
        if remaining_slots > 0:
            stride = max(1, len(unique_events) // remaining_slots) if unique_events else 1
            for event in unique_events[::stride]:
                key = _event_key(event)
                if key in selected_keys:
                    continue
                selected.append(event)
                selected_keys.add(key)
                if len(selected) >= settings.max_ai_events:
                    break

    payload = {
        "total_events": len(events),
        "unique_events": len(unique_events),
        "events_sent_to_model": len(selected),
        "compacted": len(events) != len(selected),
        "counts_by_severity": dict(counts_by_severity.most_common()),
        "top_sources": dict(counts_by_source.most_common(20)),
        "events": selected,
    }

    content = json.dumps(payload, ensure_ascii=False)
    while len(content) > settings.max_ai_chars and len(payload["events"]) > 50:
        payload["events"] = payload["events"][: max(50, len(payload["events"]) // 2)]
        payload["events_sent_to_model"] = len(payload["events"])
        content = json.dumps(payload, ensure_ascii=False)

    return payload


def analyze(events):
    if not events:
        return SAFE_RESULT

    settings = get_settings()
    api_key = settings.ai_api_key
    if not api_key:
        raise RuntimeError("OPENROUTER_API_KEY or KIMI_API_KEY is not set in .env")

    client = OpenAI(
        api_key=api_key,
        base_url=settings.ai_base_url,
    )

    compacted_payload = _compact_events(events, settings)

    try:
        response = client.chat.completions.create(
            model=settings.ai_model,
            temperature=0,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": "Analyze this compacted CSV log payload and return the required JSON:\n"
                    + json.dumps(compacted_payload, ensure_ascii=False),
                },
            ],
        )
    except APIError as exc:
        raise RuntimeError(f"AI provider request failed: {exc}") from exc

    content = response.choices[0].message.content
    if not content:
        raise RuntimeError("AI provider returned an empty analysis")

    try:
        raw_result = json.loads(content)
        result = AnalysisResult.model_validate(raw_result)
    except (json.JSONDecodeError, ValidationError) as exc:
        raise RuntimeError("AI provider returned an invalid analysis format") from exc

    if result.severityScore == 0 or result.attackCategory.strip().lower() == "safe":
        return SAFE_RESULT

    return result.model_dump()
