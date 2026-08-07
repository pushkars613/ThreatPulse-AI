from pydantic import BaseModel

class Event(BaseModel):
    timestamp: str
    source: str
    event: str
    severity: str