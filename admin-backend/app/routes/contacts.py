from fastapi import APIRouter, Depends, HTTPException, status
from app.db import db
from datetime import datetime
from app.models.contact import ContactCreate, ContactUpdate, ContactResponse
from app.routes.auth import get_current_user
from typing import List
from bson import ObjectId

router = APIRouter(prefix="/contacts", tags=["Contacts"])
collection = db["contacts"]

@router.post("/", response_model=ContactResponse)
def create_contact(payload: ContactCreate):
    """Public endpoint to submit contact form"""
    document = payload.dict()
    document["status"] = "new"  # Default status
    document["created_at"] = datetime.utcnow()
    
    result = collection.insert_one(document)
    
    return ContactResponse(
        id=str(result.inserted_id),
        **document
    )

@router.get("/", response_model=List[ContactResponse])
def get_all_contacts(current_user = Depends(get_current_user)):
    """Admin endpoint to see all contact requests"""
    data = list(collection.find().sort("created_at", -1))
    
    formatted_contacts = []
    for item in data:
        # Pydantic ContactResponse expects a datetime
        created_at = item.get("created_at")
        if not isinstance(created_at, datetime):
            if isinstance(created_at, str):
                try:
                    # Attempt simple ISO parsing or fallback
                    item["created_at"] = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
                except:
                    item["created_at"] = datetime.utcnow()
            else:
                item["created_at"] = datetime.utcnow()
        
        formatted_contacts.append(ContactResponse(
            id=str(item["_id"]),
            first_name=item.get("first_name", "Anonymous"),
            last_name=item.get("last_name", ""),
            email=item.get("email", ""),
            message=item.get("message", ""),
            status=item.get("status", "new"),
            created_at=item["created_at"]
        ))
    return formatted_contacts

@router.patch("/{contact_id}", response_model=ContactResponse)
def update_contact_status(contact_id: str, payload: ContactUpdate, current_user = Depends(get_current_user)):
    """Admin endpoint to update contact status"""
    if not ObjectId.is_valid(contact_id):
        raise HTTPException(status_code=400, detail="Invalid contact ID")
        
    result = collection.update_one(
        {"_id": ObjectId(contact_id)},
        {"$set": {"status": payload.status}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contact request not found")
        
    updated_contact = collection.find_one({"_id": ObjectId(contact_id)})
    return ContactResponse(id=str(updated_contact["_id"]), **updated_contact)

@router.delete("/{contact_id}")
def delete_contact(contact_id: str, current_user = Depends(get_current_user)):
    """Admin endpoint to delete contact request"""
    if not ObjectId.is_valid(contact_id):
        raise HTTPException(status_code=400, detail="Invalid contact ID")
        
    result = collection.delete_one({"_id": ObjectId(contact_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Contact request not found")
        
    return {"message": "Contact request deleted successfully"}