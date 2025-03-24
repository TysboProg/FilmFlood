from uuid import uuid4
from aiokafka import AIOKafkaProducer
from src.core.config import get_settings
from loguru import logger
import json

from src.core.kafka.producer.base import KafkaAbstractProducer

settings = get_settings()


class KafkaProducer(KafkaAbstractProducer):
    def __init__(self):
        self.producer = AIOKafkaProducer(
            bootstrap_servers=f"{settings.kafka.bootstrap_servers}",
            security_protocol="PLAINTEXT",
        )
        self._is_started = False

    async def start(self):
        """Запуск продюсера"""
        if not self._is_started:
            try:
                await self.producer.start()
                self._is_started = True
                logger.info("Kafka producer started.")
            except Exception as e:
                logger.error(f"Ошибка подключения к Kafka: {e}")
                raise

    async def stop(self):
        """Остановка продюсера"""
        if self._is_started:
            try:
                await self.producer.stop()
                self._is_started = False
                logger.info("Kafka producer stopped.")
            except Exception as e:
                logger.error(f"Ошибка при остановке продюсера: {e}")
                raise

    async def send_json(self, topic: str, value):
        """Отправка JSON-сообщения в Kafka"""
        if not self._is_started:
            await self.start()
        try:
            value_bytes = json.dumps(value).encode("utf-8")
            key = str(uuid4()).encode("utf-8")
            await self.producer.send_and_wait(topic, value=value_bytes, key=key)
            logger.info(f"Сообщение отправлено в топик {topic}: {value}")
        except Exception as e:
            logger.error(f"Ошибка при отправке сообщения: {e}")
            raise
