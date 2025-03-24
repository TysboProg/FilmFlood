from abc import abstractmethod, ABC
from typing import List, Optional
from src.core.schemas import FilmModel, CreateCommentModel


class AbstractSerialRepository(ABC):
    @abstractmethod
    async def create_serial(self, film_model: FilmModel): ...

    @abstractmethod
    async def create_comment_to_serial(
        self, create_comment_model: CreateCommentModel
    ): ...

    @abstractmethod
    async def get_serials(self) -> List[FilmModel]: ...

    @abstractmethod
    async def get_serial_name_info(self, serial_name: str) -> FilmModel: ...

    @abstractmethod
    async def get_serial_filter_info(
        self, genre_name: str = None, country_name: str = None, rating: str = None
    ) -> Optional[List[FilmModel]]: ...

    @abstractmethod
    async def get_filters(self): ...
