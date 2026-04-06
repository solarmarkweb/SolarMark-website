from fastapi import APIRouter, Depends, HTTPException, status
from app.db import db
from datetime import datetime
from app.routes.auth import get_current_user
from app.models.bookings import BookingCreate, BookingUpdate, BookingResponse, GuestBookingCreate, stringify_objectids
from app.utils.email_service import email_service
from typing import List, Optional
from bson import ObjectId

router = APIRouter(prefix="/bookings", tags=["Bookings"])
collection = db["bookings"]



def make_booking_response(item: dict, payment_status: str = "unpaid") -> BookingResponse:
    """Convert a raw MongoDB document into a BookingResponse, safely handling all types."""
    # Stringify all ObjectIds recursively first
    clean = stringify_objectids(dict(item))

    # Ensure _id removed and id set as string
    clean["id"] = clean.pop("_id", clean.get("id", ""))

    # Ensure created_at is a proper datetime
    created_at = clean.get("created_at")
    if not isinstance(created_at, datetime):
        if isinstance(created_at, str):
            try:
                created_at = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
            except Exception:
                created_at = datetime.utcnow()
        else:
            created_at = datetime.utcnow()
    clean["created_at"] = created_at

    # Ensure date/time are strings
    if not isinstance(clean.get("date"), str):
        clean["date"] = str(clean.get("date", "2024-01-01"))
    if not isinstance(clean.get("time"), str):
        clean["time"] = str(clean.get("time", "00:00"))

    clean["payment_status"] = payment_status

    return BookingResponse(**clean)


@router.post("/", response_model=BookingResponse)
def create_booking(payload: BookingCreate, current_user=Depends(get_current_user)):
    document = payload.dict()
    document["user_id"] = current_user["id"]
    document["user_email"] = current_user["email"]
    document["user_name"] = f"{current_user.get('first_name', '')} {current_user.get('last_name', '')}".strip()
    document["created_at"] = datetime.utcnow()
    document["status"] = "pending"

    result = collection.insert_one(document)
    document["_id"] = result.inserted_id

    subscription = db.subscriptions.find_one({"email": document["user_email"]})
    payment_status = subscription.get("status", "unpaid") if subscription else "unpaid"

    # Notify Admin via Email
    try:
        booking_details = (
            f"A new booking has been received from a registered user.\n\n"
            f"Customer Name: {document.get('user_name')}\n"
            f"Customer Email: {document.get('user_email')}\n"
            f"Service: {document.get('service_type')}\n"
            f"Date: {document.get('date')}\n"
            f"Time: {document.get('time')}\n"
            f"Phone: {document.get('contact_phone')}\n"
            f"Location: {document.get('location', 'N/A')}\n"
            f"Notes: {document.get('notes', 'No notes provided.')}"
        )
        email_service.send_notification(
            subject=f"New Booking: {document.get('service_type')} - {document.get('user_name')}",
            body=booking_details
        )
    except Exception as e:
        print(f"Failed to send admin notification: {e}")

    return make_booking_response(document, payment_status)


@router.post("/guest", response_model=BookingResponse)
def create_guest_booking(payload: GuestBookingCreate):
    document = payload.model_dump()

    document["user_id"] = "guest"
    document["user_name"] = payload.name
    document["user_email"] = payload.email
    document["status"] = "pending"
    document["created_at"] = datetime.utcnow()

    result = collection.insert_one(document)
    document["_id"] = result.inserted_id

    # Notify Admin via Email
    try:
        booking_details = (
            f"A new guest booking has been received.\n\n"
            f"Customer Name: {document.get('user_name')}\n"
            f"Customer Email: {document.get('user_email')}\n"
            f"Service: {document.get('service_type')}\n"
            f"Date: {document.get('date')}\n"
            f"Time: {document.get('time')}\n"
            f"Phone: {document.get('contact_phone')}\n"
            f"Location: {document.get('location', 'N/A')}\n"
            f"Notes: {document.get('notes', 'No notes provided.')}"
        )
        email_service.send_notification(
            subject=f"New Guest Booking: {document.get('service_type')} - {document.get('user_name')}",
            body=booking_details
        )
    except Exception as e:
        print(f"Failed to send admin notification: {e}")

    return make_booking_response(document, "unpaid")


