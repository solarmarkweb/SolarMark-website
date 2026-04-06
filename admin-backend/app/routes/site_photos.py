from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import List, Optional
import uuid
import os
import shutil
from datetime import datetime
from bson import ObjectId
from app.db import db
from app.routes.auth import get_current_user

router = APIRouter(prefix="/site-photos", tags=["site-photos"])

UPLOAD_DIR = "uploads/site_photos"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_site_photo(
    file: UploadFile = File(...),
    title: str = Form(""),
    description: str = Form(""),
    category: str = Form("general"),
    current_user: dict = Depends(get_current_user)
):
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Only admins can upload site photos")
    
    file_ext = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    photo_doc = {
        "filename": unique_filename,
        "original_filename": file.filename,
        "title": title,
        "description": description,
        "category": category,
        "url": f"/uploads/site_photos/{unique_filename}",
        "uploaded_at": datetime.utcnow(),
        "status": "active"
    }
    
    result = db.site_photos.insert_one(photo_doc)
    
    return {
        "id": str(result.inserted_id),
        "url": photo_doc["url"],
        "title": title,
        "category": category
    }

@router.post("/create-from-url")
async def create_site_photo_from_url(
    payload: dict,
    current_user: dict = Depends(get_current_user)
):
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Only admins can add site photos")
    
    url = payload.get("url")
    title = payload.get("title", "")
    description = payload.get("description", "")
    category = payload.get("category", "general")
    
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")
        
    photo_doc = {
        "title": title,
        "description": description,
        "category": category,
        "url": url,
        "uploaded_at": datetime.utcnow(),
        "status": "active"
    }
    
    result = db.site_photos.insert_one(photo_doc)
    
    return {
        "id": str(result.inserted_id),
        "url": url,
        "title": title,
        "category": category
    }

from typing import List, Optional, Dict, Any

@router.get("", response_model=List[dict])
async def get_site_photos(category: Optional[str] = None):
    query: Dict[str, Any] = {"status": "active"}
    if category and category != "all":
        query["category"] = category
        
    photos = list(db.site_photos.find(query).sort("uploaded_at", -1))
    
    result = []
    for photo in photos:
        result.append({
            "id": str(photo["_id"]),
            "url": photo["url"],
            "title": photo.get("title", ""),
            "description": photo.get("description", ""),
            "category": photo.get("category", "general"),
            "uploaded_at": photo["uploaded_at"].isoformat()
        })
    
    return result

@router.delete("/{photo_id}")
async def delete_site_photo(photo_id: str, current_user: dict = Depends(get_current_user)):
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Only admins can delete site photos")
    
    photo = db.site_photos.find_one({"_id": ObjectId(photo_id)})
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    
    # Optional: Delete physical file
    # file_path = os.path.join(UPLOAD_DIR, photo["filename"])
    # if os.path.exists(file_path):
    #     os.remove(file_path)
    
    db.site_photos.delete_one({"_id": ObjectId(photo_id)})
    
    return {"message": "Photo deleted successfully"}
