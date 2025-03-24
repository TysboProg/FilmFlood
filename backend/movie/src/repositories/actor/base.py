from abc import ABC, abstractmethod
from typing import Optional
from src.core.schemas import ActorModel


class AbstractActorRepository(ABC):
    @abstractmethod
    async def get_actor_name_info(self, actor_name: str) -> Optional[ActorModel]: ...
