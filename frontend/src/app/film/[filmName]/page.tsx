"use client"
import FilmContent from "@/components/FilmPage/FilmContent";
import { useParams } from "next/navigation";

export default function FilmPage() {
    const params = useParams()
    const filmName = (params.filmName as string)

    return (
        <main className="flex-1 bg-[#1c1c24]  w-full min-h-screen">
            <div className="container mx-auto px-4 py-6">
                    <FilmContent filmName={decodeURIComponent(filmName)} />
            </div>
        </main>
    )
};

