from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class BookingCreate(BaseModel):
    service_type: str = Field(..., description="Type of service being booked")
    date: str = Field(..., description="Date of booking (YYYY-MM-DD)")
    time: str = Field(..., description="Time of booking (HH:MM)")
    notes: Optional[str] = Field(None, description="Additional notes")
    contact_phone: str = Field(..., description="Contact phone number")
    status: str = Field("pending", description="Status of the booking")

class GuestBookingCreate(BaseModel):
    name: str = Field(..., description="Full Name")
    email: str = Field(..., description="Email Address")
    contact_phone: str = Field(..., description="Phone Number")
    location: str = Field(..., description="Site Location")
    service_type: str = Field(..., description="Type of service")
    system_size: Optional[str] = Field(None, description="System Size")
    notes: Optional[str] = Field(None, description="Message/Requirements")
    date: str = Field(..., description="Date of booking (YYYY-MM-DD)")
    time: str = Field(..., description="Time of booking (HH:MM)")
    
    # Enhanced Fields
    project_name: Optional[str] = None
    inspection_purpose: Optional[str] = None
    coordinates: Optional[dict] = None
    drone: Optional[dict] = None
    pilot: Optional[dict] = None
    flight: Optional[dict] = None
    compliance: Optional[dict] = None
    output: Optional[dict] = None

class BookingUpdate(BaseModel):
    service_type: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    notes: Optional[str] = None
    contact_phone: Optional[str] = None
    status: Optional[str] = None
    location: Optional[str] = None
    system_size: Optional[str] = None
    
    # Enhanced Fields
    project_name: Optional[str] = None
    inspection_purpose: Optional[str] = None
    coordinates: Optional[dict] = None
    drone: Optional[dict] = None
    pilot: Optional[dict] = None
    flight: Optional[dict] = None
    compliance: Optional[dict] = None
    output: Optional[dict] = None

class BookingResponse(BaseModel):
    id: str
    user_id: str
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    service_type: str
    date: str
    time: str
    notes: Optional[str]
    contact_phone: str
    status: str
    payment_status: Optional[str] = "unpaid"
    location: Optional[str] = None
    system_size: Optional[str] = None
    created_at: datetime
    
    # Enhanced Fields
    project_name: Optional[str] = None
    inspection_purpose: Optional[str] = None
    coordinates: Optional[dict] = None
    drone: Optional[dict] = None
    pilot: Optional[dict] = None
    flight: Optional[dict] = None
    compliance: Optional[dict] = None
    output: Optional[dict] = None