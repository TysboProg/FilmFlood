from uuid import UUID
from fastapi import HTTPException, status
from loguru import logger
from aiobotocore.session import get_session
from src.core.config import get_settings
from src.repositories.s3.base import AbstractS3Repository

settings = get_settings()


class S3Repository(AbstractS3Repository):
    async def get_url_movie(self, film_name: str):
        """
        Получает URL ссылку на фильм из S3
        """
        session = get_session()
        results = []
        try:
            async with session.create_client(
                "s3",
                region_name=settings.s3_conf.region_name,
                endpoint_url=settings.s3_conf.endpoint_url,
                aws_secret_access_key=settings.s3_conf.AWS_SECRET_ACCESS_KEY,
                aws_access_key_id=settings.s3_conf.AWS_ACCESS_KEY_ID,
                verify=False,
            ) as client:
                response = await client.list_objects_v2(
                    Bucket=settings.s3_conf.bucket_name,
                    Prefix=f"films/{film_name}.mp4",
                )

                if "Contents" not in response or len(response["Contents"]) == 0:
                    logger.info(f"Видео с названием фильма {film_name} не найдена!")
                    results.append({"film_name": film_name, "url": None})
                    return results

                file_key = response["Contents"][0]["Key"]

                url = await client.generate_presigned_url(
                    ClientMethod="get_object",
                    Params={
                        "Bucket": settings.s3_conf.bucket_name,
                        "Key": file_key,
                    },
                    ExpiresIn=36000,  # Срок действия ссылки (в секундах)
                )
                results.append({"film_name": film_name, "movie_url": url})
                return results

        except Exception as e:
            logger.error(
                f"Ошибка при генерации URL для видео с film_name {film_name}: {e}"
            )
            return None

    async def get_url_serial(self, serial_name: str):
        """
        Получает URL ссылку на сериал из S3
        """
        session = get_session()
        results = []
        try:
            async with session.create_client(
                "s3",
                region_name=settings.s3_conf.region_name,
                endpoint_url=settings.s3_conf.endpoint_url,
                aws_secret_access_key=settings.s3_conf.AWS_SECRET_ACCESS_KEY,
                aws_access_key_id=settings.s3_conf.AWS_ACCESS_KEY_ID,
                verify=False,
            ) as client:
                response = await client.list_objects_v2(
                    Bucket=settings.s3_conf.bucket_name,
                    Prefix=f"serials/{serial_name}.mp4",
                )

                if "Contents" not in response or len(response["Contents"]) == 0:
                    logger.info(f"Видео с названием сериала {serial_name} не найдена!")
                    results.append({"serial_name": serial_name, "url": None})
                    return results

                file_key = response["Contents"][0]["Key"]

                url = await client.generate_presigned_url(
                    ClientMethod="get_object",
                    Params={
                        "Bucket": settings.s3_conf.bucket_name,
                        "Key": file_key,
                    },
                    ExpiresIn=36000,  # Срок действия ссылки (в секундах)
                )
                results.append({"serial_name": serial_name, "serial_url": url})
                return results

        except Exception as e:
            logger.error(
                f"Ошибка при генерации URL для сериала с serial_name {serial_name}: {e}"
            )
            return None

    async def get_poster_actor(self, actor_name: str):
        """
        Получает URL изображение актера из S3
        """
        session = get_session()
        results = []
        try:
            async with session.create_client(
                "s3",
                region_name=settings.s3_conf.region_name,
                endpoint_url=settings.s3_conf.endpoint_url,
                aws_secret_access_key=settings.s3_conf.AWS_SECRET_ACCESS_KEY,
                aws_access_key_id=settings.s3_conf.AWS_ACCESS_KEY_ID,
                verify=False,
            ) as client:
                response = await client.list_objects_v2(
                    Bucket=settings.s3_conf.bucket_name,
                    Prefix=f"poster/actors/{actor_name}.jpg",
                )
                if "Contents" not in response or len(response["Contents"]) == 0:
                    logger.info(f"Постер с именем актера {actor_name} не найдена!")
                    results.append({"actor_name": actor_name, "poster_url": None})
                    return results

                file_key = response["Contents"][0]["Key"]

                url = await client.generate_presigned_url(
                    ClientMethod="get_object",
                    Params={
                        "Bucket": settings.s3_conf.bucket_name,
                        "Key": file_key,
                    },
                    ExpiresIn=36000,  # Срок действия ссылки (в секундах)
                )
                results.append({"actor_name": actor_name, "poster_url": url})
                return results

        except Exception as e:
            logger.error(
                f"Ошибка при генерации URL для постера с actor_name {actor_name}: {e}"
            )
            return None

    async def get_poster_film(self, film_name: str):
        """
        Получает URL изображения фильма из S3.
        """
        results = []
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

                # Инициализация переменных
                poster_url = None
                preview_url = None
                text_url = None

                # Получение постера
                try:
                    poster_response = await client.list_objects_v2(
                        Bucket=settings.s3_conf.bucket_name,
                        Prefix=f"poster/films/{film_name}/poster.jpg",
                    )
                    if (
                        "Contents" not in poster_response
                        or len(poster_response["Contents"]) == 0
                    ):
                        logger.info(f"Постер для фильма {film_name} не найден!")
                    else:
                        poster_file_key = poster_response["Contents"][0]["Key"]
                        poster_url = await client.generate_presigned_url(
                            ClientMethod="get_object",
                            Params={
                                "Bucket": settings.s3_conf.bucket_name,
                                "Key": poster_file_key,
                            },
                            ExpiresIn=36000,  # Срок действия ссылки (в секундах)
                        )
                except Exception as e:
                    logger.error(f"Ошибка при получении постера: {str(e)}")

                # Получение превью
                try:
                    preview_response = await client.list_objects_v2(
                        Bucket=settings.s3_conf.bucket_name,
                        Prefix=f"poster/films/{film_name}/preview.jpg",
                    )
                    if (
                        "Contents" not in preview_response
                        or len(preview_response["Contents"]) == 0
                    ):
                        logger.info(f"Превью для фильма {film_name} не найдено!")
                    else:
                        preview_file_key = preview_response["Contents"][0]["Key"]
                        preview_url = await client.generate_presigned_url(
                            ClientMethod="get_object",
                            Params={
                                "Bucket": settings.s3_conf.bucket_name,
                                "Key": preview_file_key,
                            },
                            ExpiresIn=36000,  # Срок действия ссылки (в секундах)
                        )
                except Exception as e:
                    logger.error(f"Ошибка при получении превью: {str(e)}")

                # Получение текста
                try:
                    text_response = await client.list_objects_v2(
                        Bucket=settings.s3_conf.bucket_name,
                        Prefix=f"poster/films/{film_name}/text.jpg",
                    )
                    if (
                        "Contents" not in text_response
                        or len(text_response["Contents"]) == 0
                    ):
                        logger.info(f"Текст для фильма {film_name} не найдено!")
                    else:
                        text_file_key = text_response["Contents"][0]["Key"]
                        text_url = await client.generate_presigned_url(
                            ClientMethod="get_object",
                            Params={
                                "Bucket": settings.s3_conf.bucket_name,
                                "Key": text_file_key,
                            },
                            ExpiresIn=36000,  # Срок действия ссылки (в секундах)
                        )
                except Exception as e:
                    logger.error(f"Ошибка при получении текста: {str(e)}")

                # Возвращаем результаты
                results.append(
                    {
                        "poster_url": poster_url,
                        "preview_url": preview_url,
                        "text_url": text_url,
                    }
                )

                return results
        except Exception as e:
            logger.error(
                f"Ошибка при генерации URL для постера с film_name {film_name}: {e}"
            )
            return None

    async def get_poster_serial(self, serial_name: str):
        """
        Получает URL изображения сериала из S3.
        """
        results = []
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
                response = await client.list_objects_v2(
                    Bucket=settings.s3_conf.bucket_name,
                    Prefix=f"poster/serials/{serial_name}.jpg",
                )
                if "Contents" not in response or len(response["Contents"]) == 0:
                    logger.info(f"Постер с названием сериала {serial_name} не найдена!")
                    results.append({"serial_name": serial_name, "url": None})
                    return results

                file_key = response["Contents"][0]["Key"]

                url = await client.generate_presigned_url(
                    ClientMethod="get_object",
                    Params={
                        "Bucket": settings.s3_conf.bucket_name,
                        "Key": file_key,
                    },
                    ExpiresIn=36000,  # Срок действия ссылки (в секундах)
                )
                results.append({"serial_name": serial_name, "url": url})
                return results

        except Exception as e:
            logger.error(
                f"Ошибка при генерации URL для постера с serial_name {serial_name}: {e}"
            )
            return None

    async def get_user_profile_image(self, user_id: str):
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