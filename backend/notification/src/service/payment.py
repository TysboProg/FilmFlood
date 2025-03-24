from contextlib import asynccontextmanager
from fastapi_mail import MessageSchema, MessageType
from fastapi.templating import Jinja2Templates
from jinja2 import TemplateNotFound
from loguru import logger
from src.core.email.base import EmailSender
from src.core.kafka.consumer.consumer import KafkaConsumer

templates = Jinja2Templates(directory="templates")
email_sender = EmailSender()

@asynccontextmanager
async def kafka_consumer():
    consumer = KafkaConsumer(topic="payment")
    try:
        await consumer.start()
        yield consumer
    finally:
        await consumer.stop()

class PaymentService:
    @staticmethod
    async def send_to_email():
        async with kafka_consumer() as consumer:
            messages = await consumer.get_messages()

            if not messages:
                logger.warning("Нет сообщений для отправки.")
                return {"message": "Нет сообщений для отправки"}

            # Берем первый элемент списка
            message_data = messages[0] if isinstance(messages, list) and messages else {}

            # Логируем полученные данные для отладки
            logger.info(f"Получены данные из Kafka: {message_data}")

            # Проверяем, что данные корректные
            required_keys = ["number_order", "amount", "order_date"]
            if not all(key in message_data for key in required_keys):
                logger.error(f"Некорректные данные для шаблона: {message_data}")
                return {"message": "Ошибка: некорректные данные для шаблона"}

            # Проверяем наличие email
            email = message_data.get("email")
            if not email:
                logger.error("Отсутствует email в данных.")
                return {"message": "Ошибка: отсутствует email в данных"}

            # Рендеринг HTML-шаблона
            try:
                template = templates.get_template("payment-receipt.html")
                context = {
                    "order_number": message_data["number_order"],
                    "amountValue": message_data["amount"],
                    "paymentDate": message_data["order_date"],
                }
                html_content = template.render(context)
            except TemplateNotFound:
                logger.error("Шаблон payment-receipt.html не найден!")
                return {"message": "Ошибка: шаблон не найден"}

            if not html_content:
                logger.error("Шаблон не был корректно сформирован.")
                return {"message": "Ошибка: шаблон не был сформирован"}

            # Создаем сообщение
            message = MessageSchema(
                subject="Your Payment Receipt",
                recipients=[email],
                body=html_content,
                subtype=MessageType.html
            )

            try:
                await email_sender.mailer.send_message(message)
                logger.info(f"Письмо успешно отправлено на {email}")
            except Exception as exc:
                logger.error(f"Ошибка при отправке письма: {exc}")
                raise

            return {"message": "Сообщение успешно отправлено на почту с оплатой подписки"}