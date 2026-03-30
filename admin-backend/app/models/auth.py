from pydantic import BaseModel, validator

class UserRegister(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str
    role: str = "user"

    @validator('first_name')
    def validate_first_name(cls, v):
        v = v.strip()
        if len(v) < 2:
            raise ValueError('First name must be at least 2 characters')
        return v

    @validator('last_name')
    def validate_last_name(cls, v):
        v = v.strip()
        if len(v) < 1:
            raise ValueError('Last name must be at least one character')
        return v

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        return v

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: str
    created_at: str
    is_admin: bool = False
    role: str = "user"

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user: UserResponse