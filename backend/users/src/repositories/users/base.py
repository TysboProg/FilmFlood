from abc import ABC, abstractmethod
from uuid import UUID


class UsersAbstract(ABC):
    @abstractmethod
    async def get_user_by_id(self, user_id: UUID): ...