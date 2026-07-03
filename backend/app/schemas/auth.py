"""
ForgeMind AI — Authentication Schemas (Pydantic v2)
"""
from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)


class RegisterRequest(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_]+$")
    full_name: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=8, max_length=100)
    role: str = Field(default="operator")


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginResponse(TokenResponse):
    refresh_token: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str
