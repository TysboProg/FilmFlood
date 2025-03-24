from abc import ABC, abstractmethod


class AbstractS3Repository(ABC):
    @abstractmethod
    async def get_url_movie(self, film_name: str): ...

    @abstractmethod
    async def get_url_serial(self, serial_name: str): ...

    @abstractmethod
    async def get_poster_actor(self, actor_name: str): ...

    @abstractmethod
    async def get_poster_film(self, film_name: str): ...

    @abstractmethod
    async def get_poster_serial(self, serial_name: str): ...

    @abstractmethod
    async def get_user_profile_image(self, user_id: str): ...
