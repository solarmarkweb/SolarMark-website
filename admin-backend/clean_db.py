from app.db import db
import os

UPLOAD_DIR = "uploads/site_photos"
photos = list(db.site_photos.find({}))
deleted = 0
for photo in photos:
    filename = photo.get("filename")
    if filename:
        file_path = os.path.join(UPLOAD_DIR, filename)
        if not os.path.exists(file_path):
            db.site_photos.delete_one({"_id": photo["_id"]})
            print(f"Deleted missing photo DB entry: {filename}")
            deleted += 1
print(f"Cleanup complete. Deleted {deleted} records.")
