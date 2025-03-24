from typing import Optional
from uuid import UUID
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from pydantic import EmailStr
from src.core.database.base import async_session
from src.core.database.models import UsersTable, TokensTable
from src.repositories.auth.base import AuthAbstract


class AuthRepository(AuthAbstract):
    async def get_user_by_email(self, email: EmailStr):
        async with async_session() as session:
            stmt = select(UsersTable).where(UsersTable.email == email)
            result = await session.execute(stmt)
            user = result.scalar_one_or_none()
            return user

    async def get_user_by_id(self, user_id: UUID):
        async with async_session() as session:
            try:
                stmt = (
                    select(UsersTable)
                    .where(UsersTable.id == user_id)
                    .options(selectinload(UsersTable.token))  # Загружаем связанные токены
                )
                result = await session.execute(stmt)
                user = result.scalar_one_or_none()
                if not user:
                    raise HTTPException(status_code=404, detail="Пользователь не найден")
                return user
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"Ошибка при получении пользователя: {str(e)}",
                )

    async def get_user_by_username_and_email(self, username: str, email: EmailStr):
        async with async_session() as session:
            stmt = select(UsersTable).where(
                UsersTable.username == username, UsersTable.email == email
            )
            result = await session.execute(stmt)
            user = result.scalar_one_or_none()
            return user

    async def create_user(
        self, username: str, email: EmailStr, hashed_password: str
    ) -> UUID:
        async with async_session() as session:
            try:
                new_user = UsersTable(
                    username=username,
                    email=email,
                    password=hashed_password,
                )
                session.add(new_user)
                await session.commit()
                await session.refresh(new_user)
                return new_user.id
            except IntegrityError:
                await session.rollback()
                raise ValueError(
                    "Пользователь с таким username или email уже существует"
                )
            except Exception as e:
                await session.rollback()
                raise e

    async def update_user_tokens(self, user_id: UUID, token_id: Optional[UUID]):
        async with async_session() as session:
            stmt = select(UsersTable).where(UsersTable.id == user_id)
            result = await session.execute(stmt)
            user = result.scalar_one_or_none()
            if not user:
                raise ValueError(f"Пользователь с ID {user_id} не найден")

            user.token_id = token_id
            await session.commit()
            await session.refresh(user)

    async def save_refresh_token(self, user_id: UUID, refresh_token: str):
        async with async_session() as session:
            try:
                # Проверяем, есть ли уже токен у пользователя
                stmt = select(TokensTable).where(TokensTable.user_id == user_id)
                result = await session.execute(stmt)
                existing_token = result.scalar_one_or_none()

                if existing_token:
                    existing_token.refresh_token = refresh_token
                    token_id = existing_token.id
                else:
                    new_token = TokensTable(
                        user_id=user_id, refresh_token=refresh_token
                    )
                    session.add(new_token)
                    await session.commit()
                    await session.refresh(new_token)
                    token_id = new_token.id

                # Обновляем поле token_id в User
                stmt = select(UsersTable).where(UsersTable.id == user_id)
                result = await session.execute(stmt)
                user = result.scalar_one_or_none()
                if user:
                    user.token_id = token_id
                    await session.commit()
                    await session.refresh(user)

                return token_id
            except SQLAlchemyError as e:
                await session.rollback()
                raise SQLAlchemyError(f"Ошибка при добавлении токена: {e}")

    async def delete_refresh_token(self, refresh_token: str):
        async with async_session() as session:
            try:
                stmt = select(TokensTable).where(TokensTable.refresh_token == refresh_token)
                result = await session.execute(stmt)
                token_to_delete = result.scalar_one_or_none()

                if token_to_delete:
                    user_id = token_to_delete.user_id
                    await session.delete(token_to_delete)
                    await session.commit()
                    return user_id  # Вернуть только user_id, а не словарь

                return None
            except SQLAlchemyError as e:
                await session.rollback()
                raise SQLAlchemyError(f"Ошибка при удалении токена: {e}")