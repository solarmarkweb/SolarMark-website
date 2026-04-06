from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import List, Optional
import uuid
import os
import shutil
from datetime import datetime
from bson import ObjectId
from app.db import db
from app.routes.auth import get_current_user

router = APIRouter(prefix="/footer-social", tags=["Footer Social"])

UPLOAD_DIR = "uploads/footer_icons"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("")
async def get_social_links():
    links = list(db.footer_social.find({}))
    
    # If no links in D
    # B, we could either return empty or seed once.
    # To satisfy the user's need to delete them, we shouldn't return hardcoded ones.
    # If we want to provide a starting point, we'd seed them into the DB.
    
    result = []
    for link in links:
        result.append({
            "id": str(link["_id"]),
            "platform": link.get("platform", ""),
            "url": link.get("url", ""),
            "icon_url": link.get("icon_url", ""),
            "order": link.get("order", 0)
        })
    
    return sorted(result, key=lambda x: x["order"])

@router.post("/upload")
async def add_social_link(
    platform: str = Form(...),
    url: str = Form(...),
    order: int = Form(0),
    file: Optional[UploadFile] = File(None),
    current_user: dict = Depends(get_current_user)
):
    print(f"DEBUG: add_social_link called for platform: {platform}, url: {url}")
    if not current_user.get("is_admin"):
        print("DEBUG: User is not an admin")
        raise HTTPException(status_code=403, detail="Only admins can manage footer social links")
    
    icon_url = ""
    if file and file.filename:
        print(f"DEBUG: Processing file upload: {file.filename}")
        file_ext = file.filename.split(".")[-1]
        unique_filename = f"{uuid.uuid4()}.{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        icon_url = f"/uploads/footer_icons/{unique_filename}"
    
    link_doc = {
        "platform": platform,
        "url": url,
        "order": order,
        "icon_url": icon_url,
        "created_at": datetime.utcnow()
    }
    
    result = db.footer_social.insert_one(link_doc)
    return {"id": str(result.inserted_id), "icon_url": icon_url}

@router.delete("/{link_id}")
async def delete_social_link(link_id: str, current_user: dict = Depends(get_current_user)):
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Only admins can delete footer social links")
    
    if not ObjectId.is_valid(link_id):
        raise HTTPException(status_code=400, detail="Invalid link ID format")
        
    result = db.footer_social.delete_one({"_id": ObjectId(link_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Social link not found")
        
    return {"message": "Link deleted successfully"}
