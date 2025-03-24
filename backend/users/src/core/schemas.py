from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ValidationError, Field

class UserResponse(BaseModel):
    message: str

class UserModel(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserBaseModel(BaseModel):
    email: str
    username: str
    created_at: datetime
    updated_at: datetime
    userImage: Optional[str]


def validate_user_data(username: str, email: EmailStr, password: str) -> UserModel:
    try:
        user_model = UserModel(username=username, email=email, password=password)
        return user_model
    except ValidationError as e:
        raise ValueError(f"Ошибка валидации: {e}")
