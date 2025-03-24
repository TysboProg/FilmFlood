'use client';
import FilmMovieContent from "@/components/MoviePage/MovieContent";
import { useParams } from "next/navigation";

export default function FilmMoviePage() {
    const params = useParams();
    const filmName = decodeURIComponent(params.filmName as string);

    return (
        <main className="flex-1 flex justify-center p-6">
            <FilmMovieContent filmName={filmName} />
        </main>
    );
}
