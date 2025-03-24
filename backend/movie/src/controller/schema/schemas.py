from datetime import datetime
import strawberry
from typing import List, Optional

from src.core.schemas import FiltersResponse


@strawberry.type
class GenreType:
    genre_name: str


@strawberry.type
class CountryType:
    country_name: str

@strawberry.type
class GenresCountriesType:
    genres: Optional[List[str]]
    countries: Optional[List[str]]

@strawberry.type
class FiltersResponseType:
    filters: List[GenresCountriesType]


@strawberry.type
class CommentType:
    comment: str
    rating: float
    username: str
    user_id: str
    film_name: str
    user_image: Optional[str]


@strawberry.input
class CountryInput:
    country_name: str


@strawberry.input
class GenresInput:
    genre_name: str


@strawberry.type
class ActorType:
    actor_name: str
    career: List[str]
    date_of_birth: datetime
    place_of_birth: str
    sex: str
    age: int
    growth: str
    biography: str
    films: Optional[List["FilmType"]]
    poster_url: Optional[str] = None


@strawberry.type
class FilmType:
    film_name: str
    type: str
    description: str
    year_prod: int
    age_rating: str
    watch_time: str
    countries: List[str]
    rating: float
    actors: List[ActorType]
    genres: List[str]
    comment: Optional[List[CommentType]] = strawberry.field(default_factory=list)
    poster_url: Optional[str] = None
    preview_url: Optional[str] = None
    text_url: Optional[str] = None
    video_url: Optional[str] = None


@strawberry.type
class FilmResponse:
    message: str


@strawberry.input
class ActorInput:
    actor_name: str
    career: List[str]
    date_of_birth: datetime
    place_of_birth: str
    sex: str
    age: int
    growth: str
    biography: str


@strawberry.input
class CommentInput:
    comment: str
    rating: float
    user_id: str
    film_name: str


@strawberry.input
class FilmInput:
    film_name: str
    type: str
    description: str
    year_prod: int
    age_rating: str
    watch_time: str
    rating: float = 0.0
    comment: Optional[List[CommentInput]] = strawberry.field(default_factory=list)
    countries: List[CountryInput]
    actors: List[ActorInput]
    genres: List[GenresInput]
