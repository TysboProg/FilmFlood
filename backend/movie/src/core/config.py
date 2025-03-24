from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from dotenv import load_dotenv
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent.parent
ENV_FILE = BASE_DIR / "docker" / ".env"
if not load_dotenv(ENV_FILE):
    print(f"⚠️ Не удалось загрузить .env из {ENV_FILE}, проверьте путь!")

class KafkaConfig(BaseSettings):
    bootstrap_servers: str = Field(..., alias='KAFKA_BOOTSTRAP_SERVERS')

    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        extra='allow',
        env_prefix='KAFKA_'
    )

class S3Config(BaseSettings):
    bucket_name: str = Field(..., alias="S3_BUCKET_NAME")
    region_name: str = Field(..., alias="S3_REGION_NAME")
    AWS_SECRET_ACCESS_KEY: str = Field(..., alias="S3_AWS_SECRET_ACCESS_KEY")
    AWS_ACCESS_KEY_ID: str = Field(..., alias="S3_AWS_ACCESS_KEY_ID")
    endpoint_url: str = Field(..., alias="S3_ENDPOINT_URL")

    model_config = SettingsConfigDict(
        env_prefix="S3_", env_file=ENV_FILE, extra="allow"
    )


class Settings(BaseSettings):
    database_url: str = Field(..., alias="MOVIE_DATABASE_URL")
    redis_url: str = Field(..., alias="REDIS_URL")
    kafka: KafkaConfig = Field(default_factory=KafkaConfig)
    s3_conf: S3Config = Field(default_factory=S3Config)

    model_config = SettingsConfigDict(env_file=ENV_FILE, extra="allow")


@lru_cache
def get_settings():
    return Settings()
