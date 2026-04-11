from jose import jwt
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

# admin@gmail.com ID from previous check: 69cf8fb3c6db3ea6ee13bf13
user_id = "69cf8fb3c6db3ea6ee13bf13"

data = {"sub": user_id, "exp": datetime.utcnow() + timedelta(hours=1)}
token = jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)
print(f"Generated Admin Token: {token}")
