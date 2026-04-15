from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from app.db import db
from datetime import datetime
from typing import List, Optional, Dict
from bson import ObjectId
import gridfs
from pydantic import BaseModel
from app.auth import generate_user_code, format_user_response
import os

router = APIRouter(prefix="/external", tags=["External Integration"])
fs = gridfs.GridFS(db)

# Models
class ExternalUserResponse(BaseModel):
    id: str
    user_code: str
    first_name: str
    last_name: str
    email: str
    status: str = "active"

class FolderItem(BaseModel):
    id: str
    name: str
    type: str  # 'asset' or 'report'
    children: Optional[List['FolderItem']] = None

# 1. Share User ID/Info API
@router.get("/user/{identifier}", response_model=ExternalUserResponse)
async def get_external_user(identifier: str):
    """
    Search for a user by email or user_code. 
    This allows external platforms to verify user existence and get their ID.
    """
    query = {"$or": [
        {"email": identifier.lower()},
        {"user_code": identifier}
    ]}
    
    user = db.users.find_one(query)
    if not user:
        # If not found, perhaps it's an ObjectId string
        if ObjectId.is_valid(identifier):
            user = db.users.find_one({"_id": ObjectId(identifier)})
            
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": str(user["_id"]),
        "user_code": user.get("user_code", ""),
        "first_name": user.get("first_name", ""),
        "last_name": user.get("last_name", ""),
        "email": user.get("email", ""),
        "status": user.get("status", "active")
    }

# 2. Upload Report and Redirect API
@router.post("/upload-report")
async def upload_external_report(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user_identifier: str = Form(...),  # email, user_code or user_id
    asset_id: Optional[str] = Form(None) # Optional link to a specific asset
):
    """
    Allows external software to upload a report for a user.
    Returns a redirect URL to the report section.
    """
    # Find the user
    query = {"$or": [
        {"email": user_identifier.lower()},
        {"user_code": user_identifier}
    ]}
    
    user = db.users.find_one(query)
    if not user and ObjectId.is_valid(user_identifier):
        user = db.users.find_one({"_id": ObjectId(user_identifier)})
        
    if not user:
        # Intimate/Create a new user entry if they don't exist (as requested)
        # We only have email or identifier here, so we might create a minimal profile
        if "@" in user_identifier:
             new_user = {
                 "email": user_identifier.lower(),
                 "first_name": "External",
                 "last_name": "User",
                 "user_code": generate_user_code("Asset Owner"),
                 "created_at": datetime.utcnow(),
                 "status": "active",
                 "is_external": True
             }
             db.users.insert_one(new_user)
             user = new_user
        else:
            raise HTTPException(status_code=404, detail="User not found and cannot auto-create without email")

    user_id = str(user["_id"])
    user_email = user.get("email")
    user_name = f"{user.get('first_name', '')} {user.get('last_name', '')}".strip()

    # Upload to GridFS
    content = await file.read()
    file_id = fs.put(
        content,
        filename=file.filename,
        content_type=file.content_type,
        user_id=user_id,
        user_email=user_email,
        metadata={
            "original_filename": file.filename,
            "uploaded_at": datetime.utcnow().isoformat(),
            "source": "external_platform"
        }
    )

    # Insert into drive_pdfs
    pdf_document = {
        "file_id": file_id,
        "filename": file.filename,
        "link_id": asset_id or user_id, # Default to user_id if no asset
        "user_id": user_id,
        "user_email": user_email,
        "user_name": user_name,
        "file_size": len(content),
        "content_type": file.content_type,
        "uploaded_at": datetime.utcnow(),
        "status": "uploaded",
        "stored_in": "mongodb_gridfs",
        "upload_type": "external_upload"
    }
    
    result = db.drive_pdfs.insert_one(pdf_document)
    
    # Base URL for frontend (should be configurable)
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    return {
        "message": "Report uploaded successfully",
        "report_id": str(result.inserted_id),
        "user_id": user_id,
        "redirect_url": f"{frontend_url}/profile?section=reports"
    }

# 3. Share Folder Structure API
@router.get("/folders/{user_id}", response_model=List[FolderItem])
async def get_user_folders(user_id: str):
    """
    Returns the complete folder structure (Assets and their Reports) for a user.
    """
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
        
    # Get Assets (Drive Links)
    assets = list(db.drive_links.find({"user_id": user_id}))
    
    # Get all reports for this user
    reports = list(db.drive_pdfs.find({"user_id": user_id}))
    
    folder_structure = []
    
    # Group reports by link_id (asset)
    reports_by_asset = {}
    for r in reports:
        lid = str(r.get("link_id", ""))
        if lid not in reports_by_asset:
            reports_by_asset[lid] = []
        reports_by_asset[lid].append(r)
        
    # Build Assets as folders
    for asset in assets:
        asset_id = str(asset["_id"])
        item = FolderItem(
            id=asset_id,
            name=asset.get("drive_link_1", "Unnamed Asset"),
            type="asset",
            children=[]
        )
        
        # Add reports under this asset
        asset_reports = reports_by_asset.get(asset_id, [])
        for ar in asset_reports:
            item.children.append(FolderItem(
                id=str(ar["_id"]),
                name=ar.get("filename", "Unnamed Report"),
                type="report"
            ))
            
        folder_structure.append(item)
        
    # Add loose reports (not attached to an asset)
    loose_reports = reports_by_asset.get(user_id, [])
    if loose_reports:
        for lr in loose_reports:
            folder_structure.append(FolderItem(
                id=str(lr["_id"]),
                name=lr.get("filename", "Unnamed Report"),
                type="report"
            ))
            
    return folder_structure
