from app.auth import create_user
from app.db import db
from fastapi import HTTPException

admin_email = "admin@gmail.com"
admin_password = "admin1234"

try:
    # Check if admin already exists
    existing = db.users.find_one({"email": admin_email})
    if existing:
        print(f"Admin user {admin_email} already exists.")
        # Ensure it is admin
        db.users.update_one({"email": admin_email}, {"$set": {"is_admin": True, "role": "admin"}})
        print("Updated admin status.")
    else:
        user_data = {
            "first_name": "System",
            "last_name": "Administrator",
            "email": admin_email,
            "password": admin_password,
            "is_admin": True,
            "role": "admin"
        }
        create_user(user_data)
        print(f"Admin user {admin_email} created successfully.")
except Exception as e:
    print(f"Error: {e}")
