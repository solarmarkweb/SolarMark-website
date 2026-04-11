from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DATABASE_NAME", "solarpanel")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

print("Users in DB:")
for user in db.users.find():
    print(f"ID: {user['_id']}, Email: {user.get('email')}, Is Admin: {user.get('is_admin')}")
