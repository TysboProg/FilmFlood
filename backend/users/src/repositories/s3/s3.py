from uuid import UUID
from loguru import logger
from aiobotocore.session import get_session
from botocore.exceptions import NoCredentialsError
from src.core.config import get_settings
from fastapi import HTTPException, status
import mimetypes

from src.repositories.s3.base import S3Abstract

settings = get_settings()


class S3Repository(S3Abstract):
    async def upload_to_s3(
        self, file_bytes: bytes, user_id: str, mime_type: str = None
    ):
        """
        Загружает файл в S3 в виде байтов.
        """
        user_ids = UUID(user_id)
        session = get_session()
        if mime_type:
            extension = mimetypes.guess_extension(mime_type)
        else:
            import magic

            mime_type = magic.from_buffer(file_bytes, mime=True)
            extension = mimetypes.guess_extension(mime_type)

        if not extension:
            logger.error("Не удалось определить расширение файла.")
            return None

        file_name = f"userimage/{user_ids}{extension}"

        try:
            async with session.create_client(
                "s3",
                region_name=settings.s3_conf.region_name,
                endpoint_url=settings.s3_conf.endpoint_url,
                aws_secret_access_key=settings.s3_conf.AWS_SECRET_ACCESS_KEY,
                aws_access_key_id=settings.s3_conf.AWS_ACCESS_KEY_ID,
                verify=False,
            ) as client:
                await client.put_object(
                    Bucket=settings.s3_conf.bucket_name,
                    Key=file_name,
                    Body=file_bytes,
                    ContentType=mime_type,
                )
                logger.info(f"Файл успешно загружен в {file_name}")
                return file_name
        except NoCredentialsError:
            logger.error("Ошибка: не удалось найти учетные данные AWS.")
        except Exception as e:
            logger.error(f"Ошибка при загрузке файла: {e}")
        return None

    async def get_profile_image(self, user_id: str):
        """
        Получает URL изображения профиля пользователя из S3.
        """
        user_ids = UUID(user_id)
        session = get_session()
        try:
            async with session.create_client(
                "s3",
                region_name=settings.s3_conf.region_name,
                endpoint_url=settings.s3_conf.endpoint_url,
                aws_secret_access_key=settings.s3_conf.AWS_SECRET_ACCESS_KEY,
                aws_access_key_id=settings.s3_conf.AWS_ACCESS_KEY_ID,
                verify=False,
            ) as client:
                # Ищем файл с любым расширением
                response = await client.list_objects_v2(
                    Bucket=settings.s3_conf.bucket_name,
                    Prefix=f"userimage/{user_ids}.",
                )
                if "Contents" not in response or len(response["Contents"]) == 0:
                    logger.info(
                        f"Аватарка для пользователя с user_id {user_ids} не найдена!"
                    )
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Аватарка для пользователя с таким user_id не найдена!",
                    )

                file_key = response["Contents"][0]["Key"]

                url = await client.generate_presigned_url(
                    ClientMethod="get_object",
                    Params={
                        "Bucket": settings.s3_conf.bucket_name,
                        "Key": file_key,
                    },
                    ExpiresIn=36000,  # Срок действия ссылки (в секундах)
                )
                return url
        except Exception as e:
            logger.error(
                f"Ошибка при генерации URL для пользователя с user_id {user_id}: {e}"
            )
            return None
