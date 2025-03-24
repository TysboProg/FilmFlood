from datetime import datetime
from typing import List
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, ForeignKey, Float, Column, Table, DateTime
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from src.core.database.base import Base

# Правильное определение ассоциативных таблиц
film_genre_association = Table(
    "film_genre_association",
    Base.metadata,
    Column(
        "film_id",
        UUID(as_uuid=True),
        ForeignKey("films.id"),
        primary_key=True,
    ),
    Column(
        "genre_id",
        UUID(as_uuid=True),
        ForeignKey("genres.id"),
        primary_key=True,
    ),
)

film_country_association = Table(
    "film_country_association",
    Base.metadata,
    Column(
        "film_id",
        UUID(as_uuid=True),
        ForeignKey("films.id"),
        primary_key=True,
    ),
    Column(
        "country_id",
        UUID(as_uuid=True),
        ForeignKey("countries.id"),
        primary_key=True,
    ),
)


class FilmTable(Base):
    __tablename__ = "films"

    film_name: Mapped[str] = mapped_column(
        String,
        nullable=False,
        unique=True,
    )
    description: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )
    type: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )
    year_prod: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
    age_rating: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )
    watch_time: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )
    rating: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.0,
    )

    comments: Mapped[list["CommentFilm"]] = relationship(
        back_populates="film",
        lazy="selectin",
    )
    film_actors: Mapped[list["FilmActor"]] = relationship(
        back_populates="film",
        # lazy="selectin",
    )
    genres: Mapped[list["GenreTable"]] = relationship(
        back_populates="films",
        lazy="selectin",
        secondary="film_genre_association",
    )
    countries: Mapped[list["CountryTable"]] = relationship(
        back_populates="films",
        secondary="film_country_association",
        lazy="selectin",
    )


class ActorTable(Base):
    __tablename__ = "actors"

    actor_name: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    career: Mapped[List[str]] = mapped_column(ARRAY(String), nullable=False)
    date_of_birth: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    place_of_birth: Mapped[str] = mapped_column(String, nullable=False)
    sex: Mapped[str] = mapped_column(String, nullable=False)
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    growth: Mapped[str] = mapped_column(String, nullable=False)
    biography: Mapped[str] = mapped_column(String, unique=True, nullable=False)

    actor_films: Mapped[list["FilmActor"]] = relationship(
        back_populates="actor",
        lazy="selectin",
    )


class CountryTable(Base):
    __tablename__ = "countries"

    country_name: Mapped[str] = mapped_column(String, unique=True, nullable=False)

    films: Mapped[list["FilmTable"]] = relationship(
        back_populates="countries",
        secondary="film_country_association",
    )


class GenreTable(Base):
    __tablename__ = "genres"

    genre_name: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    films: Mapped[list["FilmTable"]] = relationship(
        back_populates="genres",
        secondary="film_genre_association",
    )


class CommentFilm(Base):
    __tablename__ = "comments"

    film_id = Column(
        UUID(as_uuid=True),
        ForeignKey("films.id"),
        nullable=False,
    )
    user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    username: Mapped[str] = mapped_column(String, nullable=False)
    rating: Mapped[float] = mapped_column(Float, nullable=False)
    comment: Mapped[str] = mapped_column(String, nullable=False)

    film: Mapped["FilmTable"] = relationship(
        back_populates="comments",
    )


class FilmActor(Base):
    __tablename__ = "film_actor"

    film_id = Column(
        UUID(as_uuid=True),
        ForeignKey("films.id"),
        nullable=False,
    )
    actor_id = Column(
        UUID(as_uuid=True),
        ForeignKey("actors.id"),
        nullable=False,
    )
    film: Mapped["FilmTable"] = relationship(
        back_populates="film_actors",
    )
    actor: Mapped["ActorTable"] = relationship(
        back_populates="actor_films",
    )
