from contextlib import asynccontextmanager
from src.core.kafka.consumer.consumer import KafkaConsumer
from src.core.schemas import *
from src.core.database.models import *
from src.repositories.s3.s3 import S3Repository
from src.repositories.serial.base import AbstractSerialRepository
from src.core.database.base import async_session
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from loguru import logger
from typing import List, Optional
import asyncio

s3_repository = S3Repository()

@asynccontextmanager
async def kafka_consumer():
    consumer = KafkaConsumer(topic="comment")
    try:
        await consumer.start()
        yield consumer
    finally:
        await consumer.stop()


class SerialRepository(AbstractSerialRepository):
    async def create_serial(self, serial_model: FilmModel):
        if serial_model.type != "serial":
            raise ValueError("Сериал должен содержать поле type с значением serial!")

        async with async_session() as session:
            try:
                genre_names = {genre.genre_name for genre in serial_model.genres}
                country_names = {
                    country.country_name for country in serial_model.countries
                }
                actor_names = {actor.actor_name for actor in serial_model.actors}

                # Получаем существующие жанры, страны, актеров
                existing_genres = await session.execute(
                    select(GenreTable).where(GenreTable.genre_name.in_(genre_names))
                )
                existing_genres_list = existing_genres.scalars().all()

                existing_countries = await session.execute(
                    select(CountryTable).where(
                        CountryTable.country_name.in_(country_names)
                    )
                )
                existing_countries_list = existing_countries.scalars().all()

                existing_actors = await session.execute(
                    select(ActorTable).where(ActorTable.actor_name.in_(actor_names))
                )
                existing_actors_list = existing_actors.scalars().all()

                genre_map = {genre.genre_name: genre for genre in existing_genres_list}
                country_map = {
                    country.country_name: country for country in existing_countries_list
                }
                actor_map = {actor.actor_name: actor for actor in existing_actors_list}

                # Создаем новые жанры, страны, актеров, если их нет в БД
                new_genres = [
                    GenreTable(genre_name=name)
                    for name in genre_names
                    if name not in genre_map
                ]
                new_countries = [
                    CountryTable(country_name=name)
                    for name in country_names
                    if name not in country_map
                ]
                new_actors = [
                    ActorTable(
                        actor_name=actor.actor_name,
                        career=actor.career,
                        date_of_birth=actor.date_of_birth,
                        place_of_birth=actor.place_of_birth,
                        sex=actor.sex,
                        age=actor.age,
                        growth=actor.growth,
                        biography=actor.biography,
                    )
                    for actor in serial_model.actors
                    if actor.actor_name not in actor_map
                ]

                session.add_all(new_genres + new_countries + new_actors)
                await session.flush()  # Фиксируем ID новых объектов

                # Обновляем маппинг с новыми данными
                genre_map.update({genre.genre_name: genre for genre in new_genres})
                country_map.update(
                    {country.country_name: country for country in new_countries}
                )
                actor_map.update({actor.actor_name: actor for actor in new_actors})

                # Создаем объект фильма
                film = FilmTable(
                    film_name=serial_model.film_name,
                    description=serial_model.description,
                    type=serial_model.type,
                    year_prod=serial_model.year_prod,
                    age_rating=serial_model.age_rating,
                    watch_time=serial_model.watch_time,
                    rating=serial_model.rating,
                )

                film.genres = list(genre_map.values())
                film.countries = list(country_map.values())

                # Добавляем актеров через FilmActor
                film.film_actors = [
                    FilmActor(
                        film_id=film.id,  # Теперь film.id доступен
                        actor_id=actor.id,
                    )
                    for actor in actor_map.values()
                ]

                session.add(film)

                await session.commit()

                # film_dict = self._serialize_film(film)
                # await redis_service.set(key=f"{film.film_name}", value=film_dict)

                return film

            except IntegrityError as e:
                await session.rollback()
                logger.error(f"Ошибка при выполнении транзакции: {e}")
                raise

    async def create_comment_to_serial(self, create_comment_model: CreateCommentModel):
        async with async_session() as session, kafka_consumer() as consumer:
            messages = await consumer.get_messages()
            message_data = messages[0] if isinstance(messages, list) and messages else {}
            try:
                serial_result = await session.execute(
                    select(FilmTable).where(
                        FilmTable.film_name == create_comment_model.film_name
                    )
                )
                serial = serial_result.scalars().first()

                if not serial:
                    raise ValueError(
                        f"Сериал с именем '{create_comment_model.film_name}' не найден"
                    )

                username = message_data.get("username") if message_data else None

                new_comment = CommentFilm(
                    film_id=serial.id,
                    user_id=create_comment_model.user_id,
                    username=username,
                    rating=create_comment_model.rating,
                    comment=create_comment_model.comment,
                )

                session.add(new_comment)
                await session.flush()

                if not new_comment.id:
                    raise ValueError("Ошибка при добавлении комментария в базу данных")

                await session.commit()
                return new_comment

            except IntegrityError as e:
                await session.rollback()
                logger.error(f"Ошибка при добавлении комментария: {e}")
                raise ValueError("Ошибка при добавлении комментария в базу данных")
            except Exception as e:
                await session.rollback()
                logger.error(f"Неизвестная ошибка: {e}")
                raise e

    async def get_serials(self) -> List[FilmModel]:
        """
        Получает список первых 10 фильмов
        """
        global video_url
        async with async_session() as session:
            try:
                result = await session.execute(
                    select(FilmTable)
                    .options(
                        selectinload(FilmTable.comments),
                        selectinload(FilmTable.countries),
                        selectinload(FilmTable.genres),
                        selectinload(FilmTable.film_actors).selectinload(
                            FilmActor.actor
                        ),
                    )
                    .where(FilmTable.type == "serial")
                    .limit(10)
                    .execution_options(populate_existing=True)
                )
                serials = result.unique().scalars().all()
            except SQLAlchemyError as e:
                logger.error(f"Database error: {str(e)}", exc_info=True)
                raise HTTPException(status_code=500, detail="Database operation failed")
            except Exception as e:
                logger.error(f"Unexpected error: {str(e)}", exc_info=True)
                raise HTTPException(status_code=500, detail="Internal server error")

        # Параллельная загрузка данных из S3
        serial_posters_tasks = [
            s3_repository.get_poster_film(serial.film_name) for serial in serials
        ]

        actors_posters_cache = {}

        async def get_actor_poster(actor_name: str) -> Optional[str]:
            try:
                if actor_name not in actors_posters_cache:
                    poster = await s3_repository.get_poster_actor(actor_name)
                    if isinstance(poster, list) and len(poster) > 0:
                        poster = poster[0]  # Берем первый элемент списка
                    actors_posters_cache[actor_name] = (
                        poster.get("poster_url") if isinstance(poster, dict) else None
                    )
                return actors_posters_cache[actor_name]
            except Exception as e:
                logger.error(f"Actor poster error: {actor_name} - {str(e)}")
                return None

        # Запускаем все задачи параллельно
        serial_posters, _ = await asyncio.gather(
            asyncio.gather(*serial_posters_tasks),
            asyncio.gather(
                *[
                    get_actor_poster(actor.actor.actor_name)
                    for serial in serials
                    for actor in serial.film_actors
                ]
            ),
        )

        serial_video_url = [
            s3_repository.get_url_serial(serial.film_name) for serial in serials
        ]

        # Загружаем постеры для всех фильмов
        film_posters = await asyncio.gather(
            *[s3_repository.get_poster_film(film.film_name) for film in serials],
            return_exceptions=True,
        )

        serial_movie_url = await asyncio.gather(
            *serial_video_url,  # Распаковываем список корутин
            return_exceptions=True,
        )

        films_data = []
        for film, posters_data, serial_video_urls in zip(
            serials, film_posters, serial_movie_url
        ):
            try:
                if isinstance(posters_data, Exception):
                    logger.error(
                        f"Ошибка загрузки постера для сериала {film.film_name}: {str(posters_data)}"
                    )
                    posters_data = None

                poster_url = None
                preview_url = None
                text_url = None

                if (
                    posters_data
                    and isinstance(posters_data, list)
                    and len(posters_data) > 0
                ):
                    for poster_data in posters_data:
                        video_urls = serial_video_urls[0]
                        poster_url = poster_data.get("poster_url")
                        preview_url = poster_data.get("preview_url")
                        text_url = poster_data.get("text_url")
                        video_url = video_urls.get("serial_url")

                actors_data = []
                for film_actor in film.film_actors:
                    if film_actor.actor:  # Добавляем проверку
                        actor = film_actor.actor
                        actors_data.append(
                            ActorModel(
                                actor_name=actor.actor_name,
                                career=actor.career,
                                date_of_birth=actor.date_of_birth,
                                place_of_birth=actor.place_of_birth,
                                sex=actor.sex,
                                age=actor.age,
                                growth=actor.growth,
                                biography=actor.biography,
                                poster_url=actors_posters_cache.get(actor.actor_name),
                            )
                        )

                # Формируем модель фильма
                film_model = FilmModel(
                    film_name=film.film_name,
                    description=film.description,
                    type=film.type,
                    year_prod=film.year_prod,
                    age_rating=film.age_rating,
                    watch_time=film.watch_time,
                    rating=film.rating,
                    comments=[
                        CommentModel(
                            film_id=comment.film_id,
                            user_id=comment.user_id,
                            rating=comment.rating,
                            comment=comment.comment,
                        )
                        for comment in film.comments
                    ],
                    countries=(
                        [
                            CountryModel(country_name=c.country_name)
                            for c in film.countries
                        ]
                        if film.countries
                        else []
                    ),
                    genres=(
                        [GenreModel(genre_name=g.genre_name) for g in film.genres]
                        if film.genres
                        else []
                    ),
                    actors=actors_data,
                    poster_url=poster_url,
                    preview_url=preview_url,
                    text_url=text_url,
                    video_url=video_url,
                )
                films_data.append(film_model)

            except Exception as e:
                logger.error(f"Error processing serial {film.film_name}: {str(e)}")
                continue

        return films_data

    async def get_serial_name_info(self, serial_name: str) -> Optional[FilmModel]:
        """
        Получает полностью данные о фильме, включая постеры из S3.
        """
        async with async_session() as session:
            try:
                # Запрос для получения фильма по имени с загрузкой связанных данных
                result = await session.execute(
                    select(FilmTable)
                    .options(
                        selectinload(FilmTable.comments),
                        selectinload(FilmTable.countries),
                        selectinload(FilmTable.genres),
                        selectinload(FilmTable.film_actors).selectinload(FilmActor.actor),
                    )
                    .where(FilmTable.film_name == serial_name)
                    .where(FilmTable.type == "serial")
                )
                serial = result.scalars().first()

                if serial is None:
                    logger.error(f"Сериал '{serial_name}' не найден в базе данных!")
                    return None

                # Получаем данные постера и видео из S3
                try:
                    serial_poster = await s3_repository.get_poster_film(serial.film_name)
                    serial_video_url = await s3_repository.get_url_serial(serial_name=serial.film_name)

                    poster_url = serial_poster[0]["poster_url"] if serial_poster else None
                    preview_url = serial_poster[0]["preview_url"] if serial_poster else None
                    text_url = serial_poster[0]["text_url"] if serial_poster else None
                    video_url = serial_video_url[0]["serial_url"] if serial_video_url else None
                except Exception as e:
                    logger.error(f"Ошибка загрузки данных из S3: {str(e)}")
                    preview_url = text_url = video_url = None

                # Обработка комментариев
                processed_comments = []
                for comment in serial.comments:
                    try:
                        user_image = await s3_repository.get_user_profile_image(user_id=str(comment.user_id))
                        comment_model = CommentModel(
                            film_id=comment.film_id,
                            username=comment.username,
                            rating=comment.rating,
                            comment=comment.comment,
                            user_image=user_image,
                        )
                        processed_comments.append(comment_model)
                    except Exception as e:
                        logger.error(f"Ошибка при получении изображения пользователя {comment.user_id}: {e}")
                        comment_model = CommentModel(
                            film_id=comment.film_id,
                            username=comment.username,
                            rating=comment.rating,
                            comment=comment.comment,
                            user_image=None,  # Используем None в случае ошибки
                        )
                        processed_comments.append(comment_model)

                # Обработка стран
                processed_countries = [
                    CountryModel(country_name=country.country_name)
                    for country in serial.countries
                ]

                # Обработка жанров
                processed_genres = [
                    GenreModel(genre_name=genre.genre_name)
                    for genre in serial.genres
                ]

                # Обработка актеров
                processed_actors = []
                for film_actor in serial.film_actors:
                    actor = film_actor.actor
                    if not actor:
                        logger.warning(f"⚠️ Actor missing for FilmActor {film_actor.id}")
                        continue

                    try:
                        actor_poster = await s3_repository.get_poster_actor(actor.actor_name)
                        poster_url_actor = None
                        if actor_poster:
                            if isinstance(actor_poster, list) and len(actor_poster) > 0:
                                first_item = actor_poster[0]
                                poster_url_actor = (
                                        first_item.get("url")
                                        or first_item.get("poster_url")
                                        or first_item.get("image_url")
                                )
                            elif isinstance(actor_poster, dict):
                                poster_url_actor = (
                                        actor_poster.get("url")
                                        or actor_poster.get("poster_url")
                                        or actor_poster.get("image_url")
                                )

                        processed_actors.append(
                            ActorModel(
                                actor_name=actor.actor_name,
                                career=actor.career,
                                date_of_birth=actor.date_of_birth,
                                place_of_birth=actor.place_of_birth,
                                sex=actor.sex,
                                age=actor.age,
                                growth=actor.growth,
                                biography=actor.biography,
                                poster_url=poster_url_actor,
                            )
                        )
                    except Exception as e:
                        logger.error(f"❌ Ошибка при обработке актера {actor.actor_name}: {str(e)}")
                        continue

                # Создаем объект FilmModel
                film_data = FilmModel(
                    film_name=serial.film_name,
                    description=serial.description,
                    type=serial.type,
                    year_prod=serial.year_prod,
                    age_rating=serial.age_rating,
                    watch_time=serial.watch_time,
                    rating=serial.rating,
                    comments=processed_comments,
                    countries=processed_countries,
                    genres=processed_genres,
                    actors=processed_actors,
                    poster_url=poster_url,
                    preview_url=preview_url,
                    text_url=text_url,
                    video_url=video_url,
                )

                return film_data

            except Exception as e:
                logger.error(f"Ошибка при получении данных о сериале {serial_name}: {e}")
                return None

    async def get_serial_filter_info(
        self, genre_name: str = None, country_name: str = None, rating: str = None
    ) -> Optional[List[FilmModel]]:
        """
        Получение фильмов по фильтрам
        """
        async with async_session() as session:
            try:
                # Инициализация запроса с подгрузкой связанных данных
                query = (
                    select(FilmTable)
                    .options(
                        selectinload(FilmTable.genres),
                        selectinload(FilmTable.countries),
                        selectinload(FilmTable.film_actors).joinedload(FilmActor.actor),
                        selectinload(FilmTable.comments),
                    )
                    .where(FilmTable.type == "serial")
                )

                if rating is not None:
                    query = query.where(FilmTable.rating >= rating)

                if genre_name:
                    query = query.join(FilmTable.genres).where(
                        GenreTable.genre_name == genre_name
                    )

                if country_name:
                    query = query.join(FilmTable.countries).where(
                        CountryTable.country_name == country_name
                    )

                result = await session.execute(query)
                serials = result.scalars().all()

                if not serials:
                    logger.error("Сериалы по заданным параметрам не найдены!")
                    return None

                # Загружаем постеры для всех фильмов
                serial_posters = await asyncio.gather(
                    *[
                        s3_repository.get_poster_film(serial.film_name)
                        for serial in serials
                    ],
                    return_exceptions=True,  # Позволяет продолжить выполнение, даже если один из запросов завершится с ошибкой
                )

                serial_video_url = await asyncio.gather(
                    *[
                        s3_repository.get_url_serial(serial.film_name)
                        for serial in serials
                    ],
                    return_exceptions=True,
                )

                serial_list = []
                for serial, posters_data, serial_video_urls in zip(
                    serials, serial_posters, serial_video_url
                ):
                    try:
                        if isinstance(posters_data, Exception):
                            logger.error(
                                f"Ошибка загрузки постера для сериала {serial.film_name}: {str(posters_data)}"
                            )
                            posters_data = None

                        poster_url = None
                        preview_url = None
                        text_url = None

                        if (
                            posters_data
                            and isinstance(posters_data, list)
                            and len(posters_data) > 0
                        ):
                            poster_data = posters_data[
                                0
                            ]  # Получаем первый (и единственный) элемент
                            video_urls = serial_video_urls[0]
                            poster_url = poster_data.get("poster_url")
                            preview_url = poster_data.get(
                                "preview_url"
                            )  # Исправлена опечатка в ключе (preview_url)
                            text_url = poster_data.get("text_url")
                            video_url = video_urls.get("serial_url")

                        actor_posters = await asyncio.gather(
                            *[
                                s3_repository.get_poster_actor(
                                    film_actor.actor.actor_name
                                )
                                for film_actor in serial.film_actors
                            ],
                            return_exceptions=True,  # Позволяет продолжить выполнение, даже если один из запросов завершится с ошибкой
                        )

                        processed_actors = []
                        for film_actor, actor_posters_data in zip(
                            serial.film_actors, actor_posters
                        ):
                            try:
                                # Проверяем, что actor_posters_data не является исключением
                                if isinstance(actor_posters_data, Exception):
                                    logger.error(
                                        f"Ошибка загрузки постера актера {film_actor.actor.actor_name}: {str(actor_posters_data)}"
                                    )
                                    actor_posters_data = None

                                # Если actor_posters_data является списком и содержит данные
                                actor_poster_url = None
                                if (
                                    actor_posters_data
                                    and isinstance(actor_posters_data, list)
                                    and len(actor_posters_data) > 0
                                ):
                                    actor_poster_url = actor_posters_data[0].get(
                                        "poster_url"
                                    )  # Получаем URL первого постера

                                processed_actors.append(
                                    ActorModel(
                                        actor_name=film_actor.actor.actor_name,
                                        career=film_actor.actor.career,
                                        date_of_birth=film_actor.actor.date_of_birth,
                                        place_of_birth=film_actor.actor.place_of_birth,
                                        sex=film_actor.actor.sex,
                                        age=film_actor.actor.age,
                                        growth=film_actor.actor.growth,
                                        biography=film_actor.actor.biography,
                                        poster_url=actor_poster_url,
                                    )
                                )
                            except Exception as e:
                                logger.error(
                                    f"Ошибка обработки данных актера {film_actor.actor.actor_name}: {str(e)}"
                                )

                        # Создаём объект для фильма с актёрами и постерами
                        film_data = FilmModel(
                            film_name=serial.film_name,
                            description=serial.description,
                            type=serial.type,
                            year_prod=serial.year_prod,
                            age_rating=serial.age_rating,
                            watch_time=serial.watch_time,
                            rating=serial.rating,
                            comments=[
                                CommentModel(
                                    film_id=comment.film_id,
                                    user_id=comment.user_id,
                                    rating=comment.rating,
                                    comment=comment.comment,
                                )
                                for comment in serial.comments
                            ],
                            countries=[
                                CountryModel(country_name=country.country_name)
                                for country in serial.countries
                            ],
                            genres=[
                                GenreModel(genre_name=genre.genre_name)
                                for genre in serial.genres
                            ],
                            actors=processed_actors,
                            poster_url=poster_url,
                            preview_url=preview_url,
                            text_url=text_url,
                            video_url=video_url,
                        )
                        serial_list.append(film_data)
                    except Exception as e:
                        logger.error(
                            f"Ошибка обработки данных сериала {serial.film_name}: {str(e)}"
                        )

                return serial_list
            except Exception as e:
                logger.error(f"Ошибка выполнения запроса: {str(e)}")
                return None

    async def get_filters(self):
        async with async_session() as session:
            async with session.begin():
                genres_result = await session.execute(select(GenreTable))
                countries_result = await session.execute(select(CountryTable))

                genres = [GenreModel(genre_name=g.genre_name) for g in genres_result.scalars().all()]
                countries = [CountryModel(country_name=c.country_name) for c in countries_result.scalars().all()]

        return GenresCountries(genres=genres, countries=countries)