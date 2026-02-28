from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
import enum
from datetime import datetime

Base = declarative_base()

class ImageTypeEnum(enum.Enum):
    RGB = "rgb"
    THERMAL = "thermal"

class Image(Base):
    __tablename__ = "images"
    
    id = Column(String, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    image_type = Column(String, nullable=False)  # 'rgb' or 'thermal'
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    user_name = Column(String, nullable=False)
    drive_file_id = Column(String, nullable=False, unique=True)
    drive_file_url = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default='active')  # 'active', 'deleted'

class UserFolder(Base):
    __tablename__ = "user_folders"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    user_name = Column(String, nullable=False)
    user_email = Column(String, nullable=False)
    folder_id = Column(String, nullable=False, unique=True)
    folder_url = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)