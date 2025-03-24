from contextlib import asynccontextmanager
from uuid import UUID, uuid4
from random import randint
from loguru import logger
from yookassa import Payment, Configuration
from fastapi import HTTPException, status
from pydantic import EmailStr
from src.core.config import get_settings
from src.core.database.base import async_session
from src.core.kafka.producer.producer import KafkaProducer
from src.core.redis.base import RedisService
from src.repositories.s3.s3 import S3Repository
from src.utils.html_to_pdf import html_to_pdf_reportlab
from src.repositories.payment.payment import PaymentRepository

settings = get_settings()
Configuration.account_id = settings.yookassa.account_id
Configuration.secret_key = settings.yookassa.secret_key

s3_repository = S3Repository()
payment_repository = PaymentRepository()

@asynccontextmanager
async def kafka_producer():
    """Контекстный менеджер для работы с Kafka."""
    producer = KafkaProducer()
    try:
        await producer.start()
        yield producer
    finally:
        await producer.stop()

class PaymentService:
    @staticmethod
    async def create_payment(amount_value: float, redirect_url: str):
        """Создает платеж в YooKassa."""
        idempotence_key = uuid4()
        order_number = f"{randint(0, 100000):05d}"

        payment_data = {
            "amount": {
                "value": amount_value,
                "currency": "RUB"
            },
            "payment_method_data": {
                "type": "bank_card"
            },
            "confirmation": {
                "type": "redirect",
                "return_url": redirect_url
            },
            "description": f"Заказ №{order_number}",
            "capture": True
        }

        try:
            payment = Payment.create(payment_data, idempotence_key)
            return payment
        except Exception as e:
            logger.error(f"Ошибка при создании платежа: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Ошибка при создании платежа"
            )

    @staticmethod
    async def process_payment(user_id: UUID, email: EmailStr, payment, redis: RedisService):
        """Сохраняет платежные данные в Redis и возвращает URL для подтверждения платежа."""
        if payment.status == "pending":
            payment_data = {
                "number_order": payment.description,
                "order_date": payment.created_at,
                "order_id": payment.id,
                "user_id": str(user_id),
                "email": email,
                "amount": float(payment.amount.value)
            }
            await redis.set(key=str(user_id), value=payment_data)
            return {"confirmation_url": payment.confirmation.confirmation_url}
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Неожиданный статус платежа: {payment.status}"
            )

    @staticmethod
    async def success_payment(user_id: UUID, redis: RedisService):
        """Обрабатывает успешный платеж: сохраняет данные в БД, загружает чек в S3 и отправляет сообщение в Kafka."""
        async with kafka_producer() as producer:
            try:
                payment_data = await redis.get(key=str(user_id))
                if not payment_data:
                    logger.warning(f"Не найдены платежные данные в кэше с user_id: {user_id}")
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Платежные данные не найдены в кэше"
                    )

                async with async_session() as session:
                    await payment_repository.add_payment(
                        session,
                        user_id=user_id,
                        order_date=payment_data["order_date"],
                        number_order=payment_data["number_order"],
                        amount=payment_data["amount"],
                        order_id=payment_data["order_id"],
                        email=payment_data["email"],
                    )

                pdf_path = html_to_pdf_reportlab(
                    order_number=payment_data["number_order"],
                    amount_value=payment_data["amount"],
                    payment_date=payment_data["order_date"],
                )
                await s3_repository.upload_to_s3(file_bytes=pdf_path, s3_path=f"receipts/{payment_data['number_order']}.pdf")
                await redis.delete(key=str(user_id))
                await producer.send_json(topic="payment", value={"data": payment_data})
                logger.info(f"Платежные данные пользователя с user_id {user_id} успешно обработаны и удалены из кэша")
                return {"message": "Оплата успешно завершена"}

            except Exception as e:
                logger.error(f"Ошибка при обработке платежа: {e}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Ошибка при обработке платежа"
                )

    @staticmethod
    async def get_payments(user_id: UUID):
        """Получает платежи пользователя и генерирует ссылки на чеки."""
        async with async_session() as session:
            payments = await payment_repository.get_payments(session, user_id)

        receipts = []
        for payment in payments:
            file_name = f"receipts/{payment.number_order}.pdf"

            try:
                url = await s3_repository.generate_presigned_url(file_name)
                receipts.append({
                    "id": payment.id,
                    "order_id": payment.order_id,
                    "number_order": payment.number_order,
                    "receipt_url": url,
                    "order_date": payment.order_date,
                    "amount": payment.amount
                })
            except Exception as e:
                logger.error(f"Ошибка при генерации URL для чека {file_name}: {e}")

        return receipts