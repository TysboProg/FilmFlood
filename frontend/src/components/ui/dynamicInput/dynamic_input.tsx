"use client"
import type React from "react"
import { useState, useMemo, useCallback } from "react"
import { Input } from "./input"
import { debounce } from "lodash"
import { Film, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { FilmService } from "@/service/FilmService"
import type { IFilmData } from "@/types/filmservice.interface"

export function DynamicMovieSearch() {
    const [searchTerm, setSearchTerm] = useState("")
    const getFilms = FilmService.getFilmsInfo()
    const router = useRouter()

    const debouncedSetSearchTerm = useCallback(
        debounce((term: string) => {
            setSearchTerm(term)
        }, 300),
        [],
    )

    const filteredMovies = useMemo(() => {
        if (!getFilms?.films || !Array.isArray(getFilms?.films)) return []
        return getFilms?.films.filter((film) => film.filmName.toLowerCase().includes(searchTerm.toLowerCase()))
    }, [searchTerm, getFilms?.films])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        debouncedSetSearchTerm(e.target.value)
    }

    const handleMovieClick = useCallback(
        (filmName: string) => {
            const formattedName = encodeURIComponent(filmName)
            router.push(`/film/${formattedName}`)
        },
        [router],
    )

    if (getFilms?.error) return <div>Error: {(getFilms?.error as Error).message}</div>

    return (
        <div className="w-full max-w-md mx-auto relative">
            <div className="relative">
                <Input
                    type="text"
                    placeholder="Search for a movie..."
                    onChange={handleInputChange}
                    className="pl-10 pr-4 py-2 w-full text-white bg-[#1c1d24] dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
            {searchTerm && (
                <ul className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-h-80 overflow-auto border border-gray-200 dark:border-gray-700">
                    {filteredMovies.length > 0 ? (
                        filteredMovies.map((film: IFilmData) => (
                            <li
                                key={film.id}
                                onClick={() => handleMovieClick(film.filmName)}
                                className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-150 ease-in-out"
                            >
                                <div className="flex items-center space-x-3">
                                    {film.posterUrl ? (
                                        <Image
                                            src={film.posterUrl || "/placeholder.svg"}
                                            alt={film.filmName}
                                            width={48}
                                            height={72}
                                            className="rounded-md object-cover"
                                            priority
                                        />
                                    ) : (
                                        <div className="w-12 h-18 bg-gray-200 dark:bg-gray-600 rounded-md flex items-center justify-center">
                                            <Film size={24} className="text-gray-400 dark:text-gray-500" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{film.filmName}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{film.yearProd?.toString()}</p>
                                    </div>
                                </div>
                            </li>
                        ))
                    ) : (
                        <li className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">No movies found</li>
                    )}
                </ul>
            )}
        </div>
    )
}

