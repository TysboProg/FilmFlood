from aiobotocore.session import get_session
from botocore.exceptions import NoCredentialsError
from src.core.config import get_settings
from loguru import logger
from src.repositories.s3.base import S3Abstract

settings = get_settings()

class S3Repository(S3Abstract):
    def __init__(self):
        self.bucket_name = settings.s3_conf.bucket_name
        self.region_name = settings.s3_conf.region_name
        self.AWS_SECRET_ACCESS_KEY = settings.s3_conf.AWS_SECRET_ACCESS_KEY
        self.AWS_ACCESS_KEY_ID = settings.s3_conf.AWS_ACCESS_KEY_ID
        self.endpoint_url = settings.s3_conf.endpoint_url
        self.session = get_session()

    async def upload_to_s3(self, file_bytes: bytes, s3_path: str):
        """
        Загружает файл в S3 в виде байтов.
        """
        try:
            async with self.session.create_client(
                    's3',
                    region_name=self.region_name,
                    endpoint_url=self.endpoint_url,
                    aws_secret_access_key=self.AWS_SECRET_ACCESS_KEY,
                    aws_access_key_id=self.AWS_ACCESS_KEY_ID,
                    verify=False
            ) as client:
                await client.put_object(
                    Bucket=self.bucket_name,
                    Key=s3_path,
                    Body=file_bytes,
                    ContentType='application/pdf',  # Указываем тип содержимого
                )
                print(f"Файл успешно загружен в {s3_path}")
        except NoCredentialsError:
            print("Ошибка: не удалось найти учетные данные AWS.")
        except Exception as e:
            print(f"Ошибка при загрузке файла: {e}")

    async def generate_presigned_url(self, file_name: str) -> str:
        """
        Генерирует presigned URL для файла в S3.
        """
        s3_session = get_session()

        try:
            async with s3_session.create_client(
                    's3',
                    region_name=self.region_name,
                    endpoint_url=self.endpoint_url,
                    aws_secret_access_key=self.AWS_SECRET_ACCESS_KEY,
                    aws_access_key_id=self.AWS_ACCESS_KEY_ID,
                    verify=False
            ) as client:
                url = await client.generate_presigned_url(
                    ClientMethod="get_object",
                    Params={"Bucket": self.bucket_name, "Key": file_name},
                    ExpiresIn=36000
                )
                return url
        except Exception as e:
            logger.error(f"Ошибка при генерации URL для файла {file_name}: {e}")
            raise
