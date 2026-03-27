from fastapi import APIRouter, Depends, HTTPException, status
from app.db import db
from datetime import datetime
from app.routes.auth import get_current_user
from app.models.bookings import BookingCreate, BookingUpdate, BookingResponse, GuestBookingCreate
from typing import List, Optional
from bson import ObjectId

router = APIRouter(prefix="/bookings", tags=["Bookings"])
collection = db["bookings"]

@router.post("/", response_model=BookingResponse)
def create_booking(payload: BookingCreate, current_user = Depends(get_current_user)):
    print("CREATE BOOKING PAYLOAD:", payload)
    
    document = payload.dict()
    document["user_id"] = current_user["id"]
    document["user_email"] = current_user["email"]
    document["user_name"] = f"{current_user.get('first_name', '')} {current_user.get('last_name', '')}".strip()
    document["created_at"] = datetime.utcnow()
    
    result = collection.insert_one(document)
    
    return BookingResponse(
        id=str(result.inserted_id),
        **document
    )

@router.post("/guest", response_model=BookingResponse)
def create_guest_booking(payload: GuestBookingCreate):
    print("CREATE GUEST BOOKING PAYLOAD:", payload)
    
    document = payload.dict()
    # Map Guest specific fields to common schema fields if needed, 
    # but here we can just store them as is since MongoDB is flexible 
    # and we updated BookingResponse to include them.
    
    document["user_id"] = "guest"
    document["user_name"] = payload.name
    document["user_email"] = payload.email
    document["status"] = "pending"
    document["created_at"] = datetime.utcnow()
    
    # Remove name/email from document if we don't want duplicates with user_name/user_email?
    # Actually keeping them is fine or cleaning them up.
    # The payload.dict() includes name/email.
    
    result = collection.insert_one(document)
    
    return BookingResponse(
        id=str(result.inserted_id),
        **document
    )

@router.get("/", response_model=List[BookingResponse])
def get_all_bookings(current_user = Depends(get_current_user)):
    """Admin route to see all bookings"""
    data = list(collection.find().sort("created_at", -1))
    
    formatted_bookings = []
    for item in data:
        # Sanitize created_at for Pydantic (must be datetime)
        created_at = item.get("created_at")
        if not isinstance(created_at, datetime):
            if isinstance(created_at, str):
                try:
                    # Python 3.7+ standard library ISO parser
                    item["created_at"] = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
                except:
                    item["created_at"] = datetime.utcnow()
            else:
                item["created_at"] = datetime.utcnow()
        
        # Ensure date/time are strings as expected by BookingResponse
        if not isinstance(item.get("date"), str):
            item["date"] = str(item.get("date", "2024-01-01"))
        if not isinstance(item.get("time"), str):
            item["time"] = str(item.get("time", "12:00"))

        # Fetch payment status for this user
        subscription = db.subscriptions.find_one({"email": item.get("user_email")})
        payment_status = subscription.get("status", "unpaid") if subscription else "unpaid"

        # Pydantic v2 needs explicit str() for ObjectId fields
        formatted_bookings.append(BookingResponse(
            id=str(item["_id"]),
            user_id=str(item.get("user_id", "guest")),
            user_email=item.get("user_email"),
            user_name=item.get("user_name"),
            service_type=item.get("service_type", "General"),
            date=item["date"],
            time=item["time"],
            notes=item.get("notes"),
            contact_phone=item.get("contact_phone", ""),
            status=item.get("status", "pending"),
            payment_status=payment_status,
            location=item.get("location"),
            system_size=item.get("system_size"),
            created_at=item["created_at"]
        ))
    return formatted_bookings

@router.get("/my-bookings", response_model=List[BookingResponse])
async def get_my_bookings(current_user = Depends(get_current_user)):
    user_id = current_user["id"]
    user_email = current_user["email"]
    
    # Find bookings by user_id OR by email (to catch guest bookings made with same email)
    # Using regex for case-insensitive email matching
    data = list(collection.find({
        "$or": [
            {"user_id": user_id},
            {"user_email": {"$regex": f"^{user_email}$", "$options": "i"}}
        ]
    }).sort("created_at", -1))
    
    formatted_bookings = []
    
    # Pre-fetch user's subscription status once for my-bookings
    subscription = db.subscriptions.find_one({"email": user_email})
    common_payment_status = subscription.get("status", "unpaid") if subscription else "unpaid"

    for item in data:
        # ... logic ...
        formatted_bookings.append(BookingResponse(
            id=str(item["_id"]),
            user_id=str(item.get("user_id", "guest")),
            user_email=item.get("user_email"),
            user_name=item.get("user_name"),
            service_type=item.get("service_type", "General"),
            date=str(item.get("date", "2024-01-01")),
            time=str(item.get("time", "12:00")),
            notes=item.get("notes"),
            contact_phone=item.get("contact_phone", ""),
            status=item.get("status", "pending"),
            payment_status=common_payment_status,
            location=item.get("location"),
            system_size=item.get("system_size"),
            created_at=item.get("created_at", datetime.utcnow())
        ))
    return formatted_bookings

