import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging
from dotenv import load_dotenv

# Load .env at module import time so credentials are available immediately
load_dotenv(override=True)

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
        # App Passwords might have spaces (Gmail UI shows them that way)
        # We ensure they are stripped just in case
        password = str(self.email_password).replace(" ", "").strip()
        
        target_email = recipient if recipient else self.admin_email

        print(f"EMAIL_DEBUG: Sending notification to {target_email}")
        print(f"EMAIL_DEBUG: Using sender {self.email_user}")

        if not self.email_user or not password:
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
            server.login(str(self.email_user), password)
            server.send_message(msg)
            server.quit()
            logger.info(f"Notification email sent to {target_email}")
            print(f"EMAIL_DEBUG: Email successfully sent to {target_email}")
            return True
        except Exception as e:
            logger.error(f"Error sending notification email: {str(e)}")
            print(f"EMAIL_DEBUG: CRITICAL ERROR SENDING EMAIL: {str(e)}")
            return False

email_service = EmailService()

def _send_email(to_email: str, subject: str, html_body: str) -> tuple[bool, str]:
    """
    Low-level helper to send an HTML email via SMTP.
    Returns (success: bool, message: str).
    """
    email_user = os.getenv("EMAIL_USER", "").strip()
    email_password = os.getenv("EMAIL_PASSWORD", "").replace(" ", "").strip()
    email_host = os.getenv("EMAIL_HOST", "smtp.gmail.com")
    email_port = int(os.getenv("EMAIL_PORT", 587))

    if not email_user or not email_password:
        logger.error("Email credentials not configured.")
        return False, "Email credentials not configured."

    msg = MIMEMultipart("alternative")
    msg["From"] = f"SolarMark <{email_user}>"
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(html_body, "html"))

    try:
        server = smtplib.SMTP(email_host, email_port, timeout=10)
        server.starttls()
        server.login(str(email_user), email_password)
        server.send_message(msg)
        server.quit()
        logger.info(f"Email sent successfully to {to_email} — Subject: {subject}")
        return True, "Success"
    except Exception as e:
        msg_err = f"Unexpected error sending email: {str(e)}"
        logger.error(msg_err)
        return False, msg_err

def send_file_upload_notification(
    user_email: str,
    user_name: str,
    filename: str,
    file_size_bytes: int,
    uploaded_by_admin: str = "SolarMark Admin",
) -> tuple[bool, str]:
    """
    Send a notification email to a user when an admin uploads a file to their profile.
    """
    if file_size_bytes >= 1024 * 1024:
        size_str = f"{file_size_bytes / (1024 * 1024):.2f} MB"
    elif file_size_bytes >= 1024:
        size_str = f"{file_size_bytes / 1024:.1f} KB"
    else:
        size_str = f"{file_size_bytes} B"

    subject = "📄 New File Available on Your SolarMark Profile"

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
                        <tr>
                            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 40px 32px; text-align: center;">
                                <h1 style="margin: 0; font-size: 28px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">
                                    Solar<span style="color: #f97316;">Mark</span>
                                </h1>
                                <p style="margin: 6px 0 0; font-size: 12px; color: #94a3b8; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">
                                    Professional Solar Solutions
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td style="background: linear-gradient(90deg, #f97316, #ea580c); height: 4px; padding: 0;"></td>
                        </tr>
                        <tr>
                            <td style="padding: 48px 40px 32px;">
                                <div style="text-align: center; margin-bottom: 32px;">
                                    <div style="display: inline-block; width: 72px; height: 72px; background-color: #fff7ed; border-radius: 20px; line-height: 72px; font-size: 36px; margin-bottom: 20px;">
                                        📄
                                    </div>
                                    <h2 style="margin: 0; font-size: 22px; font-weight: 800; color: #0f172a;">
                                        New File Added to Your Profile
                                    </h2>
                                    <p style="margin: 8px 0 0; font-size: 15px; color: #64748b;">
                                        Hello <strong style="color: #0f172a;">{user_name}</strong>, a new document is now available for you.
                                    </p>
                                </div>
                                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; overflow: hidden; margin-bottom: 32px;">
                                    <tr>
                                        <td style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0;">
                                            <p style="margin: 0; font-size: 10px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #94a3b8;">Document Name</p>
                                            <p style="margin: 6px 0 0; font-size: 15px; font-weight: 700; color: #0f172a;">{filename}</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 0;">
                                            <table width="100%" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td style="padding: 18px 24px; width: 50%;">
                                                        <p style="margin: 0; font-size: 10px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #94a3b8;">File Size</p>
                                                        <p style="margin: 6px 0 0; font-size: 14px; font-weight: 600; color: #475569;">{size_str}</p>
                                                    </td>
                                                    <td style="padding: 18px 24px; width: 50%; border-left: 1px solid #e2e8f0;">
                                                        <p style="margin: 0; font-size: 10px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #94a3b8;">Uploaded By</p>
                                                        <p style="margin: 6px 0 0; font-size: 14px; font-weight: 600; color: #475569;">{uploaded_by_admin}</p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                                <div style="text-align: center; margin-bottom: 32px;">
                                    <p style="margin: 0 0 20px; font-size: 14px; color: #64748b; line-height: 1.6;">
                                        You can view and download this document directly from your profile dashboard.
                                    </p>
                                    <a href="https://solarmark.in/profile" 
                                       style="display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #f97316, #ea580c); color: #ffffff; font-size: 14px; font-weight: 800; letter-spacing: 0.5px; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 14px rgba(249, 115, 22, 0.4);">
                                        View My Profile →
                                    </a>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 28px 40px; text-align: center;">
                                <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.6;">
                                    © 2026 SolarMark. All rights reserved.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """
    return _send_email(user_email, subject, html_body)
