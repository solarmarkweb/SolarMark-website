from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from typing import List
import uuid
from datetime import datetime
import logging
from pymongo import MongoClient
from bson import ObjectId
import os

# Import your existing auth dependency
from app.routes.auth import get_current_user
from services.google_drive_service import GoogleDriveService

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize Google Drive service lazily
_drive_service = None

def get_drive_service():
    global _drive_service
    if _drive_service is None:
        _drive_service = GoogleDriveService()
    return _drive_service


# MongoDB connection
from app.db import db

@router.get("/user-images")
async def get_user_images(current_user: dict = Depends(get_current_user)):
    """Get all images uploaded by the current user"""
    try:
        # Query images from MongoDB
        images = list(db.images.find({
            "user_id": current_user["id"],
            "status": "active"
        }).sort("uploaded_at", -1))
        
        # Convert ObjectId to string
        result = []
        for img in images:
            img_dict = {
                "id": str(img["_id"]),
                "filename": img.get("filename"),
                "original_filename": img.get("original_filename"),
                "image_type": img.get("image_type"),
                "user_id": img.get("user_id"),
                "user_name": img.get("user_name"),
                "drive_file_id": img.get("drive_file_id"),
                "drive_file_url": img.get("drive_file_url"),
                "file_size": img.get("file_size"),
                "uploaded_at": img["uploaded_at"].isoformat() if img.get("uploaded_at") else None,
                "status": img.get("status")
            }
            result.append(img_dict)
        
        return result
    except Exception as e:
        logger.error(f"Error fetching user images: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/all-user-images")
async def get_all_active_images():
    """Get all active images for all users (Admin)"""
    try:
        images = list(db.images.find({"status": "active"}).sort("uploaded_at", -1))
        result = []
        for img in images:
            img_dict = {
                "id": str(img["_id"]),
                "filename": img.get("filename"),
                "original_filename": img.get("original_filename"),
                "image_type": img.get("image_type"),
                "user_id": img.get("user_id"),
                "user_name": img.get("user_name"),
                "drive_file_id": img.get("drive_file_id"),
                "drive_file_url": img.get("drive_file_url"),
                "file_size": img.get("file_size"),
                "uploaded_at": img["uploaded_at"].isoformat() if img.get("uploaded_at") else None,
                "status": img.get("status")
            }
            result.append(img_dict)
        return result
    except Exception as e:
        logger.error(f"Error fetching all images: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload-rgb-images")
