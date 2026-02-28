from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from datetime import timedelta, datetime
from app.models.auth import UserRegister, UserLogin, Token, UserResponse 
from app.auth import (
    create_user, 
    authenticate_user, 
    create_access_token,
    get_user_by_id,
    create_refresh_token,
    format_user_response,
    SECRET_KEY,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from jose import JWTError, jwt
from app.db import db
from bson import ObjectId

router = APIRouter(prefix="/api", tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login", auto_error=False)

@router.post("/register", response_model=Token)
async def register(user_data: UserRegister):
    user_dict = user_data.dict()

    # Create user
    user = create_user(user_dict)

    # Create tokens
    access_token = create_access_token(
        data={"sub": str(user["_id"])},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    refresh_token = create_refresh_token(
        data={"sub": str(user["_id"])}
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": format_user_response(user)
    }

@router.post("/login", response_model=Token)
async def login(login_data: UserLogin):
    user = authenticate_user(login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    access_token = create_access_token(
        data={"sub": str(user["_id"])},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    refresh_token = create_refresh_token(
        data={"sub": str(user["_id"])}
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": format_user_response(user)
    }


async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Dependency to get current user from token - Enforces strict authentication"""
    if not token:
        # Check if the user is in a state where a bypass was intended (NOT recommended for production)
        # But for now, we strictly require a token to avoid session switching issues.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated. Please login.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )
        
        user = get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
            )
            
        # Normalize to a consistent dict with 'id', 'name', 'email'
        return {
            "id": str(user["_id"]),
            "name": f"{user.get('first_name', '')} {user.get('last_name', '')}".strip() or user.get("email", "user"),
            "email": user.get("email", ""),
            "first_name": user.get("first_name", ""),
            "last_name": user.get("last_name", ""),
            "is_admin": user.get("is_admin", False),
        }
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user = Depends(get_current_user)):
    """Get current user profile"""
    # current_user is already normalized with 'id', 'name', 'email' keys
    return {
        "id": current_user["id"],
        "first_name": current_user.get("first_name", ""),
        "last_name": current_user.get("last_name", ""),
        "email": current_user["email"],
        "created_at": current_user.get("created_at", datetime.utcnow()).isoformat()
        if hasattr(current_user.get("created_at"), "isoformat")
        else str(current_user.get("created_at", ""))
    }

@router.get("/verify-token")
async def verify_token(current_user = Depends(get_current_user)):
    """Verify token validity"""
    return {
        "valid": True,
        "user_id": current_user["id"],
        "email": current_user["email"]
    }

    return {"access_token": access_token}

@router.post("/refresh")
async def refresh_token(data: dict):
    refresh_token = data.get("refresh_token")

    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401)
    except JWTError:
        raise HTTPException(status_code=401)

    user = get_user_by_id(user_id)

    access_token = create_access_token(
        data={"sub": str(user["_id"])},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {"access_token": access_token}

@router.get("/users/all")
async def get_all_users(current_user = Depends(get_current_user)):
    """Get all users for admin management"""
    users = list(db.users.find())
    formatted_users = []
    for user in users:
        created_at = user.get("created_at")
        if isinstance(created_at, datetime):
            created_at_str = created_at.isoformat()
        elif isinstance(created_at, str):
            created_at_str = created_at
        else:
            created_at_str = datetime.utcnow().isoformat()

        formatted_users.append({
            "_id": str(user["_id"]),
            "first_name": user.get("first_name", ""),
            "last_name": user.get("last_name", ""),
            "email": user.get("email", ""),
            "role": user.get("role", "user"),
            "is_admin": user.get("is_admin", False),
            "status": user.get("status", "active"),
            "created_at": created_at_str
        })
    return formatted_users

@router.delete("/users/{user_id}")
async def delete_user(user_id: str, current_user = Depends(get_current_user)):
    """Delete a user by ID"""
    try:
        result = db.users.delete_one({"_id": ObjectId(user_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        return {"message": "User deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
