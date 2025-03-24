from strawberry import type, field
from src.controller.schema.schemas import ActorType
from src.service.actors import ActorService


@type
class GetActorName:
    @field
    @staticmethod
    async def get_actor_name(actor_name: str) -> ActorType:
        actor = await ActorService.get_actor_info(actor_name=actor_name)

        actor_type = ActorType(
            actor_name=actor.actor_name,
            career=actor.career,
            date_of_birth=actor.date_of_birth,
            place_of_birth=actor.place_of_birth,
            sex=actor.sex,
            age=actor.age,
            films=actor.films,
            growth=actor.growth,
            biography=actor.biography,
            poster_url=actor.poster_url,
        )

        return actor_type
