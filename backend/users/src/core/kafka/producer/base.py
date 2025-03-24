from abc import abstractmethod, ABC


class KafkaAbstractProducer(ABC):
    @abstractmethod
    def __init__(self): ...

    @abstractmethod
    async def start(self): ...

    @abstractmethod
    async def stop(self): ...

    @abstractmethod
    async def send_json(self, topic: str, value): ...