@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking(booking_id: str, current_user = Depends(get_current_user)):
    if not ObjectId.is_valid(booking_id):
        raise HTTPException(status_code=400, detail="Invalid booking ID")
        
    booking = collection.find_one({"_id": ObjectId(booking_id)})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    # Check ownership or admin status (assuming admin check later)
    # For now allow owner OR admin (if we had admin role check)
    # Also allow if it's a guest booking? But guest booking has no owner to auth against.
    # So maybe restricting guest bookings to be viewable only by Admin (get_all_bookings).
    if booking["user_id"] != current_user["id"] and booking["user_id"] != "guest":
         raise HTTPException(status_code=403, detail="Not authorized to access this booking")
         
    return BookingResponse(
        id=str(booking["_id"]),
        user_id=str(booking.get("user_id", "guest")),
        user_email=booking.get("user_email"),
        user_name=booking.get("user_name"),
        service_type=booking.get("service_type", "General"),
        date=str(booking.get("date", "2024-01-01")),
        time=str(booking.get("time", "12:00")),
        notes=booking.get("notes"),
        contact_phone=booking.get("contact_phone", ""),
        status=booking.get("status", "pending"),
        location=booking.get("location"),
        system_size=booking.get("system_size"),
        created_at=booking.get("created_at", datetime.utcnow()) if isinstance(booking.get("created_at"), datetime) else datetime.utcnow()
    )

@router.patch("/{booking_id}", response_model=BookingResponse)
def update_booking(booking_id: str, payload: BookingUpdate, current_user = Depends(get_current_user)):
    if not ObjectId.is_valid(booking_id):
        raise HTTPException(status_code=400, detail="Invalid booking ID")
        
    booking = collection.find_one({"_id": ObjectId(booking_id)})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Access control
    is_owner_by_id = booking.get("user_id") == current_user["id"]
    is_owner_by_email = booking.get("user_email", "").lower() == current_user["email"].lower()
    is_admin = current_user.get("is_admin", False)
    is_guest_booking = booking.get("user_id") == "guest"

    # Allow if owner OR if admin OR (if it's a guest booking, allow logged in users assuming they are managing it)
    if not (is_owner_by_id or is_owner_by_email or is_admin or is_guest_booking):
         raise HTTPException(status_code=403, detail="Not authorized to update this booking")

    update_data = {k: v for k, v in payload.dict().items() if v is not None}
    
    if update_data:
        collection.update_one(
            {"_id": ObjectId(booking_id)},
            {"$set": update_data}
        )
        
    updated_booking = collection.find_one({"_id": ObjectId(booking_id)})
    return BookingResponse(
        id=str(updated_booking["_id"]),
        user_id=str(updated_booking.get("user_id", "guest")),
        user_email=updated_booking.get("user_email"),
        user_name=updated_booking.get("user_name"),
        service_type=updated_booking.get("service_type", "General"),
        date=str(updated_booking.get("date", "2024-01-01")),
        time=str(updated_booking.get("time", "12:00")),
        notes=updated_booking.get("notes"),
        contact_phone=updated_booking.get("contact_phone", ""),
        status=updated_booking.get("status", "pending"),
        location=updated_booking.get("location"),
        system_size=updated_booking.get("system_size"),
        created_at=updated_booking.get("created_at", datetime.utcnow()) if isinstance(updated_booking.get("created_at"), datetime) else datetime.utcnow()
    )

@router.delete("/{booking_id}")
def delete_booking(booking_id: str, current_user = Depends(get_current_user)):
    if not ObjectId.is_valid(booking_id):
        raise HTTPException(status_code=400, detail="Invalid booking ID")
        
    booking = collection.find_one({"_id": ObjectId(booking_id)})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    # Access control
    is_owner_by_id = booking.get("user_id") == current_user["id"]
    is_owner_by_email = booking.get("user_email", "").lower() == current_user["email"].lower()
    is_admin = current_user.get("is_admin", False)
    
    if not (is_owner_by_id or is_owner_by_email or is_admin):
         raise HTTPException(status_code=403, detail="Not authorized to delete this booking")
         
    collection.delete_one({"_id": ObjectId(booking_id)})
    return {"message": "Booking deleted successfully"}