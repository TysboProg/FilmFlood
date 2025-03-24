'use client'
import Loading from "@/components/ui/loading"
import ActorDetails from './ActorDetails'
import { FilmService } from "@/service/FilmService";

export default function ActorContent({ actorName }: { actorName: string }) {
    const actorNameInfo = FilmService.getActorNameInfo(actorName)

    if (actorNameInfo?.loading) {
        return <Loading />
    }

    if (!actorNameInfo?.actorName || actorNameInfo.error) {
        return "Страница не найдена"
    }

    return <ActorDetails actor={actorNameInfo.actorName} />
}