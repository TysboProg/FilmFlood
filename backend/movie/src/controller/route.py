from src.controller.film.route import *
from src.controller.serial.route import *
from src.controller.actor.route import *
from strawberry import type


@type
class Mutations(AddFilm, AddSerial, CreateCommentFilm, CreateCommentSerial):
    pass


@type
class Queries(
    GetFilms,
    GetSerials,
    GetFilmForName,
    GetSerialForName,
    GetActorName,
    GetSerialForGenre,
    GetFilmForFilter,
    GetFilmFilter
):
    pass
