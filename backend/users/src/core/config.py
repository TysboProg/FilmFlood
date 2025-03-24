from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, FilePath, BaseModel
from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent.parent


class S3Config(BaseSettings):
    bucket_name: str = Field(..., alias="S3_BUCKET_NAME")
    region_name: str = Field(..., alias="S3_REGION_NAME")
    AWS_SECRET_ACCESS_KEY: str = Field(..., alias="S3_AWS_SECRET_ACCESS_KEY")
    AWS_ACCESS_KEY_ID: str = Field(..., alias="S3_AWS_ACCESS_KEY_ID")
    endpoint_url: str = Field(..., alias="S3_ENDPOINT_URL")

    model_config = SettingsConfigDict(
        extra="allow",
        env_prefix="S3_",
    )


class JWTKeysSettings(BaseModel):
    private_key_path: FilePath = Field(
        default=BASE_DIR / "src/core/jwt_key/private.key",
        description="Путь к приватному ключу",
    )
    public_key_path: FilePath = Field(
        default=BASE_DIR / "src/core/jwt_key/public.key",
        description="Путь к публичному ключу",
    )

    def get_private_key(self) -> str:
        if not self.private_key_path.exists():
            raise FileNotFoundError(
                f"Приватный ключ формата .key не был получен: {self.private_key_path}"
            )
        return self.private_key_path.read_text(encoding="utf-8").strip()

    def get_public_key(self) -> str:
        if not self.public_key_path.exists():
            raise FileNotFoundError(
                f"Публичный ключ формата .key не был получен: {self.public_key_path}"
            )
        return self.public_key_path.read_text(encoding="utf-8").strip()


class KafkaConfig(BaseSettings):
    bootstrap_servers: str = Field(..., alias="KAFKA_BOOTSTRAP_SERVERS")

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(__file__), "../../.env"),
        extra="allow",
        env_prefix="KAFKA_",
    )


class Settings(BaseSettings):
    database_url: str = Field(..., alias="USERS_DATABASE_URL")
    jwt_keys: JWTKeysSettings = Field(default_factory=JWTKeysSettings)
    kafka: KafkaConfig = Field(default_factory=KafkaConfig)
    s3_conf: S3Config = Field(default_factory=S3Config)

    model_config = SettingsConfigDict(
        extra="allow"
    )


@lru_cache
def get_settings():
    return Settings()
