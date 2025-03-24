from src.repositories.actor.actors import ActorRepository
from src.core.schemas import ActorModel

actor_repository = ActorRepository()


class ActorService:
    @staticmethod
    async def get_actor_info(actor_name: str):
        """
        Возвращает полную информацию про актера по его имени
        """
        actor_data = await actor_repository.get_actor_name_info(actor_name=actor_name)

        actor = ActorModel(
            actor_name=actor_data.actor_name,
            career=actor_data.career,
            date_of_birth=actor_data.date_of_birth,
            place_of_birth=actor_data.place_of_birth,
            sex=actor_data.sex,
            age=actor_data.age,
            films=actor_data.films,
            growth=actor_data.growth,
            biography=actor_data.biography,
            poster_url=actor_data.poster_url,
        )

        return actor
