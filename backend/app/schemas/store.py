from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator

from app.models.enums import ButtonStyle, StoreTheme
from app.schemas.auth import StoreSettingsResponse, StoreResponse


class StoreUpdateRequest(BaseModel):
    store_name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    instagram_username: Optional[str] = Field(None, max_length=255)
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = Field(None, max_length=50)
    contact_address: Optional[str] = Field(None, max_length=500)
    contact_city: Optional[str] = Field(None, max_length=120)


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
