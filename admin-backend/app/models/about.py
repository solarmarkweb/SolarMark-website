from pydantic import BaseModel
from typing import List, Optional

class Stat(BaseModel):
    label: str
    value: str
    icon: str  # Icon name from lucide-react

class ProcessStep(BaseModel):
    step: str
    title: str
    description: str
    icon: str
    details: List[str]

class Capability(BaseModel):
    name: str
    description: str
    icon: str

class Value(BaseModel):
    title: str
    description: str
    icon: str

class AboutContent(BaseModel):
    hero_title: str
    hero_subtitle: str
    hero_description: str
    mission_title: str
    mission_text_1: str
    mission_text_2: str
    mission_highlights: List[str]
    stats: List[Stat]
    process: List[ProcessStep]
    capabilities: List[Capability]
    values: List[Value]
    drone_tech_title: str
    drone_tech_description: str
    drone_tech_specs: List[dict] # {label: str, value: str, status: str, color: str}