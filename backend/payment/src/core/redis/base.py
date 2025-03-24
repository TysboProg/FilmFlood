import asyncio
from redis.asyncio import Redis
from redis.exceptions import RedisError, ConnectionError as RedisConnectionError
from src.core.config import get_settings
import json
from typing import Optional
import logging

settings = get_settings()
logger = logging.getLogger(__name__)

class RedisService:
    def __init__(self):
        self.redis: Optional[Redis] = None
        self._connection_lock = asyncio.Lock()

    async def _ensure_connection(self):
        """Обеспечивает активное соединение с Redis."""
        async with self._connection_lock:
            if self.redis is not None:
                try:
                    await self.redis.ping()
                    return
                except (RedisConnectionError, RedisError):
                    logger.warning("Redis connection lost. Reconnecting...")
                    await self.close()

            if not await self.connect():
                raise RedisConnectionError("Failed to establish Redis connection")

    async def connect(self) -> bool:
        """Внутренний метод для установки соединения."""
        try:
            self.redis = await Redis.from_url(
                settings.redis_url,
                encoding="utf-8",
                decode_responses=False,
                socket_connect_timeout=5,
                socket_keepalive=True
            )
            await self.redis.ping()
            logger.info("Successfully connected to Redis")
            return True
        except Exception as e:
            logger.error(f"Redis connection error: {str(e)}")
            self.redis = None
            return False

    async def close(self):
        """Корректно закрывает соединение с Redis."""
        if self.redis:
            try:
                await self.redis.aclose()
                logger.info("Redis connection closed")
            except Exception as e:
                logger.error(f"Error closing Redis connection: {str(e)}")
            finally:
                self.redis = None

    async def set(self, key: str, value: dict, ex: int = 3600) -> bool:
        """Сохраняет данные в Redis в формате JSON."""
        try:
            await self._ensure_connection()
            serialized = json.dumps(value).encode("utf-8")
            return await self.redis.set(key, serialized, ex=ex)
        except (RedisError, json.JSONDecodeError) as e:
            logger.error(f"Failed to set key {key}: {str(e)}")
            raise

    async def get(self, key: str) -> Optional[dict]:
        """Получает и десериализует данные из Redis."""
        try:
            await self._ensure_connection()
            data = await self.redis.get(key)
            return json.loads(data.decode("utf-8")) if data else None
        except (RedisError, json.JSONDecodeError) as e:
            logger.error(f"Failed to get key {key}: {str(e)}")
            raise

    async def delete(self, key: str) -> bool:
        """Удаляет ключ из Redis."""
        try:
            await self._ensure_connection()
            return (await self.redis.delete(key)) > 0
        except RedisError as e:
            logger.error(f"Failed to delete key {key}: {str(e)}")
            raise

    async def __aenter__(self):
        await self._ensure_connection()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()