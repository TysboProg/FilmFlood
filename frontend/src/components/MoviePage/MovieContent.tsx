"use client"
import { FilmService } from "@/service/FilmService"
import NotFound from "@/app/not-found"
import MovieDetails from "./MovieDetails"
import Loading from "@/components/ui/loading"

export default function MovieContent({ filmName }: { filmName: string }) {
    const getVideoUrl = FilmService.getFilmVideoInfo(filmName)

    if (getVideoUrl?.loading) {
        return <Loading />
    }

    if (getVideoUrl?.error || !getVideoUrl?.filmName) {
        return <NotFound />
    }

    const showError = (message: string) => {
        console.log(message)
    }

    return (
        <>
            <MovieDetails film_name={filmName} videoUrl={getVideoUrl?.filmName.videoUrl} showError={showError} />
        </>
    )
}

