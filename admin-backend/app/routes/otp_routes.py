from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from app.utils.otp_service import otp_service

router = APIRouter()


class OTPRequest(BaseModel):
    email: str

class OTPVerify(BaseModel):
    email: str
    otp: str

@router.post("/send")
async def send_otp(payload: OTPRequest):
    """Generate and send an OTP to the user's email."""
    otp = otp_service.generate_otp()
    success, message = await otp_service.send_otp_email(payload.email, otp)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=message
        )
    
    await otp_service.save_otp(payload.email, otp)
    return {"message": "Verification code sent to your email."}

@router.post("/verify")
async def verify_otp(payload: OTPVerify):
    """Verify the OTP provided by the user."""
    success, message = await otp_service.verify_otp(payload.email, payload.otp)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )
    
    return {"message": "Email verified successfully."}