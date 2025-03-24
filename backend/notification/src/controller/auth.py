from fastapi import APIRouter
from loguru import logger
from src.service.auth import AuthService

router = APIRouter(tags=["Auth"])

@router.get("/send-auth-email")
async def send_email():
    try:
        email = await AuthService.send_to_email()
        return email
    except Exception as e:
        logger.error(f"Ошибка при отправке email: {e}")
