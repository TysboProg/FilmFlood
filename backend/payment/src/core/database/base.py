from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncAttrs
from sqlalchemy.orm import Mapped, DeclarativeBase, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from src.core.config import get_settings
from uuid import uuid4

settings = get_settings()

engine = create_async_engine(url=settings.database_url, echo=False)
async_session = async_sessionmaker(bind=engine, expire_on_commit=True)

class Base(DeclarativeBase, AsyncAttrs):
    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)