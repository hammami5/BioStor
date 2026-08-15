import re
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator
from app.models import UserRole


class UsernameMixin(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        v = v.strip().lower()
        if not re.match(r"^[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?$", v):
            raise ValueError(
                "Username can only contain lowercase letters, numbers, dots, dashes and underscores"
            )
        if len(v) < 3:
            raise ValueError("Username must be at least 3 characters")
        return v


class UserBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr


class UserCreate(UsernameMixin, UserBase):
    password: str = Field(..., min_length=8, max_length=128)
    store_name: str = Field(..., min_length=1, max_length=255)


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None


class UserResponse(UserBase):
    id: int
    username: str
    role: UserRole
    is_verified: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserWithStore(UserResponse):
    store: Optional["StoreResponse"] = None


class StoreBase(BaseModel):
    store_name: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., min_length=1, max_length=255)
    logo: Optional[str] = None


class StoreResponse(StoreBase):
    id: int
    owner_id: int
    description: Optional[str] = None
    instagram_username: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_address: Optional[str] = None
    contact_city: Optional[str] = None
    is_active: bool
    is_suspended: bool
    created_at: datetime
    updated_at: datetime
    settings: Optional["StoreSettingsResponse"] = None

    model_config = ConfigDict(from_attributes=True)


class StoreSettingsResponse(BaseModel):
    accent_color: str
    button_style: str
    theme: str
    currency: str
    delivery_fee: float

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


class RegisterRequest(UsernameMixin, BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    store_name: str = Field(..., min_length=1, max_length=255)


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    password: str = Field(..., min_length=8, max_length=128)


class VerifyEmailRequest(BaseModel):
    token: str


class MessageResponse(BaseModel):
    message: str


# Circular forward refs
StoreResponse.model_rebuild()
UserWithStore.model_rebuild()
