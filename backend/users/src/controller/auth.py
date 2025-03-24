from fastapi import APIRouter, Response, Request
from src.core.schemas import validate_user_data
from pydantic import ValidationError
from src.service.auth import AuthService
from src.core.schemas import UserModel

router = APIRouter(tags=["Auth"], prefix="/users")


@router.post("/auth")
async def auth_user(user: UserModel, response: Response):
    try:
        validate_user_data(user.username, user.email, user.password)
    except ValidationError as e:
        raise ValueError(f"Ошибка валидации: {e}")
    user_validate = await AuthService.auth_user(
        username=user.username, password=user.password, email=user.email
    )
    response.set_cookie(
        key="refresh_token",
        value=user_validate.get("refresh_token"),
        path="/",
        max_age=30 * 24 * 60 * 60,
    )
    return user_validate


@router.post("/register")
async def register_user(user: UserModel, response: Response):
    try:
        validate_user_data(user.username, user.email, user.password)
    except ValidationError as e:
        raise ValueError(f"Ошибка валидации: {e}")
    user_validate = await AuthService.register_user(
        username=user.username, password=user.password, email=user.email
    )
    response.set_cookie(
        key="refresh_token",
        value=user_validate.get("refresh_token"),
        path="/",
        max_age=30 * 24 * 60 * 60,
    )
    return user_validate


@router.post("/logout")
async def logout(response: Response, request: Request):
    refresh_token = request.cookies.get("refresh_token")
    user_logout = await AuthService.logout_user(refresh_token=refresh_token)
    response.delete_cookie(key="refresh_token", path="/")
    return user_logout
