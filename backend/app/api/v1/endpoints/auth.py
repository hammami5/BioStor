from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user
from app.services.auth import AuthService
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    Token,
    RefreshTokenRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    VerifyEmailRequest,
    UserWithStore,
    MessageResponse,
)
from app.models import User

router = APIRouter()


def get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    return AuthService(db)


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(
    data: RegisterRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    return await auth_service.register(data)


@router.post("/login", response_model=Token)
async def login(
    data: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    return await auth_service.login(data)


@router.post("/logout", response_model=MessageResponse)
async def logout(
    data: RefreshTokenRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    await auth_service.logout(data.refresh_token)
    return MessageResponse(message="Successfully logged out")


@router.post("/refresh", response_model=Token)
async def refresh(
    data: RefreshTokenRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    return await auth_service.refresh_access_token(data.refresh_token)


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(
    data: ForgotPasswordRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    await auth_service.forgot_password(data.email)
    return MessageResponse(message="If an account exists for this email, a reset link has been sent")


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(
    data: ResetPasswordRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    await auth_service.reset_password(data.token, data.password)
    return MessageResponse(message="Password has been reset successfully")


@router.post("/verify-email", response_model=MessageResponse)
async def verify_email(
    data: VerifyEmailRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    await auth_service.verify_email(data.token)
    return MessageResponse(message="Email verified successfully")


@router.post("/resend-verification", response_model=MessageResponse)
async def resend_verification(
    data: ForgotPasswordRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    await auth_service.resend_verification_email(data.email)
    return MessageResponse(message="If the email exists and is not verified, a verification link has been sent")


@router.get("/me", response_model=UserWithStore)
async def get_me(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    auth_service = AuthService(db)
    user_with_store = await auth_service.get_current_user_public(current_user)
    return user_with_store
