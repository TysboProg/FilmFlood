from typing import List, Optional, Any, Coroutine
from strawberry import type, mutation, field
from src.controller.schema.schemas import (
    FilmResponse,
    FilmInput,
    FilmType,
    CommentInput, GenresCountriesType, FiltersResponseType,
)
from src.core.schemas import CreateCommentModel, GenresCountries
from src.utils.converter import convert_film_model, convert_comment_film_model
from src.service.films import FilmService


@type
class AddFilm:
    @mutation
    @staticmethod
    async def add_film(film_data: FilmInput) -> FilmResponse:
        """
        Мутация для добавления фильма.
        """
        film_model = await convert_film_model(film_data)

        film = await FilmService.add_film(film_model)
        return film


@type
class GetFilms:
    @field
    @staticmethod
    async def get_films() -> List[FilmType]:
        """
        Query запрос для получения всех фильмов
        """
        films = await FilmService.get_all_films()

        film_data = []
        for film in films:
            film_data.append(
                FilmType(
                    film_name=film.film_name,
                    type=film.type,
                    description=film.description,
                    year_prod=film.year_prod,
                    age_rating=film.age_rating,
                    watch_time=film.watch_time,
                    rating=film.rating,
                    poster_url=film.poster_url,
                    comment=film.comments,
                    genres=film.genres,
                    countries=film.countries,
                    actors=film.actors,
                    preview_url=film.preview_url,
                    text_url=film.text_url,
                    video_url=film.video_url,
                )
            )

        return film_data


@type
class CreateCommentFilm:
    @mutation
    @staticmethod
    async def create_comment_to_film(
        create_comment_model: CommentInput,
    ) -> FilmResponse:
        comment_model = await convert_comment_film_model(create_comment_model)
        comment = await FilmService.create_comment(create_comment_model=comment_model)
        return comment


@type
class GetFilmForName:
    @field
    @staticmethod
    async def get_film_name(film_name: str) -> FilmType:
        film = await FilmService.get_film_name(film_name=film_name)

        film_type = FilmType(
            film_name=film.film_name,
            type=film.type,
            description=film.description,
            year_prod=film.year_prod,
            age_rating=film.age_rating,
            watch_time=film.watch_time,
            rating=film.rating,
            genres=film.genres,
            countries=film.countries,
            comment=film.comments,
            actors=film.actors,
            poster_url=film.poster_url,
            preview_url=film.preview_url,
            text_url=film.text_url,
            video_url=film.video_url,
        )

        return film_type


@type
class GetFilmForFilter:
    @field
    @staticmethod
    async def get_film_filter(
        film_genre: Optional[str] = None,
        country_name: Optional[str] = None,
        rating: Optional[float] = None,
    ) -> Optional[List[FilmType]]:
        films = await FilmService.get_film_filter(
            film_genre=film_genre, country_name=country_name, rating=rating
        )

        # Если найден один фильм, возвращаем его в виде списка
        if len(films) == 1:
            film = films[0]
            return [
                FilmType(
                    film_name=film.film_name,
                    type=film.type,
                    description=film.description,
                    year_prod=film.year_prod,
                    age_rating=film.age_rating,
                    watch_time=film.watch_time,
                    rating=film.rating,
                    genres=film.genres,
                    comment=film.comments if hasattr(film, "comments") else [],
                    countries=film.countries,
                    actors=film.actors,
                    poster_url=film.poster_url,
                    preview_url=film.preview_url,
                    text_url=film.text_url,
                    video_url=film.video_url,
                )
            ]

        # Если фильмов несколько, возвращаем список
        return [
            FilmType(
                film_name=film.film_name,
                type=film.type,
                description=film.description,
                year_prod=film.year_prod,
                age_rating=film.age_rating,
                watch_time=film.watch_time,
                rating=film.rating,
                genres=film.genres,
                comment=film.comments if hasattr(film, "comments") else [],
                countries=film.countries,
                actors=film.actors,
                poster_url=film.poster_url,
                preview_url=film.preview_url,
                text_url=film.text_url,
                video_url=film.video_url,
            )
            for film in films
        ]

@type
class GetFilmFilter:
    @field
    @staticmethod
    async def get_films_filters() -> GenresCountriesType:
        filters = await FilmService.get_filters()
        return GenresCountriesType(
            genres=filters.genres,
            countries=filters.countries
        )