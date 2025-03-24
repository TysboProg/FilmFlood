'use client'
import Loading from "@/components/ui/loading"
import FilmDetails from "@/components/FilmPage/FilmDetails";
import { FilmService } from "@/service/FilmService";

export default function FilmContent({ filmName }: { filmName: string }) {
    const filmNameInfo = FilmService.getFilmNameInfo(filmName)

    if (filmNameInfo?.loading) {
        return <Loading />
    }

    if (!filmNameInfo?.filmName || filmNameInfo.error) {
        return "Страница не найдена"
    }

    return <FilmDetails film={filmNameInfo?.filmName} />
}