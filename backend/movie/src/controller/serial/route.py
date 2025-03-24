from typing import List, Optional, Any, Coroutine
from strawberry import type, mutation, field
from src.controller.schema.schemas import (
    FilmInput,
    FilmType,
    FilmResponse,
    CommentType,
    CommentInput, GenresCountriesType,
)
from src.core.schemas import CreateCommentModel
from src.utils.converter import convert_film_model, convert_comment_film_model
from src.service.serials import SerialService


@type
class AddSerial:
    @mutation
    @staticmethod
    async def add_serial(serial_data: FilmInput) -> FilmResponse:
        """
        Мутация для добавления сериала.
        """
        serial_model = await convert_film_model(serial_data)

        serial = await SerialService.add_serial(serial_model=serial_model)
        return serial


@type
class CreateCommentSerial:
    @mutation
    @staticmethod
    async def create_comment_to_serial(
        create_comment_model: CommentInput,
    ) -> FilmResponse:

        comment_model = await convert_comment_film_model(create_comment_model)
        comment = await SerialService.create_comment(create_comment_model=comment_model)
        return comment


@type
class GetSerials:
    @field
    @staticmethod
    async def get_serials() -> List[FilmType]:
        """
        Query запрос для получения всех сериалов
        """
        serials = await SerialService.get_all_serials()

        serial_data = []
        for serial in serials:
            serial_data.append(
                FilmType(
                    film_name=serial.film_name,
                    type=serial.type,
                    description=serial.description,
                    year_prod=serial.year_prod,
                    comment=serial.comments if hasattr(serial, "comments") else [],
                    age_rating=serial.age_rating,
                    watch_time=serial.watch_time,
                    rating=serial.rating,
                    poster_url=serial.poster_url,
                    genres=serial.genres,
                    countries=serial.countries,
                    actors=serial.actors,
                    preview_url=serial.preview_url,
                    text_url=serial.text_url,
                    video_url=serial.video_url,
                )
            )

        return serial_data


@type
class GetSerialForName:
    @field
    @staticmethod
    async def get_serial_name(serial_name: str) -> FilmType:
        serial = await SerialService.get_serial_name(serial_name=serial_name)

        return FilmType(
            film_name=serial.film_name,
            type=serial.type,
            description=serial.description,
            year_prod=serial.year_prod,
            age_rating=serial.age_rating,
            watch_time=serial.watch_time,
            comment=serial.comments if hasattr(serial, "comments") else [],
            rating=serial.rating,
            genres=serial.genres,
            countries=serial.countries,
            actors=serial.actors,
            poster_url=serial.poster_url,
            preview_url=serial.preview_url,
            text_url=serial.text_url,
            video_url=serial.video_url,
        )


@type
class GetSerialForGenre:
    @field
    @staticmethod
    async def get_serial_filter(
        film_genre: Optional[str] = None,
        country_name: Optional[str] = None,
        rating: Optional[float] = None,
    ) -> Optional[List[FilmType]]:
        serials = await SerialService.get_serial_filter(
            film_genre=film_genre, country_name=country_name, rating=rating
        )

        # Если найден один фильм, возвращаем его в виде списка
        if len(serials) == 1:
            serial = serials[0]
            return [
                FilmType(
                    film_name=serial.film_name,
                    type=serial.type,
                    description=serial.description,
                    year_prod=serial.year_prod,
                    age_rating=serial.age_rating,
                    watch_time=serial.watch_time,
                    rating=serial.rating,
                    genres=serial.genres,
                    comment=serial.comments if hasattr(serial, "comments") else [],
                    countries=serial.countries,
                    actors=serial.actors,
                    poster_url=serial.poster_url,
                    preview_url=serial.preview_url,
                    text_url=serial.text_url,
                    video_url=serial.video_url,
                )
            ]

        # Если фильмов несколько, возвращаем список
        return [
            FilmType(
                film_name=serial.film_name,
                type=serial.type,
                description=serial.description,
                year_prod=serial.year_prod,
                age_rating=serial.age_rating,
                watch_time=serial.watch_time,
                rating=serial.rating,
                genres=serial.genres,
                comment=serial.comments if hasattr(serial, "comments") else [],
                countries=serial.countries,
                actors=serial.actors,
                poster_url=serial.poster_url,
                preview_url=serial.preview_url,
                text_url=serial.text_url,
                video_url=serial.video_url,
            )
            for serial in serials
        ]

@field
class GetSerialFilters:
    @field
    @staticmethod
    async def get_filter() -> Optional[List[GenresCountriesType]]:
        filters = await SerialService.get_filters()

        return [
            GenresCountriesType(
                filters=filters.genres,
                countries=filters.countries,
            )
        ]