from typing import Optional, List
from sqlalchemy import select, delete, and_, func, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import (
    User,
    RefreshToken,
    PasswordResetToken,
    EmailVerificationToken,
    UserRole,
)
from app.core.security import create_token_hash, verify_token_hash
from datetime import datetime, timedelta


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: int) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.db.execute(
            select(User).where(User.email == email.lower().strip())
        )
        return result.scalar_one_or_none()

    async def get_by_username(self, username: str) -> Optional[User]:
        result = await self.db.execute(
            select(User).where(User.username == username.lower().strip())
        )
        return result.scalar_one_or_none()

    async def username_exists(self, username: str, exclude_id: Optional[int] = None) -> bool:
        query = select(User.id).where(User.username == username.lower().strip())
        if exclude_id:
            query = query.where(User.id != exclude_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none() is not None

    async def email_exists(self, email: str) -> bool:
        result = await self.db.execute(select(User.id).where(User.email == email.lower().strip()))
        return result.scalar_one_or_none() is not None

    async def create(self, user: User) -> User:
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def update(self, user: User) -> User:
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def delete(self, user_id: int) -> bool:
        user = await self.get_by_id(user_id)
        if user:
            await self.db.delete(user)
            await self.db.commit()
            return True
        return False

    async def get_all(self, skip: int = 0, limit: int = 100, search: Optional[str] = None) -> List[User]:
        query = select(User).order_by(User.created_at.desc())
        if search:
            like = f"%{search}%"
            query = query.where(
                (User.full_name.ilike(like)) | (User.email.ilike(like)) | (User.username.ilike(like))
            )
        query = query.offset(skip).limit(limit)
        result = await self.db.execute(query)
        return result.scalars().all()

    async def count(self, role: Optional[UserRole] = None) -> int:
        query = select(func.count(User.id))
        if role:
            query = query.where(User.role == role)
        result = await self.db.execute(query)
        return result.scalar()

    async def count_since(self, since: datetime) -> int:
        result = await self.db.execute(select(func.count(User.id)).where(User.created_at >= since))
        return result.scalar()


class RefreshTokenRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user_id: int, token: str, expires_at: datetime) -> RefreshToken:
        token_hash = create_token_hash(token)
        refresh_token = RefreshToken(
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at,
        )
        self.db.add(refresh_token)
        await self.db.commit()
        await self.db.refresh(refresh_token)
        return refresh_token

    async def get_valid_token(self, token: str) -> Optional[RefreshToken]:
        all_tokens = await self.db.execute(select(RefreshToken))
        for rt in all_tokens.scalars().all():
            if (
                verify_token_hash(token, rt.token_hash)
                and rt.expires_at > datetime.utcnow()
                and rt.revoked_at is None
            ):
                return rt
        return None

    async def revoke(self, token: RefreshToken) -> None:
        token.revoked_at = datetime.utcnow()
        await self.db.commit()

    async def revoke_all_user_tokens(self, user_id: int) -> None:
        await self.db.execute(
            update(RefreshToken)
            .where(and_(RefreshToken.user_id == user_id, RefreshToken.revoked_at.is_(None)))
            .values(revoked_at=datetime.utcnow())
        )
        await self.db.commit()


class PasswordResetTokenRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user_id: int, token: str, expires_at: datetime) -> PasswordResetToken:
        token_hash = create_token_hash(token)
        reset_token = PasswordResetToken(
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at,
        )
        self.db.add(reset_token)
        await self.db.commit()
        await self.db.refresh(reset_token)
        return reset_token

    async def get_valid_token(self, token: str) -> Optional[PasswordResetToken]:
        all_tokens = await self.db.execute(select(PasswordResetToken))
        for rt in all_tokens.scalars().all():
            if (
                verify_token_hash(token, rt.token_hash)
                and rt.expires_at > datetime.utcnow()
                and rt.used_at is None
            ):
                return rt
        return None

    async def mark_used(self, token: PasswordResetToken) -> None:
        token.used_at = datetime.utcnow()
        await self.db.commit()


class EmailVerificationTokenRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user_id: int, token: str, expires_at: datetime) -> EmailVerificationToken:
        token_hash = create_token_hash(token)
        verify_token = EmailVerificationToken(
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at,
        )
        self.db.add(verify_token)
        await self.db.commit()
        await self.db.refresh(verify_token)
        return verify_token

    async def get_valid_token(self, token: str) -> Optional[EmailVerificationToken]:
        all_tokens = await self.db.execute(select(EmailVerificationToken))
        for rt in all_tokens.scalars().all():
            if (
                verify_token_hash(token, rt.token_hash)
                and rt.expires_at > datetime.utcnow()
                and rt.used_at is None
            ):
                return rt
        return None

    async def mark_used(self, token: EmailVerificationToken) -> None:
        token.used_at = datetime.utcnow()
        await self.db.commit()
