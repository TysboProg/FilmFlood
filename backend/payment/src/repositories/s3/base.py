from abc import ABC, abstractmethod

class S3Abstract(ABC):
    @abstractmethod
    def __init__(self): ...

    @abstractmethod
    async def upload_to_s3(self, file_bytes: bytes, s3_path: str): ...

    @abstractmethod
    async def generate_presigned_url(self, file_name: str) -> str: ...