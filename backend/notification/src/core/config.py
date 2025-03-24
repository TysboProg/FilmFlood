import os
from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent.parent
ENV_FILE = BASE_DIR / "docker" / ".env"
load_dotenv(ENV_FILE)

class EmailConfig(BaseSettings):
    MAIL_USERNAME: str = Field(..., alias='MAIL_USERNAME')
    MAIL_PASSWORD: str = Field(..., alias='MAIL_PASSWORD')
    MAIL_FROM: str = Field(..., alias='MAIL_USERNAME')
    MAIL_PORT: int = Field(..., alias='MAIL_PORT')
    MAIL_SERVER: str = Field(..., alias='MAIL_SERVER')

    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        extra='allow',
        env_prefix='MAIL_'
    )

class KafkaConfig(BaseSettings):
    bootstrap_servers: str = Field(..., alias='KAFKA_BOOTSTRAP_SERVERS')

    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        extra='allow',
        env_prefix='KAFKA_'
    )

class Settings(BaseSettings):
    database_url: str = Field(..., alias='NOTIFICATION_DATABASE_URL')
    email: EmailConfig = Field(default_factory=EmailConfig)
    kafka: KafkaConfig = Field(default_factory=KafkaConfig)

    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        extra='allow'
    )

@lru_cache
def get_settings():
    return Settings()