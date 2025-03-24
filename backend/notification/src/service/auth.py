from contextlib import asynccontextmanager
from fastapi_mail import MessageSchema, MessageType
from src.core.email.base import EmailSender
from jinja2 import Environment, FileSystemLoader, TemplateNotFound
from loguru import logger
from src.core.kafka.consumer.consumer import KafkaConsumer

env = Environment(loader=FileSystemLoader("templates"))
template = env.get_template("auth-success.html")
email_sender = EmailSender()

@asynccontextmanager
async def kafka_consumer():
    consumer = KafkaConsumer(topic="auth")
    try:
        await consumer.start()
        yield consumer
    finally:
        await consumer.stop()

class AuthService:
    @staticmethod
    async def send_to_email():
        async with kafka_consumer() as consumer:
            messages = await consumer.get_messages()

            if not messages:
                logger.warning("Нет сообщений для отправки.")
                return {"message": "Нет сообщений для отправки"}

            message_data = messages[0] if isinstance(messages, list) and messages else {}

            if not all(key in message_data for key in ["email, username"]):
                logger.error(f"Некорректные данные для шаблона: {message_data}")
                return {"message": "Ошибка: некорректные данные для шаблона"}

            try:
                context = {
                    "username": message_data["username"],
                    "email": message_data["email"],
                }
                html_content = template.render(context)
            except TemplateNotFound:
                logger.error("Шаблон auth-success.html не найден!")
                return {"message": "Ошибка: шаблон не найден"}

            if not html_content:
                logger.error("Шаблон не был корректно сформирован.")
                return {"message": "Ошибка: шаблон не был сформирован"}

            # Создаем сообщение
            message = MessageSchema(
                subject="Welcome to FilmFlood!",
                recipients=[message_data["email"]],
                body=html_content,
                subtype=MessageType.html
            )

            try:
                await email_sender.mailer.send_message(message)
                logger.info(f"Письмо успешно отправлено на {message_data["email"]}")
            except Exception as exc:
                logger.error(f"Ошибка при отправке письма: {exc}")
                raise

            return {"message": "Сообщение успешно отправлено на почту с авторизацией"}