@router.get("/", response_model=List[BookingResponse])
def get_all_bookings(current_user=Depends(get_current_user)):
    """Admin route to see all bookings"""
    data = list(collection.find().sort("created_at", -1))

    formatted_bookings = []
    for item in data:
        subscription = db.subscriptions.find_one({"email": item.get("user_email")})
        payment_status = subscription.get("status", "unpaid") if subscription else "unpaid"
        try:
            formatted_bookings.append(make_booking_response(item, payment_status))
        except Exception as e:
            print(f"Skipping booking {item.get('_id')} due to error: {e}")

    return formatted_bookings


@router.get("/my-bookings", response_model=List[BookingResponse])
async def get_my_bookings(current_user=Depends(get_current_user)):
    user_id = current_user["id"]
    user_email = current_user["email"]

    data = list(collection.find({
        "$or": [
            {"user_id": user_id},
            {"user_email": {"$regex": f"^{user_email}$", "$options": "i"}}
        ]
    }).sort("created_at", -1))

    subscription = db.subscriptions.find_one({"email": user_email})
    common_payment_status = subscription.get("status", "unpaid") if subscription else "unpaid"

    formatted_bookings = []
    for item in data:
        try:
            formatted_bookings.append(make_booking_response(item, common_payment_status))
        except Exception as e:
            print(f"Skipping booking {item.get('_id')} due to error: {e}")

    return formatted_bookings


@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking(booking_id: str, current_user=Depends(get_current_user)):
    if not ObjectId.is_valid(booking_id):
        raise HTTPException(status_code=400, detail="Invalid booking ID")

    booking = collection.find_one({"_id": ObjectId(booking_id)})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking["user_id"] != current_user["id"] and booking["user_id"] != "guest":
        raise HTTPException(status_code=403, detail="Not authorized to access this booking")

    subscription = db.subscriptions.find_one({"email": booking.get("user_email")})
    payment_status = subscription.get("status", "unpaid") if subscription else "unpaid"

    return make_booking_response(booking, payment_status)


@router.patch("/{booking_id}", response_model=BookingResponse)
def update_booking(booking_id: str, payload: BookingUpdate, current_user=Depends(get_current_user)):
    if not ObjectId.is_valid(booking_id):
        raise HTTPException(status_code=400, detail="Invalid booking ID")

    booking = collection.find_one({"_id": ObjectId(booking_id)})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    is_owner_by_id = booking.get("user_id") == current_user["id"]
    is_owner_by_email = booking.get("user_email", "").lower() == current_user["email"].lower()
    is_admin = current_user.get("is_admin", False)
    is_guest_booking = booking.get("user_id") == "guest"

    if not (is_owner_by_id or is_owner_by_email or is_admin or is_guest_booking):
        raise HTTPException(status_code=403, detail="Not authorized to update this booking")

    update_data = {k: v for k, v in payload.dict().items() if v is not None}

    if update_data:
        collection.update_one({"_id": ObjectId(booking_id)}, {"$set": update_data})

    updated = collection.find_one({"_id": ObjectId(booking_id)})
    subscription = db.subscriptions.find_one({"email": updated.get("user_email")})
    payment_status = subscription.get("status", "unpaid") if subscription else "unpaid"

    return make_booking_response(updated, payment_status)


@router.delete("/{booking_id}")
def delete_booking(booking_id: str, current_user=Depends(get_current_user)):
    if not ObjectId.is_valid(booking_id):
        raise HTTPException(status_code=400, detail="Invalid booking ID")

    booking = collection.find_one({"_id": ObjectId(booking_id)})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    is_owner_by_id = booking.get("user_id") == current_user["id"]
    is_owner_by_email = booking.get("user_email", "").lower() == current_user["email"].lower()
    is_admin = current_user.get("is_admin", False)

    if not (is_owner_by_id or is_owner_by_email or is_admin):
        raise HTTPException(status_code=403, detail="Not authorized to delete this booking")

    collection.delete_one({"_id": ObjectId(booking_id)})
    return {"message": "Booking deleted successfully"}