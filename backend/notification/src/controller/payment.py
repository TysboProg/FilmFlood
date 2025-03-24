from fastapi import APIRouter
from loguru import logger
from src.service.payment import PaymentService

router = APIRouter(tags=["Payment"])

@router.get("/send-order-email")
async def send_email():
    try:
        email = await PaymentService.send_to_email()
        return email
    except Exception as e:
        logger.error(f"Ошибка при отправке email: {e}")
