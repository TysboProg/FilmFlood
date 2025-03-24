from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from src.core.redis.base import RedisService
from pydantic import EmailStr
from src.service.payment import PaymentService
from loguru import logger

router = APIRouter(tags=["Payment"], prefix="/payments")

async def get_redis():
    redis_service = RedisService()
    await redis_service.connect()
    try:
        yield redis_service
    finally:
        await redis_service.close()

@router.get('/success-payment', status_code=status.HTTP_200_OK)
async def success_payment(user_id: UUID, redis: RedisService = Depends(get_redis)):
    """
    Эндопоинт обработки успешного платежа.
    """
    try:
        payment = await PaymentService.success_payment(user_id=user_id, redis=redis)
        return payment
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Неизвестная ошибка: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Внутренняя ошибка сервера"
        )

@router.post('/payment', status_code=status.HTTP_201_CREATED)
async def create_payment(user_id: UUID, email: EmailStr, amount_value: float, redirect_url: str, redis: RedisService = Depends(get_redis)):
    """
    Эндпоинт для создания платежа в YooKassa.
    """
    try:
        payment_data = await PaymentService.create_payment(
            amount_value=amount_value,
            redirect_url=redirect_url,
        )

        payment = await PaymentService.process_payment(user_id=user_id, email=email, payment=payment_data, redis=redis)
        return payment
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Неизвестная ошибка: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Внутренняя ошибка сервера"
        )

@router.get('/get-payments', status_code=status.HTTP_200_OK)
async def get_payment(user_id: UUID):
    """
    Эндпоинт для получения всех платежей пользователя
    """
    try:
        payments = await PaymentService.get_payments(user_id=user_id)
        return payments
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Неизвестная ошибка: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Внутренняя ошибка сервера'
        )