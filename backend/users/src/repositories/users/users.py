from uuid import UUID
from fastapi import HTTPException
from sqlalchemy.future import select
from src.core.database.models import UsersTable
from src.core.database.base import async_session
from src.repositories.users.base import UsersAbstract
from src.core.kafka.producer.producer import KafkaProducer

class UserRepository(UsersAbstract):
    async def get_user_by_id(self, user_id: UUID):  # Принимаем UUID
        async with async_session() as session:
            try:
                # Преобразуем UUID в строку для запроса, если это необходимо
                stmt = select(UsersTable).where(UsersTable.id == user_id)
                result = await session.execute(stmt)
                user = result.scalar_one_or_none()

                if not user:
                    raise HTTPException(
                        status_code=404, detail="Пользователь не найден"
                    )

                return user
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"Ошибка при получении пользователя: {str(e)}",
                )
