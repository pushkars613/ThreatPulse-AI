def analyze(events):
    return {
        "summary": "Possible phishing attack detected.",
        "risk_score": 94,
        "severity": "Critical",
        "timeline": events,
        "mitre": [
            "T1566 - Phishing",
            "T1059 - Command Execution",
            "T1003 - Credential Dumping"
        ],
        "recommendations": [
            "Reset compromised credentials.",
            "Isolate affected host.",
            "Run full malware scan."
        ]
    }