from abc import abstractmethod, ABC
from uuid import UUID
from pydantic import EmailStr


class AuthAbstract(ABC):
    @abstractmethod
    async def get_user_by_email(self, email: EmailStr): ...

    @abstractmethod
    async def get_user_by_id(self, user_id: str): ...

    @abstractmethod
    async def get_user_by_username_and_email(self, username: str, email: EmailStr): ...

    @abstractmethod
    async def create_user(
        self, username: str, email: EmailStr, hashed_password: str
    ) -> UUID: ...

    @abstractmethod
    async def update_user_tokens(self, user_id: str, token_id: str): ...

    @abstractmethod
    async def save_refresh_token(self, user_id: str, refresh_token: str): ...

    @abstractmethod
    async def delete_refresh_token(self, refresh_token: str): ...
