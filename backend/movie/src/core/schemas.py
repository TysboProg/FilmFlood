from datetime import datetime
from uuid import UUID
from pydantic import (
    BaseModel,
    constr,
    conint,
    field_validator,
    model_validator,
    confloat,
)
from typing import List, Optional

class FilmActorModel(BaseModel):
    film_name: str
    type: str
    year_prod: conint(gt=1900, lt=2100)
    rating: float
    poster_url: Optional[str] = None

class ActorModel(BaseModel):
    actor_name: constr(min_length=1)
    career: List[constr(min_length=1)]
    date_of_birth: datetime
    place_of_birth: str
    sex: constr(min_length=1)
    age: conint(ge=0)
    growth: str
    biography: str
    films: Optional[List[FilmActorModel]] = None
    poster_url: Optional[str] = None

    class Config:
        min_min_length = 1
        arbitrary_types_allowed = True


class GenreModel(BaseModel):
    genre_name: constr(min_length=1)

    class Config:
        arbitrary_types_allowed = True


class CountryModel(BaseModel):
    country_name: constr(min_length=1)

    class Config:
        arbitrary_types_allowed = True

class GenresCountries(BaseModel):
    genres: Optional[List[str]]
    countries: Optional[List[str]]

    class Config:
        arbitrary_types_allowed = True

class FiltersResponse(BaseModel):
    filters: List[GenresCountries]

    class Config:
        arbitrary_types_allowed = True


class CreateCommentModel(BaseModel):
    comment: constr(min_length=5, max_length=50)
    user_id: UUID
    rating: confloat(ge=0, le=10)
    film_name: str


class Config:
    arbitrary_types_allowed = True


class CommentModel(BaseModel):
    comment: constr(min_length=5, max_length=50)
    user_id: Optional[UUID] = None
    username: Optional[str] = None
    user_image: Optional[str] = None
    rating: Optional[confloat(ge=0, le=10)] = None
    film_id: Optional[UUID] = None

    class Config:
        arbitrary_types_allowed = True


class FilmModel(BaseModel):
    film_name: str
    type: str
    description: str
    year_prod: conint(gt=1900, lt=2100)
    age_rating: str
    watch_time: str
    rating: float
    poster_url: Optional[str] = None
    preview_url: Optional[str] = None
    text_url: Optional[str] = None
    video_url: Optional[str] = None
    comments: Optional[List[CommentModel]] = []
    countries: List[CountryModel]
    actors: List[ActorModel]
    genres: List[GenreModel]

    class Config:
        arbitrary_types_allowed = True

    @field_validator("type")
    def validate_type(cls, v):
        if v not in ["serial", "movie"]:
            raise ValueError("Тип должен быть либо serial, либо film.'")
        return v

    @model_validator(mode="before")
    def check_rating(cls, values):
        if isinstance(values, dict):
            rating = values.get("rating")
        else:
            rating = values.rating  # Обращение к атрибуту, если values — это объект

        if rating is not None and (rating < 0 or rating > 10):
            raise ValueError("Рейтинг может быть только в диапазоне от 0 до 10!")
        return values
