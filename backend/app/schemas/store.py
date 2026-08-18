import re
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator

from app.models.enums import ButtonStyle, StoreTheme
from app.schemas.auth import StoreSettingsResponse, StoreResponse

RESERVED_SLUGS = {
    "admin", "dashboard", "login", "register", "api", "store",
    "settings", "orders", "products", "customers", "analytics",
    "notifications", "subscription", "auth", "health", "uploads",
    "verify-email", "forgot-password", "reset-password",
}


class StoreUpdateRequest(BaseModel):
    store_name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    instagram_username: Optional[str] = Field(None, max_length=255)
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = Field(None, max_length=50)
    contact_address: Optional[str] = Field(None, max_length=500)
    contact_city: Optional[str] = Field(None, max_length=120)


class SlugUpdateRequest(BaseModel):
    slug: str = Field(..., min_length=3, max_length=50)

    @field_validator("slug")
    @classmethod
    def validate_slug(cls, v: str) -> str:
        slug = v.lower().strip()
        if not re.match(r"^[a-z0-9]([a-z0-9_-]*[a-z0-9])?$", slug):
            raise ValueError(
                "Slug must be lowercase alphanumeric with hyphens/underscores, "
                "3-50 characters, starting and ending with a letter or number."
            )
        if slug in RESERVED_SLUGS:
            raise ValueError(f'The slug "{slug}" is reserved.')
        return slug


class StoreSettingsUpdateRequest(BaseModel):
    accent_color: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{3,9}$")
    button_style: Optional[ButtonStyle] = None
    theme: Optional[StoreTheme] = None
    currency: Optional[str] = Field(None, min_length=1, max_length=8)
    delivery_fee: Optional[float] = Field(None, ge=0, le=1000000)
    logo: Optional[str] = None


class StoreDetailResponse(StoreResponse):
    pass


class StorePublicResponse(BaseModel):
    """Public store data exposed to customers (no seller-private info)."""

    id: int
    store_name: str
    slug: str
    logo: Optional[str] = None
    description: Optional[str] = None
    instagram_username: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_address: Optional[str] = None
    contact_city: Optional[str] = None
    settings: StoreSettingsResponse

    model_config = ConfigDict(from_attributes=True)
