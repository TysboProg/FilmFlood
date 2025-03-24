from typing import List, Optional
from fastapi import HTTPException, status
from src.controller.schema.schemas import FilmResponse
from src.core.schemas import FilmModel, CreateCommentModel, GenresCountries, FiltersResponse
from src.repositories.film.films import FilmRepository

film_repository = FilmRepository()


class FilmService:
    @staticmethod
    async def add_film(film_model: FilmModel) -> FilmResponse:
        # Передаем сюда модель FilmModel для добавления фильма в базу данных
        await film_repository.create_film(film_model=film_model)
        return FilmResponse(message="Фильм успешно добавлен в базу данных")

    @staticmethod
    async def create_comment(create_comment_model: CreateCommentModel) -> FilmResponse:
        """
        Создает комментарии под фильмом
        """
        await film_repository.create_comment_to_film(
            create_comment_model=create_comment_model
        )
        return FilmResponse(message="Комментарии успешно добавлен к фильму")

    @staticmethod
    async def get_all_films() -> List[FilmModel]:
        """
        Возвращает список из 10 фильмов из базы данных
        """
        films_data = await film_repository.get_films()

        return [
            FilmModel(
                film_name=film.film_name,
                type=film.type,
                age_rating=film.age_rating,
                description=film.description,
                watch_time=film.watch_time,
                year_prod=film.year_prod,
                rating=film.rating,
                genres=film.genres,
                actors=film.actors,
                countries=film.countries,
                poster_url=film.poster_url,
                comments=film.comments,
                preview_url=film.preview_url,
                text_url=film.text_url,
                video_url=film.video_url,
            )
            for film in films_data
        ]

    @staticmethod
    async def get_film_name(film_name: str) -> FilmModel:
        """
        Возвращает полную информацию про конкретный фильм по его названию
        """
        film_data = await film_repository.get_film_name_info(film_name=film_name)

        return FilmModel(
            film_name=film_data.film_name,
            type=film_data.type,
            age_rating=film_data.age_rating,
            description=film_data.description,
            watch_time=film_data.watch_time,
            year_prod=film_data.year_prod,
            rating=film_data.rating,
            genres=film_data.genres,
            actors=film_data.actors,
            comments=film_data.comments,
            countries=film_data.countries,
            poster_url=film_data.poster_url,
            preview_url=film_data.preview_url,
            text_url=film_data.text_url,
            video_url=film_data.video_url,
        )

    @staticmethod
    async def get_film_filter(
        film_genre: str = None, country_name: str = None, rating: float = None
    ) -> Optional[List[FilmModel]]:
        """
        Возвращает фильмы по фильтрам
        """
        film_data = await film_repository.get_film_filter_info(
            genre_name=film_genre, country_name=country_name, rating=rating
        )
        if not film_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Не найдены фильмы в данной категории",
            )

        return [
            FilmModel(
                film_name=film.film_name,
                type=film.type,
                age_rating=film.age_rating,
                description=film.description,
                watch_time=film.watch_time,
                year_prod=film.year_prod,
                rating=film.rating,
                genres=film.genres,
                actors=film.actors,
                comments=film.comments,
                countries=film.countries,
                poster_url=film.poster_url,
                preview_url=film.preview_url,
                text_url=film.text_url,
                video_url=film.video_url,
            )
            for film in film_data
        ]

    @staticmethod
    async def get_filters():
        filter_data = await film_repository.get_filters()
        if not filter_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Фильтров не найдено",
            )
        return GenresCountries(
            genres=filter_data.genres,
            countries=filter_data.countries,
        )
