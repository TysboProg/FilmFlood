from src.core.config import get_settings
from fastapi_mail import ConnectionConfig, FastMail

settings = get_settings()

class EmailSender:
    def __init__(self):
        self.conf = ConnectionConfig(
            MAIL_USERNAME=settings.email.MAIL_USERNAME,
            MAIL_PASSWORD=settings.email.MAIL_PASSWORD,
            MAIL_FROM=settings.email.MAIL_FROM,
            MAIL_PORT=settings.email.MAIL_PORT,
            MAIL_SERVER=settings.email.MAIL_SERVER,
            MAIL_STARTTLS=True,
            MAIL_SSL_TLS=False,
            USE_CREDENTIALS=True
        )
        self.mailer = FastMail(self.conf)
