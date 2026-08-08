import csv


def _first_value(row, columns):
    for column in columns:
        if column in row and row[column] is not None:
            value = str(row[column]).strip()
            if value:
                return value
    return ""


def parse_csv(file_path):
    with open(file_path, newline="", encoding="utf-8-sig") as handle:
        rows = list(csv.reader(handle))

    if not rows:
        return []

    headers = [str(column).strip().lstrip("\ufeff") for column in rows[0]]
    events = []

    for raw_row in rows[1:]:
        if not any(str(value).strip() for value in raw_row):
            continue

        row = {header: raw_row[index] if index < len(raw_row) else "" for index, header in enumerate(headers)}
        if len(raw_row) > len(headers):
            row["Message"] = " ".join(str(value).strip() for value in raw_row[len(headers):] if str(value).strip())

        timestamp = _first_value(
            row,
            ["timestamp", "Timestamp", "time", "Time", "date", "Date", "Date and Time"],
        )
        source = _first_value(row, ["source", "Source", "provider", "Provider", "channel", "Channel"])
        severity = _first_value(row, ["severity", "Severity", "level", "Level"])
        event_text = _first_value(
            row,
            ["event", "Event", "message", "Message", "description", "Description"],
        )

        if not event_text:
            event_parts = []
            for column in ["Event ID", "event_id", "EventID", "Task Category", "TaskCategory"]:
                value = _first_value(row, [column])
                if value:
                    event_parts.append(f"{column}: {value}")
            event_text = "; ".join(event_parts)

        events.append({
            "timestamp": timestamp,
            "source": source or "CSV",
            "event": event_text,
            "severity": severity or "Medium",
        })

    return events
