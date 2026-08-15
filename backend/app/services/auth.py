import re
import secrets
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.auth import (
    UserRepository,
    RefreshTokenRepository,
    PasswordResetTokenRepository,
    EmailVerificationTokenRepository,
)
from app.repositories.store import StoreRepository, StoreSettingsRepository
from app.models import User, Store, StoreSettings, UserRole
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.core.config import settings
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    Token,
    UserWithStore,
    StoreResponse,
    StoreSettingsResponse,
)
from fastapi import HTTPException, status


def generate_token() -> str:
    return secrets.token_urlsafe(32)


def normalize_username(username: str) -> str:
    return username.strip().lower()


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
        self.store_repo = StoreRepository(db)
        self.store_settings_repo = StoreSettingsRepository(db)
        self.refresh_token_repo = RefreshTokenRepository(db)
        self.password_reset_repo = PasswordResetTokenRepository(db)
        self.email_verification_repo = EmailVerificationTokenRepository(db)

    async def register(self, data: RegisterRequest) -> Token:
        if await self.user_repo.email_exists(data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email already exists",
            )

        username = normalize_username(data.username)
        if await self.user_repo.username_exists(username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This username is already taken. Try another one.",
            )

        password_hash = get_password_hash(data.password)

        user = User(
            full_name=data.full_name.strip(),
            email=data.email.lower().strip(),
            username=username,
            password_hash=password_hash,
            role=UserRole.STORE_OWNER,
        )
        user = await self.user_repo.create(user)

        store = Store(
            owner_id=user.id,
            store_name=data.store_name.strip(),
            slug=username,
        )
        store = await self.store_repo.create(store)

        await self.store_settings_repo.create(
            StoreSettings(store_id=store.id)
        )

        await self._ensure_free_subscription(store.id)

        verification_token = generate_token()
        expires_at = datetime.utcnow() + timedelta(hours=24)
        await self.email_verification_repo.create(user.id, verification_token, expires_at)
        await self._send_verification_email(user.email, verification_token)

        return await self._issue_tokens(user)

    async def _ensure_free_subscription(self, store_id: int) -> None:
        from app.repositories.subscriptions import SubscriptionRepository

        await SubscriptionRepository(self.db).upsert_free(store_id)

    async def _issue_tokens(self, user: User) -> Token:
        access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email, "role": user.role.value}
        )
        refresh_token = create_refresh_token(
            data={"sub": str(user.id), "email": user.email, "role": user.role.value}
        )
        expires_at = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        await self.refresh_token_repo.create(user.id, refresh_token, expires_at)
        return Token(access_token=access_token, refresh_token=refresh_token)

    async def login(self, data: LoginRequest) -> Token:
        user = await self.user_repo.get_by_email(data.email)
        if not user or not verify_password(data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is deactivated",
            )
        return await self._issue_tokens(user)

    async def logout(self, refresh_token: str) -> None:
        token_obj = await self.refresh_token_repo.get_valid_token(refresh_token)
        if token_obj:
            await self.refresh_token_repo.revoke(token_obj)

    async def refresh_access_token(self, refresh_token: str) -> Token:
        token_obj = await self.refresh_token_repo.get_valid_token(refresh_token)
        if not token_obj:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token",
            )

        user = await self.user_repo.get_by_id(token_obj.user_id)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive",
            )

        await self.refresh_token_repo.revoke(token_obj)
        return await self._issue_tokens(user)

    async def forgot_password(self, email: str) -> None:
        user = await self.user_repo.get_by_email(email)
        if not user:
            return

        reset_token = generate_token()
        expires_at = datetime.utcnow() + timedelta(hours=1)
        await self.password_reset_repo.create(user.id, reset_token, expires_at)
        await self._send_password_reset_email(user.email, reset_token)

    async def reset_password(self, token: str, new_password: str) -> None:
        reset_token_obj = await self.password_reset_repo.get_valid_token(token)
        if not reset_token_obj:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token",
            )

        user = await self.user_repo.get_by_id(reset_token_obj.user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        user.password_hash = get_password_hash(new_password)
        await self.user_repo.update(user)
        await self.password_reset_repo.mark_used(reset_token_obj)
        await self.refresh_token_repo.revoke_all_user_tokens(user.id)

    async def verify_email(self, token: str) -> None:
        verify_token_obj = await self.email_verification_repo.get_valid_token(token)
        if not verify_token_obj:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired verification token",
            )

        user = await self.user_repo.get_by_id(verify_token_obj.user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        user.is_verified = True
        await self.user_repo.update(user)
        await self.email_verification_repo.mark_used(verify_token_obj)

    async def resend_verification_email(self, email: str) -> None:
        user = await self.user_repo.get_by_email(email)
        if not user or user.is_verified:
            return

        verification_token = generate_token()
        expires_at = datetime.utcnow() + timedelta(hours=24)
        await self.email_verification_repo.create(user.id, verification_token, expires_at)
        await self._send_verification_email(user.email, verification_token)

    async def get_current_user(self, token: str) -> Optional[UserWithStore]:
        payload = decode_token(token)
        if not payload or payload.get("type") != "access":
            return None
        user_id = int(payload.get("sub"))
        user = await self.user_repo.get_by_id(user_id)
        if not user or not user.is_active:
            return None

        store = await self.store_repo.get_by_owner_id(user.id)
        settings_obj = None
        if store:
            settings_obj = await self.store_settings_repo.get_by_store_id(store.id)
            if settings_obj:
                store.settings = settings_obj
        return self._user_with_store(user, store)

    async def get_current_user_public(self, user: User) -> UserWithStore:
        store = await self.store_repo.get_by_owner_id(user.id)
        settings_obj = None
        if store:
            settings_obj = await self.store_settings_repo.get_by_store_id(store.id)
            if settings_obj:
                store.settings = settings_obj
        return self._user_with_store(user, store)

    def _user_with_store(self, user: User, store: Optional[Store]) -> UserWithStore:
        store_response = StoreResponse.model_validate(store) if store else None
        return UserWithStore(
            id=user.id,
            username=user.username,
            full_name=user.full_name,
            email=user.email,
            role=user.role,
            is_verified=user.is_verified,
            is_active=user.is_active,
            created_at=user.created_at,
            updated_at=user.updated_at,
            store=store_response,
        )

    async def _send_verification_email(self, email: str, token: str) -> None:
        verify_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
        print(f"[EMAIL] Send verification to {email}: {verify_url}")

    async def _send_password_reset_email(self, email: str, token: str) -> None:
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        print(f"[EMAIL] Send password reset to {email}: {reset_url}")
