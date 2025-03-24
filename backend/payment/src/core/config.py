import os
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))

class S3Config(BaseSettings):
    bucket_name: str = Field(..., alias='S3_BUCKET_NAME')
    region_name: str = Field(..., alias='S3_REGION_NAME')
    AWS_SECRET_ACCESS_KEY: str = Field(..., alias='S3_AWS_SECRET_ACCESS_KEY')
    AWS_ACCESS_KEY_ID: str = Field(..., alias='S3_AWS_ACCESS_KEY_ID')
    endpoint_url: str = Field(..., alias='S3_ENDPOINT_URL')

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(__file__), '../../.env'),
        extra='allow',
        env_prefix='S3_'
    )

class KafkaConfig(BaseSettings):
    bootstrap_servers: str = Field(..., alias='KAFKA_BOOTSTRAP_SERVERS')

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(__file__), '../../.env'),
        extra='allow',
        env_prefix='KAFKA_'
    )

class YookassaConfig(BaseSettings):
    account_id: str = Field(..., alias='YOOKASSA_ACCOUNT_ID')
    secret_key: str = Field(..., alias='YOOKASSA_SECRET_KEY')

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(__file__), '../../.env'),
        extra='allow',
        env_prefix='YOOKASSA_'
    )

class Settings(BaseSettings):
    database_url: str = Field(..., alias='PAYMENT_DATABASE_URL')
    redis_url: str = Field(..., alias='REDIS_URL')
    yookassa: YookassaConfig = Field(default_factory=YookassaConfig)
    kafka: KafkaConfig = Field(default_factory=KafkaConfig)
    s3_conf: S3Config = Field(default_factory=S3Config)

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(__file__), '../../.env'),
        extra='allow'
    )

@lru_cache
def get_settings():
    return Settings()