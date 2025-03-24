import json
from aiokafka import AIOKafkaConsumer
from src.core.config import get_settings
from loguru import logger
from typing import Any, Dict, List
from src.core.kafka.consumer.base import KafkaAbstractConsumer

settings = get_settings()

class KafkaConsumer(KafkaAbstractConsumer):
    def __init__(self, topic: str):
        self.consumer = AIOKafkaConsumer(
            topic,
            bootstrap_servers=f"{settings.kafka.bootstrap_servers}",
            security_protocol="PLAINTEXT",
            group_id="notification",
            enable_auto_commit=True,
            auto_offset_reset="earliest",
        )
        self._is_started = False

    async def start(self):
        """Запуск потребителя"""
        if not self._is_started:
            await self.consumer.start()
            self._is_started = True

    async def stop(self):
        """Остановка потребителя"""
        if self._is_started:
            await self.consumer.stop()
            self._is_started = False

    async def get_messages(self, timeout_ms: int = 5000) -> list[Any] | List[Dict[str, Any]] | Dict[str, str]:
        """Получение сообщений с декодированием текста и возвратом в формате JSON"""
        messages = []
        try:
            records = await self.consumer.getmany(timeout_ms=timeout_ms, max_records=1)
            for tp, batch in records.items():
                for msg in batch:
                    decoded_msg = msg.value.decode("utf-8")
                    if not decoded_msg.strip():
                        logger.warning("Пустое сообщение.")
                        continue

                    try:
                        parsed_message = json.loads(decoded_msg)
                    except json.JSONDecodeError as e:
                        logger.error(f"Ошибка парсинга JSON: {e} для сообщения: {decoded_msg}")
                        continue

                    # Извлекаем данные из ключа "data"
                    if not all([parsed_message.get("username")]):
                        logger.error(f"Некорректные данные для шаблона: {parsed_message}")
                        return {
                            "message": "Ошибка: некорректные данные для рендеринга шаблона"
                        }

                    messages.append({
                        "username": parsed_message.get("username"),
                    })

            return messages
        except Exception as e:
            logger.error(f"Ошибка получения сообщений: {e}")
            return []