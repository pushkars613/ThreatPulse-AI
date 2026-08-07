import pandas as pd

def parse_csv(file_path):
    df = pd.read_csv(file_path)

    events = []

    for _, row in df.iterrows():
        events.append({
            "timestamp": str(row.get("timestamp", "")),
            "source": str(row.get("source", "CSV")),
            "event": str(row.get("event", "")),
            "severity": str(row.get("severity", "Medium"))
        })

    return events