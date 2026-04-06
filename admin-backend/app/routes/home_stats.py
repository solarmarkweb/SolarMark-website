from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from app.db import db
from bson import ObjectId

router = APIRouter(prefix="/home-stats", tags=["Home Stats"])

class StatItem(BaseModel):
    num: str
    label: str

class HomeStatsUpdate(BaseModel):
    stats: List[StatItem]

@router.get("")
async def get_home_stats():
    record = db.home_stats.find_one({})
    if not record:
        return [
            { "num": "5-20%", "label": "Avg. energy loss from undetected faults in typical solar sites" },
            { "num": "17+", "label": "Distinct fault types detected — thermal and visual — in one pass" },
            { "num": "100x", "label": "Faster than manual walkdown inspection, with far higher accuracy" },
            { "num": "48hr", "label": "From flight to a full GPS-tagged, actionable report per module" }
        ]
    return record.get("stats", [])

@router.post("")
async def update_home_stats(data: HomeStatsUpdate):
    db.home_stats.delete_many({})
    db.home_stats.insert_one({"stats": [s.dict() for s in data.stats]})
    return {"message": "Home stats updated successfully"}
