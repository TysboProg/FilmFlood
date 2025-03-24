import { useQuery } from "@apollo/client";
import {
    GetSerials,
    GetSerialNameInfo,
    GetSerialForFilter,
    GetSerialVideo
} from "@/graphql/queries/serials";
import { GetActorName } from "@/graphql/queries/actors";

export class SerialService {
    static getSerialNameInfo = (serial_name: string) => {
        const {data, error, loading} = useQuery(GetSerialNameInfo, {
            variables: {
                serial_name: serial_name
            }
        });

        if (error) {
            console.error(error);
            return null;
        }

        const serialName = data?.getSerialName;

        return {
            serialName,
            error,
            loading
        };
    }

    static getSerialsInfo = () => {
        const {data, error, loading} = useQuery(GetSerials);

        if (error) {
            console.error(error);
            return null;
        }

        const serials = data?.getSerials;

        return {
            serials,
            error,
            loading
        };
    }


    static getSerialForFilterInfo = (genre_name: string | null, country_name: string | null, rating: number | null) => {
        const {data, error, loading} = useQuery(GetSerialForFilter, {
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

        const serialFilter = data?.getSerialFilter

        return {
            serialFilter,
            error,
            loading
        };
    };

    static getSerialVideoInfo = (serial_name: string) => {
        const {data, error, loading} = useQuery(GetSerialVideo, {
            variables: {
                serial_name: serial_name
            }
        });

        if (error) {
            console.error(error);
            return null;
        }

        const serialName = data?.getSerialName;

        return {
            serialName,
            error,
            loading
        };
    };

    static getActorNameInfo = (actor_name: string) => {
        const {data, error, loading} = useQuery(GetActorName, {
            variables: {
                actorName: actor_name
            }
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
}
