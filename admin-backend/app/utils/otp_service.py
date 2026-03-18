import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import random
import logging
from datetime import datetime, timedelta
from app.db import db

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OTPService:
    def __init__(self):
        self.email_user = os.getenv("EMAIL_USER")
        self.email_password = os.getenv("EMAIL_PASSWORD")
        self.email_host = os.getenv("EMAIL_HOST", "smtp.gmail.com")
        self.email_port = int(os.getenv("EMAIL_PORT", 587))

    def generate_otp(self):
        return str(random.randint(100000, 999999))

    async def send_otp_email(self, recipient_email: str, otp: str):
        # Load credentials from environment in case they've changed
        from dotenv import load_dotenv
        load_dotenv(override=True)
        self.email_user = os.getenv("EMAIL_USER")
        self.email_password = os.getenv("EMAIL_PASSWORD")
        
        logger.info(f"DEBUG: Attempting to send OTP via {self.email_user}")

        if not self.email_user or not self.email_password:
            logger.error("Email credentials not configured in .env")
            return False

        msg = MIMEMultipart()
        msg['From'] = f"SolarMark <{self.email_user}>"
        msg['To'] = recipient_email
        msg['Subject'] = f"{otp} is your SolarMark Verification Code"

        body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #ea580c; margin: 0;">SolarMark</h1>
                        <p style="color: #666; font-size: 14px; margin: 5px 0;">Professional Solar Solutions</p>
                    </div>
                    <div style="background-color: #f9fafb; padding: 30px; border-radius: 8px; text-align: center;">
                        <h2 style="margin-top: 0; color: #111827;">Verification Code</h2>
                        <p style="font-size: 16px; color: #4b5563;">Please use the following code to verify your account:</p>
                        <div style="font-size: 42px; font-weight: bold; letter-spacing: 8px; color: #ea580c; margin: 20px 0; padding: 10px; border: 2px dashed #ea580c; display: inline-block;">
                            {otp}
                        </div>
                        <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
                            This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
                        </p>
                    </div>
                </div>
            </body>
        </html>
        """
        msg.attach(MIMEText(body, 'html'))

        try:
            server = smtplib.SMTP(self.email_host, self.email_port)
            server.starttls()
            if self.email_user and self.email_password:
                server.login(self.email_user, self.email_password)
            else:
                logger.error("Email credentials missing during login attempt")
                return False
            server.send_message(msg)
            server.quit()
            logger.info(f"OTP email sent successfully to {recipient_email}")
            return True
        except smtplib.SMTPAuthenticationError:
            logger.error("SMTP Authentication failed. Please check your EMAIL_USER and EMAIL_PASSWORD (use an App Password for Gmail).")
            return False
        except smtplib.SMTPConnectError:
            logger.error(f"Failed to connect to SMTP server at {self.email_host}:{self.email_port}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error sending email: {str(e)}")
            return False

    async def save_otp(self, email: str, otp: str):
        expiry = datetime.utcnow() + timedelta(minutes=10)
        db.otps.update_one(
            {"email": email},
            {"$set": {"otp": otp, "expires_at": expiry, "verified": False}},
            upsert=True
        )

    async def verify_otp(self, email: str, otp: str):
        record = db.otps.find_one({"email": email})
        if not record:
            return False, "No code found for this email"
        
        if record["otp"] != otp:
            return False, "Invalid verification code"
        
        if datetime.utcnow() > record["expires_at"]:
            return False, "Verification code has expired"
        
        # Mark as verified instead of deleting immediately if needed for registration check
        db.otps.update_one({"email": email}, {"$set": {"verified": True}})
        return True, "Success"

    async def is_verified(self, email: str):
        record = db.otps.find_one({"email": email, "verified": True})
        if record:
            # Delete after checking to ensure it's only used once
            db.otps.delete_one({"email": email})
            return True
        return False

otp_service = OTPService()
