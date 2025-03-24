from uuid import UUID
import bcrypt
from sqlalchemy.future import select
from sqlalchemy import update, delete
from src.core.database.base import async_session
from src.core.database.models import TokensTable


class AuthRequest:
    @staticmethod
    async def hash_password(password: str) -> str:
        return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    @staticmethod
    async def verify_password(plain_password: str, hashed_password: str) -> bool:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"), hashed_password.encode("utf-8")
        )


class TokenRequest:
    @staticmethod
    async def save_token(user_id: str, refresh_token: str):
        # Поиск существующего токена
        async with async_session() as session:
            user_ids = UUID(user_id)
            stmt = select(TokensTable).where(TokensTable.user_id == user_ids)
            result = await session.execute(stmt)
            existing_token = result.scalar_one_or_none()

            if existing_token:
                # Обновление существующего токена
                stmt = (
                    update(TokensTable)
                    .where(TokensTable.user_id == user_id)
                    .values(refresh_token=refresh_token)
                )
                await session.execute(stmt)
            else:
                # Создание нового токена
                new_token = TokensTable(user_id=user_ids, refresh_token=refresh_token)
                session.add(new_token)

            await session.commit()

    @staticmethod
    async def remove_token(refresh_token: str):
        # Поиск токена для удаления
        async with async_session() as session:
            stmt = select(TokensTable).where(TokensTable.refresh_token == refresh_token)
            result = await session.execute(stmt)
            token_to_delete = result.scalar_one_or_none()

            if token_to_delete:
                # Удаление токена
                stmt = delete(TokensTable).where(
                    TokensTable.refresh_token == refresh_token
                )
                await session.execute(stmt)
                await session.commit()
                return True
            else:
                return False
