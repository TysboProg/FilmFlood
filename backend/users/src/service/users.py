from contextlib import asynccontextmanager
from uuid import UUID
from fastapi import HTTPException, status

from src.core.kafka.producer.producer import KafkaProducer
from src.repositories.users.users import UserRepository
from src.repositories.s3.s3 import S3Repository
from src.core.schemas import UserBaseModel, UserResponse

s3_repository = S3Repository()
user_repository = UserRepository()

@asynccontextmanager
async def kafka_producer():
    producer = KafkaProducer()
    try:
        await producer.start()
        yield producer
    finally:
        await producer.stop()

class UserService:
    @staticmethod
    async def get_user_profile(user_id: UUID):
        """
        Получает профиль пользователя по его ID.
        """
        # Преобразуем UUID в строку
        user_id_str = str(user_id)
        user = await user_repository.get_user_by_id(user_id=user_id)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Такого пользователя не существует в базе данных",
            )

        # Передаем строку UUID в метод get_profile_image
        user_image = await s3_repository.get_profile_image(user_id=user_id_str)

        return UserBaseModel(
            username=user.username,
            email=user.email,
            created_at=user.created_at,
            updated_at=user.updated_at,
            userImage=user_image if user_image else None,
        )

    @staticmethod
    async def create_comment(user_id: UUID):
        async with kafka_producer() as producer:
            user = await user_repository.get_user_by_id(user_id=user_id)

            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Такого пользователя не существует в базе данных",
                )

            kafka_message = {
                "username": user.username,
            }
            await producer.send_json(topic="comment", value=kafka_message)
            return UserResponse(message="Комментарии отправляется...")

