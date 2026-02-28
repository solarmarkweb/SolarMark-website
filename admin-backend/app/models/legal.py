from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class LegalContentUpdate(BaseModel):
    terms: Optional[str] = Field(None, description="Terms and Conditions content")
    privacy: Optional[str] = Field(None, description="Privacy Policy content")

class LegalContentResponse(BaseModel):
    terms: str
    privacy: str
    updated_at: datetime
