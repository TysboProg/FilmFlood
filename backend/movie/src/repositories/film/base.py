from abc import abstractmethod, ABC
from typing import List, Optional
from src.core.schemas import FilmModel, CreateCommentModel
from src.core.database.models import FilmTable


class AbstractFilmRepository(ABC):
    @abstractmethod
    def _serialize_film(self, film: FilmTable) -> dict: ...

    @abstractmethod
    async def create_film(self, film_model: FilmModel): ...

    @abstractmethod
    async def create_comment_to_film(
        self, create_comment_model: CreateCommentModel
    ): ...

    @abstractmethod
    async def get_films(self) -> List[FilmModel]: ...

    @abstractmethod
    async def get_film_name_info(self, film_name: str) -> FilmModel: ...

    @abstractmethod
    async def get_film_filter_info(
        self, genre_name: str = None, country_name: str = None, rating: str = None
    ) -> Optional[List[FilmModel]]: ...

    @abstractmethod
    async def get_filters(self): ...
