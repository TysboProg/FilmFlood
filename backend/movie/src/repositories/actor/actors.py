from typing import Optional
from src.core.database.base import async_session
from src.core.database.models import ActorTable, FilmActor, FilmTable
from src.repositories.s3.s3 import S3Repository
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from src.core.schemas import ActorModel, FilmModel, CountryModel, GenreModel, FilmActorModel
from loguru import logger
from src.repositories.actor.base import AbstractActorRepository

s3_repository = S3Repository()


class ActorRepository(AbstractActorRepository):
    async def get_actor_name_info(self, actor_name: str) -> Optional[ActorModel]:
        async with async_session() as session:
            try:
                # Запрос для получения актера по имени с загрузкой связанных фильмов
                result = await session.execute(
                    select(ActorTable)
                    .where(ActorTable.actor_name == actor_name)
                    .options(
                        selectinload(ActorTable.actor_films).selectinload(FilmActor.film).options(
                            selectinload(FilmTable.countries),
                            selectinload(FilmTable.genres),
                            selectinload(FilmTable.film_actors).selectinload(FilmActor.actor),
                        )
                    ))
                actor = result.scalars().first()

                if not actor:
                    logger.error(
                        f"Актер с именем {actor_name} в базе данных не существует!"
                    )
                    return None

                for film_actor in actor.actor_films:
                    try:
                        if film_actor.film.type == "movie":
                            film_poster = await s3_repository.get_poster_film(film_actor.film.film_name)
                            poster_url = film_poster[0]["poster_url"] if film_poster and isinstance(film_poster, list) else None
                        elif film_actor.film.type == "serial":
                            film_poster = await s3_repository.get_poster_film(film_actor.film.film_name)
                            poster_url = film_poster[0]["poster_url"] if film_poster and isinstance(film_poster, list) else None
                        else:
                            poster_url = None
                    except Exception as e:
                        logger.error(f"Ошибка загрузки постера: {str(e)}")
                        poster_url = None

                # Получаем список фильмов и сериалов, в которых снимался актер
                films = [
                    FilmActorModel(
                        film_name=film_actor.film.film_name,
                        type=film_actor.film.type,
                        year_prod=film_actor.film.year_prod,
                        rating=film_actor.film.rating,
                        poster_url=poster_url
                    )
                    for film_actor in actor.actor_films
                ]

                # Получаем постер актера (предположим, что это внешний сервис)
                try:
                    actor_poster = await s3_repository.get_poster_actor(
                        actor_name=actor.actor_name
                    )
                    poster_url = (
                        actor_poster[0]["poster_url"]
                        if actor_poster and isinstance(actor_poster, list)
                        else None
                    )
                except Exception as e:
                    logger.error(f"Ошибка загрузки постера: {str(e)}")
                    poster_url = None

                # Создаем объект ActorModel
                actor_data = ActorModel(
                    actor_name=actor.actor_name,
                    career=actor.career,
                    date_of_birth=actor.date_of_birth,
                    place_of_birth=actor.place_of_birth,
                    films=films,  # Теперь films содержит список фильмов и сериалов
                    sex=actor.sex,
                    age=actor.age,
                    growth=actor.growth,
                    biography=actor.biography,
                    poster_url=poster_url,
                )

                return actor_data

            except Exception as e:
                logger.error(f"Ошибка при получении актера: {e}")
                return None