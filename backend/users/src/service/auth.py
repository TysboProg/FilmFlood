from contextlib import asynccontextmanager
from uuid import UUID

from fastapi import HTTPException, status
from pydantic import EmailStr
from src.core.database.requests import AuthRequest
from src.core.schemas import validate_user_data
from src.core.kafka.producer.producer import KafkaProducer
from src.service.tokens import TokenService
from src.repositories.auth.auth import AuthRepository

auth_repository = AuthRepository()


@asynccontextmanager
async def kafka_producer():
    producer = KafkaProducer()
    try:
        await producer.start()
        yield producer
    finally:
        await producer.stop()


class AuthService:
    @staticmethod
    async def register_user(username: str, email: EmailStr, password: str):
        async with kafka_producer() as producer:
            try:
                validated_user = validate_user_data(
                    username=username, email=email, password=password
                )
            except ValueError as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
                )

            existing_user = await auth_repository.get_user_by_email(email)
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Пользователь с почтой {email} уже существует!",
                )

            hashed_password = await AuthRequest.hash_password(password)

            tokens = await TokenService.generate_tokens(
                payload={
                    "username": validated_user.username,
                    "email": validated_user.email,
                }
            )

            refresh_token = tokens.get("refresh_token")
            if not refresh_token:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Не удалось создать refresh_token",
                )

            try:
                user_id = await auth_repository.create_user(
                    validated_user.username,
                    validated_user.email,
                    hashed_password,
                )
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Ошибка при создании пользователя: {e}",
                )

            try:
                token_id = await auth_repository.save_refresh_token(
                    user_id=str(user_id), refresh_token=refresh_token
                )
                await auth_repository.update_user_tokens(
                    user_id=str(user_id), token_id=token_id
                )

                kafka_message = {
                    "username": validated_user.username,
                    "email": validated_user.email,
                }
                await producer.send_json(topic="auth", value=kafka_message)

                user_data = {
                    "userId": user_id,
                    "message": "Пользователь успешно зарегистрировался!",
                    "access_token": tokens.get("access_token"),
                    "refresh_token": refresh_token,
                }
                return user_data
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Ошибка при сохранении токена: {e}",
                )

    @staticmethod
    async def auth_user(username: str, email: EmailStr, password: str):
        try:
            validate_user_data(username=username, email=email, password=password)
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

        user = await auth_repository.get_user_by_username_and_email(username, email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Пользователь с таким email не найден!",
            )

        if not await AuthRequest.verify_password(password, user.password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Неверный пароль!"
            )

        tokens = await TokenService.generate_tokens(
            payload={
                "user_id": str(user.id),
                "username": user.username,
                "email": user.email,
            }
        )

        refresh_token = tokens.get("refresh_token")
        if not refresh_token:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Не удалось создать refresh_token",
            )

        try:
            token_id = await auth_repository.save_refresh_token(user.id, refresh_token)
            await auth_repository.update_user_tokens(user.id, token_id)

            user_data = {
                "userId": user.id,
                "message": "Пользователь успешно авторизовался!",
                "accessToken": tokens.get("access_token"),
                "refresh_token": tokens.get("refresh_token"),
            }
            return user_data
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Ошибка при сохранении токена: {e}",
            )

    @staticmethod
    async def logout_user(refresh_token: str):
        try:
            user_id = await auth_repository.delete_refresh_token(refresh_token)
            if not user_id:
                raise HTTPException(status_code=404, detail="Токен не найден")

            user = await auth_repository.get_user_by_id(user_id)
            if not user:
                raise HTTPException(status_code=404, detail="Пользователь не найден")

            if user.token and user.token.id == refresh_token:
                user.token = None
                await auth_repository.update_user_tokens(user.id, None)

            return {"message": "Выход выполнен успешно"}

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Ошибка: {str(e)}",
            )
