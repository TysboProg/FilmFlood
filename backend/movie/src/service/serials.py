from typing import List, Optional
from fastapi import HTTPException, status
from src.controller.schema.schemas import FilmResponse
from src.repositories.serial.serials import SerialRepository
from src.core.schemas import FilmModel, CreateCommentModel, GenresCountries

serial_repository = SerialRepository()


class SerialService:
    @staticmethod
    async def add_serial(serial_model: FilmModel) -> FilmResponse:
        # Передаем сюда модель FilmModel для добавления сериала в базу данных
        await serial_repository.create_serial(serial_model=serial_model)
        return FilmResponse(message="Сериал успешно добавлен в базу данных")

    @staticmethod
    async def create_comment(create_comment_model: CreateCommentModel) -> FilmResponse:
        """
        Создает комментарии под фильмом
        """
        await serial_repository.create_comment_to_serial(
            create_comment_model=create_comment_model
        )
        return FilmResponse(message="Комментарии успешно добавлен к сериалу")

    @staticmethod
    async def get_all_serials() -> List[FilmModel]:
        """
        Возвращает список из 10 сериалов из базы данных
        """
        serials_data = await serial_repository.get_serials()

        # Преобразуем каждый фильм в модель FilmModel
        serial_data = [
            FilmModel(
                film_name=serial.film_name,
                type=serial.type,
                age_rating=serial.age_rating,
                description=serial.description,
                watch_time=serial.watch_time,
                year_prod=serial.year_prod,
                rating=serial.rating,
                genres=serial.genres,
                actors=serial.actors,
                comments=serial.comments,
                countries=serial.countries,
                poster_url=serial.poster_url,
                preview_url=serial.preview_url,
                text_url=serial.text_url,
                video_url=serial.video_url,
            )
            for serial in serials_data
        ]

        return serial_data

    @staticmethod
    async def get_serial_name(serial_name: str) -> FilmModel:
        """
        Возвращает полную информацию про конкретный фильм по его названию
        """
        serial_data = await serial_repository.get_serial_name_info(
            serial_name=serial_name
        )

        return FilmModel(
            film_name=serial_data.film_name,
            type=serial_data.type,
            age_rating=serial_data.age_rating,
            description=serial_data.description,
            watch_time=serial_data.watch_time,
            year_prod=serial_data.year_prod,
            rating=serial_data.rating,
            genres=serial_data.genres,
            comments=serial_data.comments,
            actors=serial_data.actors,
            countries=serial_data.countries,
            poster_url=serial_data.poster_url,
            preview_url=serial_data.preview_url,
            text_url=serial_data.text_url,
            video_url=serial_data.video_url,
        )

    @staticmethod
    async def get_serial_filter(
        film_genre: str = None, country_name: str = None, rating: float = None
    ) -> Optional[List[FilmModel]]:
        serial_data = await serial_repository.get_serial_filter_info(
            genre_name=film_genre, country_name=country_name, rating=rating
        )
        if not serial_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Не найдены сериалы в данной категории",
            )

        return [
            FilmModel(
                film_name=serial.film_name,
                type=serial.type,
                age_rating=serial.age_rating,
                description=serial.description,
                watch_time=serial.watch_time,
                year_prod=serial.year_prod,
                rating=serial.rating,
                genres=serial.genres,
                actors=serial.actors,
                comments=serial.comments,
                countries=serial.countries,
                poster_url=serial.poster_url,
                preview_url=serial.preview_url,
                text_url=serial.text_url,
                video_url=serial.video_url,
            )
            for serial in serial_data
        ]

    @staticmethod
    async def get_filters():
        filter_data = await serial_repository.get_filters()
        if not filter_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Фильтров не найдено",
            )
        return GenresCountries(
            genres=filter_data.genres,
            countries=filter_data.countries,
        )