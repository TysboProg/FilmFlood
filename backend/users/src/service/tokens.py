import jwt
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status
from typing import Optional, Dict, Any
from src.core.config import get_settings
from src.core.database.models import UsersTable, TokensTable
from src.core.database.base import async_session
from sqlalchemy import select
from src.core.database.requests import TokenRequest

settings = get_settings()
private_key = settings.jwt_keys.get_private_key()
public_key = settings.jwt_keys.get_public_key()


class TokenService:
    @staticmethod
    async def validate_access_token(access_token: str) -> Optional[Dict[str, Any]]:
        try:
            payload = jwt.decode(access_token, public_key, algorithms=["RS256"])
            return payload
        except jwt.PyJWTError:
            return None

    @staticmethod
    async def validate_refresh_token(refresh_token: str) -> Optional[Dict[str, Any]]:
        try:
            payload = jwt.decode(refresh_token, public_key, algorithms=["RS256"])
            return payload
        except jwt.PyJWTError:
            return None

    @staticmethod
    async def generate_tokens(payload: Dict[str, Any]) -> Dict[str, str]:
        access_token = jwt.encode(
            {**payload, "exp": datetime.now(timezone.utc) + timedelta(days=20)},
            private_key,
            algorithm="RS256",
        )

        refresh_token = jwt.encode(
            {**payload, "exp": datetime.now(timezone.utc) + timedelta(days=14)},
            private_key,
            algorithm="RS256",
        )

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
        }

    async def refresh_token(self, refresh_token: str):
        async with async_session() as session:
            if not refresh_token:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Токена не существует!",
                )

            # Проверяем валидность refresh-токена
            token_data = await self.validate_refresh_token(refresh_token)
            if not token_data:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED, detail="Неверный токен!"
                )

            # Ищем токен в базе данных
            stmt = select(TokensTable).where(
                TokensTable.refresh_token == token_data["refresh_token"]
            )
            result = await session.execute(stmt)
            token_from_db = result.scalar_one_or_none()

            if not token_from_db:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Токен не найден в базе данных!",
                )

            # Ищем пользователя по user_id из токена
            stmt = select(UsersTable).where(UsersTable.id == token_from_db.user_id)
            result = await session.execute(stmt)
            user = result.scalar_one_or_none()

            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Пользователь не найден!",
                )

            # Генерируем новые токены
            tokens = await self.generate_tokens(user.model_dump())

            # Сохраняем новый refresh-токен в базе данных
            await TokenRequest.save_token(
                user_id=token_from_db.user_id, refresh_token=tokens["refresh_token"]
            )

            return tokens
