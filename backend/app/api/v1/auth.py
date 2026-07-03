"""
Authentication Endpoints

POST /api/v1/auth/register  — Create a new user account
POST /api/v1/auth/login     — Login → JWT access + refresh tokens
POST /api/v1/auth/refresh   — Issue new access token from refresh token
POST /api/v1/auth/logout    — Client-side logout (token is stateless)
GET  /api/v1/auth/me        — Get current user profile
"""
from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm

from app.api.deps import CurrentUser, DBSession
from app.schemas.auth import (
    LoginResponse,
    RefreshTokenRequest,
    RegisterRequest,
    TokenResponse,
)
from app.schemas.user import UserResponse
from app.services.auth_service import AuthService

router = APIRouter()


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
)
async def register(body: RegisterRequest, session: DBSession) -> UserResponse:
    """
    Create a new ForgeMind AI user.

    - Email and username must be unique.
    - Password is bcrypt-hashed before storage.
    - Default role is `operator` unless specified.
    """
    service = AuthService(session)
    user = await service.register(body)
    return UserResponse.model_validate(user)


@router.post(
    "/login",
    response_model=LoginResponse,
    status_code=status.HTTP_200_OK,
    summary="Login with email and password",
)
async def login(
    session: DBSession,
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> LoginResponse:
    """
    Authenticate with email + password using the OAuth2 password flow.

    Returns a short-lived **access token** and a long-lived **refresh token**.
    The access token must be sent as `Authorization: Bearer <token>`.
    """
    service = AuthService(session)
    return await service.login(
        email=form_data.username,   # OAuth2 spec: username field carries email
        password=form_data.password,
    )


@router.post(
    "/refresh",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Refresh an access token",
)
async def refresh_token(body: RefreshTokenRequest, session: DBSession) -> TokenResponse:
    """
    Exchange a valid refresh token for a new access token.

    Refresh tokens expire after `JWT_REFRESH_TOKEN_EXPIRE_DAYS` days.
    """
    service = AuthService(session)
    return await service.refresh(body.refresh_token)


@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Logout (invalidate client token)",
)
async def logout() -> None:
    """
    Logout the current user.

    Since JWTs are stateless, the client is responsible for discarding
    the token. Future milestone: blacklist the refresh token in Redis.
    """
    return None


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current user profile",
)
async def get_me(current_user: CurrentUser) -> UserResponse:
    """
    Return the profile of the currently authenticated user.

    Requires a valid `Authorization: Bearer <access_token>` header.
    """
    return UserResponse.model_validate(current_user)
