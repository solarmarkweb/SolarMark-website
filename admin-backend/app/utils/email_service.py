import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging
from datetime import datetime
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.email_user = os.getenv("EMAIL_USER")
        self.email_password = os.getenv("EMAIL_PASSWORD")
        self.email_host = os.getenv("EMAIL_HOST", "smtp.gmail.com")
        self.email_port = int(os.getenv("EMAIL_PORT", 587))
        self.admin_email = os.getenv("ADMIN_EMAIL", self.email_user)

    def send_notification(self, subject: str, body: str, recipient: str = None, title: str = "New Notification"):
        """Send a notification email to the admin or a specific recipient"""
        if os.path.exists(".env"):
            load_dotenv(override=True)
            
        self.email_user = os.getenv("EMAIL_USER")
        self.email_password = os.getenv("EMAIL_PASSWORD")
        self.admin_email = os.getenv("ADMIN_EMAIL", self.email_user)
        
        target_email = recipient if recipient else self.admin_email

        print(f"EMAIL_DEBUG: Sending notification to {target_email}")
        print(f"EMAIL_DEBUG: Using sender {self.email_user}")

        if not self.email_user or not self.email_password:
            logger.error("Email credentials missing")
            return False

        msg = MIMEMultipart()
        msg['From'] = f"SolarMark System <{self.email_user}>"
        msg['To'] = target_email
        msg['Subject'] = subject

        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #ea580c; margin: 0;">SolarMark</h1>
                        <p style="color: #666; font-size: 14px; margin: 5px 0;">{title}</p>
                    </div>
                    <div style="background-color: #f9fafb; padding: 30px; border-radius: 8px;">
                        <h3 style="margin-top: 0; color: #111827;">{subject}</h3>
                        <div style="font-size: 14px; color: #4b5563; white-space: pre-wrap;">
                            {body}
                        </div>
                    </div>
                    <footer style="margin-top: 20px; text-align: center; color: #999; font-size: 12px;">
                        This is an automated message from the SolarMark Administrative System.
                    </footer>
                </div>
            </body>
        </html>
        """
        msg.attach(MIMEText(html_body, 'html'))

        try:
            server = smtplib.SMTP(self.email_host, self.email_port, timeout=10)
            server.starttls()
            server.login(str(self.email_user), str(self.email_password))
            server.send_message(msg)
            server.quit()
            logger.info(f"Notification email sent to {target_email}")
            print(f"EMAIL_DEBUG: Email successfully sent to {target_email}")
            return True
        except Exception as e:
            logger.error(f"Error sending notification email: {str(e)}")
            print(f"EMAIL_DEBUG: CRITICAL ERROR SENDING EMAIL: {str(e)}")
            return False

    def send_review_update_notification(self, recipient_email, user_name, filename, status, admin_remarks=""):
        """Send notification when a report review is updated by admin"""
        subject = f"Update on your Report Review: {filename}"
        
        status_text = status.upper()
        
        body = f"""
        Hello {user_name},

        Your report review for "{filename}" has been updated by our admin team.

        New Status: {status_text}
        Admin Remarks: {admin_remarks if admin_remarks else 'No specific remarks.'}

        You can check the full details in your profile dashboard.
        """
        
        return self.send_notification(
            subject=subject,
            body=body,
            recipient=recipient_email,
            title="Review Status Update"
        )

email_service = EmailService()

def send_file_upload_notification(recipient_email, user_name, filename, file_size, sender_name="SolarMark"):
    """Standalone helper function to send file upload notifications"""
    subject = f"New Document Available: {filename}"
    
    # Format file size
    if file_size > 1024 * 1024:
        size_str = f"{file_size / (1024 * 1024):.2f} MB"
    else:
        size_str = f"{file_size / 1024:.2f} KB"
        
    body = f"""
    Hello {user_name},

    A new document has been uploaded for you by {sender_name}.

    Document Name: {filename}
    File Size: {size_str}
    Date: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC

    You can view and download this document from your profile dashboard under the "Reports" section.
    """
    
    return email_service.send_notification(
        subject=subject,
        body=body,
        recipient=recipient_email,
        title="New Document Notification"
    )

