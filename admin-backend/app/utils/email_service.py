import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging
from datetime import datetime
from dotenv import load_dotenv

# Load .env at module import time so credentials are available immediately
load_dotenv(override=True)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def _get_smtp_config():
    """Load SMTP credentials from environment.
    
    Gmail App Passwords are displayed with spaces (e.g. 'pvfb rgrw gmrj soit')
    but must be used WITHOUT spaces when authenticating via SMTP.
    We strip all whitespace from the password automatically.
    """
    return {
        "user":     os.getenv("EMAIL_USER", "").strip(),
        # Strip spaces — Gmail App Passwords are shown with spaces for readability only
        "password": os.getenv("EMAIL_PASSWORD", "").replace(" ", "").strip(),
        "host":     os.getenv("EMAIL_HOST", "smtp.gmail.com"),
        "port":     int(os.getenv("EMAIL_PORT", 587)),
    }


def _send_email(to_email: str, subject: str, html_body: str) -> tuple[bool, str]:
    """
    Low-level helper to send an HTML email via SMTP.
    Returns (success: bool, message: str).
    """
    cfg = _get_smtp_config()
    if not cfg["user"] or not cfg["password"]:
        logger.error("Email credentials not configured (EMAIL_USER / EMAIL_PASSWORD missing).")
        return False, "Email credentials not configured."

    msg = MIMEMultipart("alternative")
    msg["From"] = f"SolarMark <{cfg['user']}>"
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(html_body, "html"))

    try:
        server = smtplib.SMTP(cfg["host"], cfg["port"], timeout=10)
        server.starttls()
        server.login(str(cfg["user"]), str(cfg["password"]))
        server.send_message(msg)
        server.quit()
        logger.info(f"Email sent successfully to {to_email} — Subject: {subject}")
        return True, "Success"
    except smtplib.SMTPAuthenticationError:
        msg_err = "SMTP Authentication failed. Check EMAIL_USER and EMAIL_PASSWORD."
        logger.error(msg_err)
        return False, msg_err
    except Exception as e:
        msg_err = f"Unexpected error sending email: {str(e)}"
        logger.error(msg_err)
        return False, msg_err

def send_notification(subject: str, body: str, recipient: str = None, title: str = "New Notification") -> tuple[bool, str]:
    """
    Send a general notification email.
    If recipient is None, uses EMAIL_USER as the default (admin notification).
    """
    target_email = recipient if recipient else os.getenv("EMAIL_USER", "").strip()
    if not target_email:
        logger.error("Notification failed: Recipient email not set.")
        return False, "Recipient email not configured."
    
    html_body = f"""
    <html>
    <body style="font-family: sans-serif; padding: 20px;">
        <h2 style="color: #0f172a; border-bottom: 2px solid #f97316; padding-bottom: 10px;">{subject}</h2>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; white-space: pre-wrap;">
{body}
        </div>
        <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
            This is an automated notification from SolarMark Backend.
        </p>
    </body>
    </html>
    """
    return _send_email(target_email, subject, html_body)


def send_file_upload_notification(
    user_email: str,
    user_name: str,
    filename: str,
    file_size_bytes: int,
    uploaded_by_admin: str = "SolarMark Admin",
) -> tuple[bool, str]:
    """Send a notification email to a user when an admin uploads a file to their profile."""
    # Format file size nicely
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
                                        <td style="padding: 18px 24px;">
                                             <p style="margin: 0; font-size: 10px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #94a3b8;">File Information</p>
                                             <p style="margin: 6px 0 0; font-size: 14px; font-weight: 600; color: #475569;">Size: {size_str} | Uploaded by: {uploaded_by_admin}</p>
                                        </td>
                                    </tr>
                                </table>
                                <div style="text-align: center; margin-bottom: 32px;">
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


def send_review_update_notification(
    recipient_email: str, 
    user_name: str, 
    filename: str, 
    status: str, 
    admin_remarks: str = ""
) -> tuple[bool, str]:
    """Send notification when a report review is updated by admin."""
    subject = f"Update on your Report Review: {filename}"
    status_text = status.upper()
    
    html_body = f"""
    <html>
    <body style="font-family: sans-serif; padding: 20px;">
        <h2 style="color: #0f172a; border-bottom: 2px solid #f97316; padding-bottom: 10px;">Review Update</h2>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px;">
            <p>Hello <strong>{user_name}</strong>,</p>
            <p>Your report review for "<strong>{filename}</strong>" has been updated.</p>
            <p><strong>New Status:</strong> <span style="color: #ea580c; font-weight: bold;">{status_text}</span></p>
            <p><strong>Admin Remarks:</strong> {admin_remarks if admin_remarks else 'No specific remarks.'}</p>
            <p style="margin-top: 20px;">You can check the full details in your profile dashboard.</p>
        </div>
    </body>
    </html>
    """
    return _send_email(recipient_email, subject, html_body)


class EmailService:
    """Wrapper class to provide both functional and object-oriented access."""
    def send_notification(self, subject: str, body: str, recipient: str = None, title: str = "New Notification"):
        return send_notification(subject, body, recipient, title)
    
    def send_file_upload_notification(self, *args, **kwargs):
        return send_file_upload_notification(*args, **kwargs)

    def send_review_update_notification(self, *args, **kwargs):
        return send_review_update_notification(*args, **kwargs)

# Singleton instance for easy import
email_service = EmailService()
