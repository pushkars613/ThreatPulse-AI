from pydantic import BaseModel, Field

class Event(BaseModel):
    timestamp: str
    source: str
    event: str
    severity: str


class TimelineItem(BaseModel):
    timestamp: str
    source: str = ""
    event: str
    evidence: str = ""


class FlowchartNode(BaseModel):
    id: str
    label: str
    detail: str = ""


class FlowchartEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str = ""


class AttackFlowchart(BaseModel):
    nodes: list[FlowchartNode]
    edges: list[FlowchartEdge]


class AnalysisResult(BaseModel):
    severityScore: int = Field(ge=0, le=100)
    attackCategory: str
    probableIntent: str
    damageDone: str
    timeline: list[TimelineItem]
    flowchart: AttackFlowchart
