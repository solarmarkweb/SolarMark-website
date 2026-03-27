from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from app.utils.otp_service import otp_service, logger
from app.db import db

router = APIRouter(prefix="/api/otp", tags=["OTP Verification"])

class OTPRequest(BaseModel):
    email: EmailStr

class OTPVerify(BaseModel):
    email: EmailStr
    otp: str

@router.post("/request")
async def request_otp(data: OTPRequest):
    logger.info(f"DEBUG: Received OTP request for {data.email}")
    email = data.email
    otp = otp_service.generate_otp()
    await otp_service.save_otp(email, otp)
    sent, error_msg = await otp_service.send_otp_email(email, otp)
    
    if not sent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Verification email failed: {error_msg}"
        )
        
    return {"message": "Verification code sent to your email"}

@router.post("/verify")
async def verify_otp(data: OTPVerify):
    is_valid, msg = await otp_service.verify_otp(data.email, data.otp)
    if not is_valid:
        raise HTTPException(status_code=400, detail=msg)
    
    return {"message": "Email verified successfully"}