async def upload_rgb_images(
    rgb_images: List[UploadFile] = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload RGB images to admin's Google Drive"""
    return await upload_images(rgb_images, "rgb", current_user)

@router.post("/upload-thermal-images")
async def upload_thermal_images(
    thermal_images: List[UploadFile] = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload Thermal images to admin's Google Drive"""
    return await upload_images(thermal_images, "thermal", current_user)

async def upload_images(files: List[UploadFile], image_type: str, current_user: dict):
    """Helper function to upload images"""
    
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")
    
    uploaded_images = []
    total_uploaded = 0
    
    try:
        # Check Google Drive is configured before doing anything
        try:
            drive_service = get_drive_service()
        except FileNotFoundError as e:
            raise HTTPException(status_code=503, detail=str(e))

        # Get or create user's main folder in admin's Drive
        user_folder = await get_or_create_user_folder(current_user)
        
        # Determine the subfolder based on image type
        if image_type.lower() == "rgb":
            subfolder_name = "drone image"
        else:
            subfolder_name = "site plan"

        subfolder_id = drive_service.get_or_create_subfolder(
            parent_folder_id=user_folder['folder_id'],
            subfolder_name=subfolder_name
        )
        
        for file in files:
            # Determine if this file is valid for the chosen category - Both RGB and Thermal are images
            file_ext = file.filename.split('.')[-1].lower() if '.' in file.filename else ''
            is_valid = file.content_type and file.content_type.startswith('image/')
            
            if not is_valid:
                logger.warning(f"Skipping unsupported or mismatched file for {image_type}: {file.filename}")
                continue
            
            # Use only the user name for the filename as requested
            new_filename = f"{current_user['name']}.{file_ext}"
            
            # Read file data
            file_data = await file.read()
            file_size = len(file_data)
            
            # Upload to Google Drive inside the specific subfolder
            drive_file_id, drive_file_url, drive_file_size = drive_service.upload_image_to_drive(
                file_data=file_data,
                filename=new_filename,
                mime_type=file.content_type,
                user_folder_id=subfolder_id
            )
            
            # Save file info to MongoDB
            image_doc = {
                "filename": new_filename,
                "original_filename": file.filename,
                "image_type": image_type,
                "user_id": current_user["id"],
                "user_name": current_user["name"],
                "user_email": current_user.get("email"),
                "drive_file_id": drive_file_id,
                "drive_file_url": drive_file_url,
                "file_size": drive_file_size,
                "uploaded_at": datetime.utcnow(),
                "status": "active"
            }
            
            result = db.images.insert_one(image_doc)
            
            # Create response object without _id field
            response_doc = {
                "id": str(result.inserted_id),
                "filename": new_filename,
                "original_filename": file.filename,
                "image_type": image_type,
                "user_id": current_user["id"],
                "user_name": current_user["name"],
                "drive_file_id": drive_file_id,
                "drive_file_url": drive_file_url,
                "file_size": drive_file_size,
                "uploaded_at": image_doc["uploaded_at"].isoformat() if hasattr(image_doc.get("uploaded_at"), "isoformat") else datetime.utcnow().isoformat(),
                "status": "active"
            }
            
            uploaded_images.append(response_doc)
            total_uploaded += 1
            logger.info(f"Uploaded {image_type} image for user {current_user['name']}: {new_filename}")
        
        return {
            "uploaded_count": total_uploaded,
            "images": uploaded_images,
            "drive_folder_id": user_folder['folder_id'],
            "drive_folder_url": user_folder['folder_url']
        }
        
    except Exception as e:
        logger.error(f"Error uploading images: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to upload images: {str(e)}")

async def get_or_create_user_folder(current_user: dict):
    """Get or create user's folder in admin's Google Drive"""
    
    # Always check with Google Drive directly, because the admin might have 
    # changed their target folder ID in .env. Our `create_user_folder` 
    # now intelligently searches for an existing folder first.
    drive_service = get_drive_service()
    
    logger.info(f"Ensuring folder exists for user {current_user['name']}")
    folder_id, folder_url = drive_service.create_user_folder(
        user_name=current_user["name"],
        user_email=current_user["email"]
    )
    
    # Check if user already has a folder in database
    user_folder = db.user_folders.find_one({"user_id": current_user["id"]})
    
    if user_folder:
        # If folder ID changed (e.g. admin changed drive parent), update DB
        if user_folder['folder_id'] != folder_id:
            logger.info(f"Updating folder ID for user {current_user['name']} in DB")
            db.user_folders.update_one(
                {"user_id": current_user["id"]},
                {"$set": {
                    "folder_id": folder_id,
                    "folder_url": folder_url,
                    "updated_at": datetime.utcnow()
                }}
            )
    else:
        # Save to database
        logger.info(f"Saving new folder for user {current_user['name']} to DB")
        folder_doc = {
            "user_id": current_user["id"],
            "user_name": current_user["name"],
            "user_email": current_user["email"],
            "folder_id": folder_id,
            "folder_url": folder_url,
            "created_at": datetime.utcnow()
        }
        db.user_folders.insert_one(folder_doc)
    
    return {
        'folder_id': folder_id,
        'folder_url': folder_url
    }

@router.delete("/images/{image_id}")
async def delete_image(
    image_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete an image from Google Drive and database"""
    try:
        from bson import ObjectId
        # If user is admin, they can delete any image.
        # Otherwise, only the owner can delete.
        query = {"_id": ObjectId(image_id)}
        if not current_user.get("is_admin", False):
            query["user_id"] = current_user["id"]
            
        image = db.images.find_one(query)
        if not image:
            raise HTTPException(status_code=404, detail="Image not found")

        try:
            drive_service = get_drive_service()
            drive_service.delete_file_from_drive(image["drive_file_id"])
        except FileNotFoundError:
            pass  # Drive not configured, just remove from DB

        db.images.update_one(
            {"_id": ObjectId(image_id)},
            {"$set": {"status": "deleted"}}
        )
        logger.info(f"Deleted image {image_id} for user {current_user['name']}")
        return {"message": "Image deleted successfully", "deleted": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete image: {str(e)}")

@router.get("/user-drive-folder")
async def get_user_drive_folder(current_user: dict = Depends(get_current_user)):
    """Get user's Google Drive folder URL"""
    try:
        # Utilize the robust get_or_create_user_folder which verifies Google Drive directly
        folder_info = await get_or_create_user_folder(current_user)
        
        try:
            admin_drive_url = get_drive_service().ADMIN_DRIVE_URL
        except FileNotFoundError:
            admin_drive_url = None
            
        return {
            "folder_id": folder_info["folder_id"],
            "folder_url": folder_info["folder_url"],
            "admin_drive_url": admin_drive_url
        }
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting user drive folder: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user-submission-stats")
async def get_user_submission_stats():
    """Get summarized upload stats (images & PDFs) for all users"""
    try:
        # Aggregation for Images
        img_pipeline = [
            {"$match": {"status": "active"}},
            {"$group": {
                "_id": "$user_id",
                "has_rgb": {"$max": {"$cond": [{"$eq": ["$image_type", "rgb"]}, True, False]}},
                "has_thermal": {"$max": {"$cond": [{"$eq": ["$image_type", "thermal"]}, True, False]}},
                "image_count": {"$sum": 1}
            }}
        ]
        img_stats_list = list(db.images.aggregate(img_pipeline))
        
        # Aggregation for PDFs
        pdf_pipeline = [
            {"$group": {
                "_id": "$user_id",
                "pdf_count": {"$sum": 1}
            }}
        ]
        pdf_stats_list = list(db["drive_pdfs"].aggregate(pdf_pipeline))
        
        # Combine maps
        result = {}
        for s in img_stats_list:
            uid = str(s["_id"])
            result[uid] = {
                "has_rgb": s.get("has_rgb", False),
                "has_thermal": s.get("has_thermal", False),
                "image_count": s.get("image_count", 0),
                "pdf_count": 0
            }
            
        for s in pdf_stats_list:
            uid = str(s["_id"])
            if uid not in result:
                result[uid] = {
                    "has_rgb": False,
                    "has_thermal": False,
                    "image_count": 0,
                    "pdf_count": s.get("pdf_count", 0)
                }
            else:
                result[uid]["pdf_count"] = s.get("pdf_count", 0)
                
        return result
    except Exception as e:
        logger.error(f"Error fetching submission stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
