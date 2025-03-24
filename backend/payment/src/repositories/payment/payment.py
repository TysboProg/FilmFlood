from datetime import datetime
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import EmailStr
from src.core.database.models import PaymentsTable
from src.core.schemas import PaymentModel
from src.repositories.payment.base import PaymentAbstract

class PaymentRepository(PaymentAbstract):
    async def add_payment(self, session: AsyncSession, user_id: UUID, order_date: datetime, email: EmailStr, number_order: str, amount: float, order_id: UUID):
        """Создает запись о платеже в базе данных."""
        if isinstance(order_date, str):
            order_date = datetime.fromisoformat(order_date)

        if order_date.tzinfo is not None:
            order_date = order_date.replace(tzinfo=None)

        order_schema = PaymentModel(
            order_date=order_date,
            user_id=user_id,
            amount=amount,
            order_id=order_id,
            number_order=number_order,
            email=email
        )

        order = PaymentsTable(
            user_id=order_schema.user_id,
            order_date=order_schema.order_date,
            number_order=order_schema.number_order,
            amount=order_schema.amount,
            order_id=order_schema.order_id,
            email=order_schema.email
        )

        session.add(order)
        await session.commit()
        await session.refresh(order)

        return order

    async def get_payments(self, session: AsyncSession, user_id: UUID):
        """Получает все платежи пользователя."""
        result = await session.execute(select(PaymentsTable).where(PaymentsTable.user_id == user_id))
        return result.scalars().all()
