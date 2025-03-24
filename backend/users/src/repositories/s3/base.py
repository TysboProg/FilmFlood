from abc import abstractmethod, ABC


class S3Abstract(ABC):
    @abstractmethod
    async def upload_to_s3(
        self, file_bytes: bytes, user_id: str, mime_type: str = None
    ): ...

    @abstractmethod
    async def get_profile_image(self, user_id: str): ...
