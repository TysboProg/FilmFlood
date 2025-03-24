import { useQuery, useMutation } from "@apollo/client";
import {
    GetFilmNameInfo,
    GetFilms,
    GetFilmForFilter,
    GetFilmVideo, GetFiltres
} from "@/graphql/queries/films";
import { GetActorName } from "@/graphql/queries/actors";
import {addCommentFilm} from "@/graphql/mutations/films";

export class FilmService {
    static getFilmNameInfo = (film_name: string) => {
        const {data, error, loading} = useQuery(GetFilmNameInfo, {
            variables: {film_name}
        });

        if (error) {
            console.error(error);
            return null;
        }

        const filmName = data?.getFilmName;

        return {
            filmName,
            error,
            loading
        };
    }

    static useCreateCommentFilm = () => {
        const [mutateFunction, { data, loading, error }] = useMutation(addCommentFilm);

        interface CreateCommentFilmArgs {
            film_name: string;
            comment: string;
            userId: string | null;
            rating: number;
        }

        const createCommentFilm = async ({ film_name, comment, userId, rating }: CreateCommentFilmArgs) => {
            try {
                const result = await mutateFunction({
                    variables: {
                        createCommentModel: {
                            comment: comment,
                            rating: rating,
                            userId: userId,
                            filmName: film_name
                    }
                    },
                });
                return result.data; // Возвращаем данные мутации
            } catch (err) {
                console.error("Ошибка при создании комментария:", err);
                throw err;
            }
        };

        return {
            createCommentFilm,
            loading,
            error,
            data,
        };
    };

    static getFilmsInfo = () => {
        const {data, error, loading} = useQuery(GetFilms);

        if (error) {
            console.error(error);
            return null;
        }

        const films = data?.getFilms;

        return {
            films,
            error,
            loading
        };
    };

    static getFilmForFilterInfo = (genre_name: string | null, country_name: string | null, rating: number | null) => {
        const {data, error, loading} = useQuery(GetFilmForFilter, {
            variables: {
                genre_name: genre_name,
                country_name: country_name,
                rating: rating
            }
        });

        if (error) {
            console.error(error);
            return null;
        }

        const filmFilter = data?.getFilmFilter

        return {
            filmFilter,
            error,
            loading
        };
    };

    static getFilmVideoInfo = (film_name: string) => {
        const {data, error, loading} = useQuery(GetFilmVideo, {
            variables: {
                film_name
            }
        });

        if (error) {
            console.error(error);
            return null;
        }

        const filmName = data?.getFilmName;

        return {
            filmName,
            error,
            loading
        };
    };

    static getActorNameInfo = (actor_name: string) => {
        const {data, error, loading} = useQuery(GetActorName, {
            variables: { actorName: actor_name }
        });

        if (error) {
            console.error(error);
            return null;
        }

        const actorName = data?.getActorName;

        return {
            actorName,
            error,
            loading
        };
    };

    static GetFiltresInfo = () => {
        const {data, error, loading} = useQuery(GetFiltres);

        if (error) {
            console.error(error);
            return null;
        }

        const filtres = data?.getFilmsFilters;

        return {
            filtres,
            error,
            loading
        };
    };
}
