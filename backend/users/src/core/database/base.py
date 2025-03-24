import uuid
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.ext.asyncio import AsyncAttrs, async_sessionmaker, create_async_engine
from sqlalchemy.dialects.postgresql import UUID
from src.core.config import get_settings

settings = get_settings()

engine = create_async_engine(url=settings.database_url, echo=False)
async_session = async_sessionmaker(bind=engine, expire_on_commit=True)


class Base(DeclarativeBase, AsyncAttrs):
    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False, primary_key=True, default=uuid.uuid4
    )
