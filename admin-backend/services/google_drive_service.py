import os
import io
import re
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
from googleapiclient.errors import HttpError
from datetime import datetime
import logging
from typing import Optional, Tuple, List
import traceback

logger = logging.getLogger(__name__)

class GoogleDriveService:
    def __init__(self):
        self.SCOPES = ['https://www.googleapis.com/auth/drive']
        self.TOKEN_FILE = os.getenv('GOOGLE_DRIVE_TOKEN_PATH', 'token.json')
        self.SERVICE_ACCOUNT_FILE = os.getenv('GOOGLE_DRIVE_SERVICE_ACCOUNT_PATH', 'service-account.json')
        
        # Admin's Google Drive URL
        self.ADMIN_DRIVE_URL = os.getenv('ADMIN_GOOGLE_DRIVE_URL', 'https://drive.google.com/drive/u/0/home')
        
        # Extract folder ID from URL if provided, otherwise use direct folder ID
        admin_folder_id = os.getenv('ADMIN_GOOGLE_DRIVE_FOLDER_ID')
        if not admin_folder_id:
            # Try to extract from URL
            match = re.search(r'folders/([a-zA-Z0-9_-]+)', self.ADMIN_DRIVE_URL)
            if match:
                admin_folder_id = match.group(1)
            else:
                # Default root folder for the admin's drive
                admin_folder_id = 'root'
        
        self.ADMIN_DRIVE_FOLDER_ID = admin_folder_id
        
        # Initialize Drive service
        self.service = self._initialize_drive_service()
        logger.info(f"Google Drive Service initialized with Admin Folder ID: {self.ADMIN_DRIVE_FOLDER_ID}")
    
    def _initialize_drive_service(self):
        """Initialize Google Drive service with user token or service account"""
        try:
            from google.oauth2.credentials import Credentials
            from google.auth.transport.requests import Request
            
            creds = None
            token_path = self.TOKEN_FILE
            
            # Check in parent dir if not found (for tests/scripts)
            if not os.path.exists(token_path):
                parent_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), self.TOKEN_FILE)
                if os.path.exists(parent_path):
                    token_path = parent_path

            if os.path.exists(token_path):
                logger.info(f"Using Google Drive user token from: {token_path}")
                creds = Credentials.from_authorized_user_file(token_path, self.SCOPES)
                
                if creds and creds.expired and creds.refresh_token:
                    creds.refresh(Request())
                    with open(token_path, 'w') as token:
                        token.write(creds.to_json())
                        
                return build('drive', 'v3', credentials=creds)
            
            # Fallback to Service Account for backward compatibility or Workspace users
            if os.path.exists(self.SERVICE_ACCOUNT_FILE):
                logger.info(f"Using Google Drive service account from: {self.SERVICE_ACCOUNT_FILE}")
                creds = service_account.Credentials.from_service_account_file(
                    self.SERVICE_ACCOUNT_FILE, scopes=self.SCOPES)
                return build('drive', 'v3', credentials=creds)
                
            raise FileNotFoundError("No authentication file found for Google Drive.")

        except Exception as e:
            msg = (
                f"\n\n❌ GOOGLE DRIVE SETUP REQUIRED ❌\n"
                f"{'='*60}\n"
                f"Google Drive token.json not found!\n"
                f"Service Accounts (like the one you created) NO LONGER WORK for free personal @gmail.com accounts due to a 0-byte quota policy by Google.\n\n"
                f"You must use User OAuth instead.\n"
                f"Steps to fix:\n"
                f"  1. Go to https://console.cloud.google.com/apis/credentials\n"
                f"  2. Click 'CREATE CREDENTIALS' > 'OAuth client ID'\n"
                f"  3. If asked to configure consent screen: choose 'External', add yourself as Test User, add '. /auth/drive' scope.\n"
                f"  4. Application Type: 'Desktop app'. Name it 'Drive Uploader'. Click Create.\n"
                f"  5. Click 'DOWNLOAD JSON' and rename it to 'credentials.json'\n"
                f"  6. Place 'credentials.json' in your 'admin-backend' folder.\n"
                f"  7. Run the auth script I just created for you: 'python setup_drive_auth.py'\n"
                f"     or 'venv\Scripts\python setup_drive_auth.py'\n"
                f"  8. It will open your browser, ask you to log in to your Google Drive, and save a 'token.json'.\n"
                f"{'='*60}\n"
            )
            logger.error(msg)
            raise FileNotFoundError(msg)
    
    def create_user_folder(self, user_name: str, user_email: str) -> Tuple[str, str]:
        """
        Create a folder for the user in the admin's Google Drive
        Returns: (folder_id, folder_url)
        """
        try:
            # Use the user's name exactly for their folder
            # We can also append the email if we want strictly unique folders, but name is cleaner
            folder_name = user_name
            
            # 1. Check if folder already exists in the target parent folder
            query = f"name='{folder_name}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
            if self.ADMIN_DRIVE_FOLDER_ID != 'root':
                query += f" and '{self.ADMIN_DRIVE_FOLDER_ID}' in parents"
                
            existing_folders = self.service.files().list(
                q=query,
                fields='files(id, name, webViewLink)',
                spaces='drive'
            ).execute().get('files', [])

            if existing_folders:
                # Folder already exists, reuse the first one found
                folder_id = existing_folders[0].get('id')
                folder_url = existing_folders[0].get('webViewLink') or f"https://drive.google.com/drive/folders/{folder_id}"
                logger.info(f"Re-using existing folder for user {user_name} (ID: {folder_id})")
                return folder_id, folder_url

            # 2. If it does not exist, create folder metadata
            file_metadata = {
                'name': folder_name,
                'mimeType': 'application/vnd.google-apps.folder',
            }
            
            # Add parent if not root
            if self.ADMIN_DRIVE_FOLDER_ID != 'root':
                file_metadata['parents'] = [self.ADMIN_DRIVE_FOLDER_ID]
            
            # Create folder
            folder = self.service.files().create(
                body=file_metadata,
                fields='id, name, webViewLink'
            ).execute()
            
            folder_id = folder.get('id')
            
            # Generate folder URL (or use webViewLink if returned)
            folder_url = folder.get('webViewLink') or f"https://drive.google.com/drive/folders/{folder_id}"
            
            logger.info(f"Created folder for user {user_name}: {folder_name} (ID: {folder_id})")
            logger.info(f"Folder URL: {folder_url}")
            
            return folder_id, folder_url
            
        except HttpError as e:
            logger.error(f"Google Drive API error creating folder: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error creating folder: {str(e)}")
            logger.error(traceback.format_exc())
            raise
    
    def get_or_create_subfolder(self, parent_folder_id: str, subfolder_name: str) -> str:
        """
        Create a subfolder inside a given parent folder, or return the ID if it already exists.
        Returns: subfolder_id
        """
        try:
            query = f"name='{subfolder_name}' and mimeType='application/vnd.google-apps.folder' and trashed=false and '{parent_folder_id}' in parents"
                
            existing_folders = self.service.files().list(
                q=query,
                fields='files(id, name)',
                spaces='drive'
            ).execute().get('files', [])

            if existing_folders:
                return existing_folders[0].get('id')

            # Create subfolder metadata
            file_metadata = {
                'name': subfolder_name,
                'mimeType': 'application/vnd.google-apps.folder',
                'parents': [parent_folder_id]
            }
            
            # Create folder
            folder = self.service.files().create(
                body=file_metadata,
                fields='id'
            ).execute()
            
            return folder.get('id')
            
        except HttpError as e:
            logger.error(f"Google Drive API error creating subfolder: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error creating subfolder: {str(e)}")
            logger.error(traceback.format_exc())
            raise
    
    def upload_image_to_drive(self, file_data: bytes, filename: str, mime_type: str, 
                            user_folder_id: str) -> Tuple[str, str, int]:
        """
        Upload image to user's folder in admin's Google Drive
        Returns: (file_id, file_url, file_size)
        """
        try:
            # Prepare file metadata
            file_metadata = {
                'name': filename,
                'parents': [user_folder_id]
            }
            
            # Create media upload
            media = MediaIoBaseUpload(
                io.BytesIO(file_data),
                mimetype=mime_type,
                resumable=True
            )
            
            # Upload file
            file = self.service.files().create(
                body=file_metadata,
                media_body=media,
                fields='id, name, size, webViewLink'
            ).execute()
            
            file_id = file.get('id')
            
            # Generate file URL
            file_url = f"https://drive.google.com/file/d/{file_id}/view"
            file_size = int(file.get('size', 0))
            
            logger.info(f"Uploaded file {filename} to Drive (ID: {file_id})")
            logger.info(f"File URL: {file_url}")
            
            return file_id, file_url, file_size
            
        except HttpError as e:
            logger.error(f"Google Drive API error uploading file: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error uploading file: {str(e)}")
            logger.error(traceback.format_exc())
            raise
    
    def delete_file_from_drive(self, file_id: str):
        """Delete a file from Google Drive"""
        try:
            self.service.files().delete(fileId=file_id).execute()
            logger.info(f"Deleted file from Drive: {file_id}")
        except HttpError as e:
            logger.error(f"Google Drive API error deleting file: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error deleting file: {str(e)}")
            logger.error(traceback.format_exc())
            raise
    
    def get_file_metadata(self, file_id: str) -> dict:
        """Get file metadata from Google Drive"""
        try:
            file = self.service.files().get(
                fileId=file_id,
                fields='id, name, size, createdTime, webViewLink, parents'
            ).execute()
            return file
        except HttpError as e:
            logger.error(f"Google Drive API error getting file metadata: {str(e)}")
            raise
    
    def list_user_files(self, folder_id: str) -> List[dict]:
        """List all files in a user's folder"""
        try:
            results = self.service.files().list(
                q=f"'{folder_id}' in parents and trashed=false",
                fields='files(id, name, size, createdTime, webViewLink, mimeType)'
            ).execute()
            return results.get('files', [])
        except HttpError as e:
            logger.error(f"Google Drive API error listing files: {str(e)}")
            raise
    
    def get_admin_drive_info(self) -> dict:
        """Get admin's Google Drive information"""
        try:
            # Get drive info
            about = self.service.about().get(fields='user, storageQuota').execute()
            
            return {
                'drive_url': self.ADMIN_DRIVE_URL,
                'admin_folder_id': self.ADMIN_DRIVE_FOLDER_ID,
                'admin_email': about.get('user', {}).get('emailAddress'),
                'admin_name': about.get('user', {}).get('displayName'),
                'storage_quota': about.get('storageQuota', {})
            }
        except Exception as e:
            logger.error(f"Error getting admin drive info: {str(e)}")
            return {
                'drive_url': self.ADMIN_DRIVE_URL,
                'admin_folder_id': self.ADMIN_DRIVE_FOLDER_ID,
                'error': str(e)
            }