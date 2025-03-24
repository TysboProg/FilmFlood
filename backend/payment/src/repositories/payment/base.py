from abc import ABC, abstractmethod
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import EmailStr
from uuid import UUID
from datetime import datetime

class PaymentAbstract(ABC):
    @abstractmethod
    async def add_payment(self, session: AsyncSession, user_id: UUID, order_date: datetime, email: EmailStr, number_order: str, amount: float, order_id: UUID): ...

    @abstractmethod
    async def get_payments(self, session: AsyncSession, user_id: UUID): ...