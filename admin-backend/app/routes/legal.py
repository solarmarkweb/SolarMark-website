from fastapi import APIRouter, HTTPException, Depends
from app.db import db
from app.models.legal import LegalContentUpdate, LegalContentResponse
from datetime import datetime
from typing import Optional

router = APIRouter()

@router.get("", response_model=LegalContentResponse)
async def get_legal_content():
    content = db.legal_content.find_one({"type": "main"})
    if not content:
        # Initial default content
        default_content = {
            "type": "main",
            "terms": "Default Terms and Conditions",
            "privacy": "Default Privacy Policy",
            "updated_at": datetime.utcnow()
        }
        db.legal_content.insert_one(default_content)
        return default_content
    
    return content

@router.post("", response_model=LegalContentResponse)
async def update_legal_content(data: LegalContentUpdate):
    update_data = {}
    if data.terms is not None:
        update_data["terms"] = data.terms
    if data.privacy is not None:
        update_data["privacy"] = data.privacy
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No content provided to update")
    
    update_data["updated_at"] = datetime.utcnow()
    
    result = db.legal_content.find_one_and_update(
        {"type": "main"},
        {"$set": update_data},
        upsert=True,
        return_document=True
    )
    
    return result
