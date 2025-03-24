from abc import ABC, abstractmethod
from typing import Any, List, Dict

class KafkaAbstractConsumer(ABC):
    @abstractmethod
    def __init__(self, topic: str): ...

    @abstractmethod
    async def start(self): ...

    @abstractmethod
    async def stop(self): ...

    @abstractmethod
    async def get_messages(self, timeout_ms: int = 5000) -> list[Any] | List[Dict[str, Any]] | Dict[str, str]: ...