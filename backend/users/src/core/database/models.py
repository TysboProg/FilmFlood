from src.core.database.base import Base
from sqlalchemy import String, DateTime, ForeignKey
from sqlalchemy.orm import relationship, mapped_column, Mapped
from sqlalchemy.dialects.postgresql import UUID as PSUUID
from pydantic import EmailStr
from uuid import UUID
from datetime import datetime
from sqlalchemy.sql import func


class UsersTable(Base):
    __tablename__ = "users"

    email: Mapped[EmailStr] = mapped_column(String, unique=True, nullable=False)
    username: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), onupdate=func.now(), nullable=False
    )

    token = relationship("TokensTable", back_populates="user")


class TokensTable(Base):
    __tablename__ = "tokens"

    refresh_token: Mapped[str] = mapped_column(String, nullable=False)
    user_id: Mapped[UUID] = mapped_column(
        PSUUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )

    user = relationship("UsersTable", back_populates="token")
