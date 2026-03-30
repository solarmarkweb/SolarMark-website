import os
import sys

# Add parent directory to sys.path to import app
sys.path.append(os.getcwd())

from app.utils.email_service import email_service
from dotenv import load_dotenv

load_dotenv()

def test_email():
    print("--- Testing Email Service ---")
    email = os.getenv("EMAIL_USER")
    print(f"EMAIL_USER: {email}")
    
    if not email:
        print("Error: EMAIL_USER not found in .env")
        return

    subject = "SolarMark Test Email"
    body = "This is a test notification from the SolarMark system to verify email delivery."
    
    print(f"Attempting to send email to {email}...")
    success = email_service.send_notification(subject, body, email)
    
    if success:
        print("Success: Email sent successfully!")
    else:
        print("Error: Failed to send email. Check technical logs above.")

if __name__ == "__main__":
    test_email()
