from src.core.database.base import Base
from sqlalchemy import String, DateTime, Float
from sqlalchemy.orm import Mapped, mapped_column
from pydantic import EmailStr
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime

class PaymentsTable(Base):
    __tablename__ = 'payments'

    user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    order_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    number_order: Mapped[str] = mapped_column(String, nullable=False)
    order_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    email: Mapped[EmailStr] = mapped_column(String, nullable=False)