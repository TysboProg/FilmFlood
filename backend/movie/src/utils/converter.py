from typing import Optional

from src.controller.schema.schemas import FilmInput, CommentInput
from src.core.schemas import (
    GenreModel,
    CountryModel,
    FilmModel,
    ActorModel,
    CreateCommentModel,
)


async def convert_film_model(film_input: FilmInput) -> FilmModel:
    """
    Преобразует strawberry-модель (FilmInput) в Pydantic-модель (FilmModel).
    """
    genres = [GenreModel(genre_name=genre.genre_name) for genre in film_input.genres]
    countries = [
        CountryModel(country_name=country.country_name)
        for country in film_input.countries
    ]

    film_model = FilmModel(
        film_name=film_input.film_name,
        type=film_input.type,
        description=film_input.description,
        year_prod=film_input.year_prod,
        age_rating=film_input.age_rating,
        watch_time=film_input.watch_time,
        rating=film_input.rating,
        countries=countries,
        actors=[
            ActorModel(
                actor_name=actor.actor_name,
                career=actor.career,
                date_of_birth=actor.date_of_birth,
                place_of_birth=actor.place_of_birth,
                sex=actor.sex,
                age=actor.age,
                growth=actor.growth,
                biography=actor.biography,
            )
            for actor in film_input.actors
        ],
        genres=genres,
    )
    return film_model


async def convert_comment_film_model(comment_input: CommentInput) -> CreateCommentModel:
    comment = CreateCommentModel(
        comment=comment_input.comment,
        rating=comment_input.rating,
        user_id=comment_input.user_id,
        film_name=comment_input.film_name,
    )

    return comment
