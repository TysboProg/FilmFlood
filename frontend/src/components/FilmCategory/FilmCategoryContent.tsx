"use client"
import Loading from "@/components/ui/loading"
import { useState, useEffect } from "react"
import { FilmService } from "@/service/FilmService"
import FilmCategoryDetails from "./FilmCategoryDetails"

// Define the interface to match the backend data format
interface Film {
    filmName: string;
    rating: number;
    yearProd: number;
    posterUrl: string;
    __typename: string;
}

export default function FilmCategoryContent() {
    const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [genre, setGenre] = useState<string>("")
    const [country, setCountry] = useState<string>("")
    const [rating, setRating] = useState<number>(0)

    // Get filter information
    const genresArray = FilmService.GetFiltresInfo()

    // Get films based on filters
    const getFilmForFilter = FilmService.getFilmForFilterInfo(genre, country, rating)

    // Handle filter changes
    const handleFilterChange = (filters: {
        genre: string | null
        country: string | null
        rating: number
    }) => {
        setGenre(filters.genre || "")
        setCountry(filters.country || "")
        setRating(filters.rating)
    }

    // Пока идет загрузка
    if (getFilmForFilter?.loading) {
        return <Loading />
    }

    // Если возникла ошибка
    if (getFilmForFilter?.error) {
        return <div className="text-center text-red-600">Не удалось загрузить фильмы</div>
    }

    const films = getFilmForFilter?.filmFilter
    // Если объект `films` пустой
    const filmsArray = Array.isArray(films) ? films : films ? [films] : []
    const convertedFilms = filmsArray.map((film) => ({
        ...film,
        yearProd: film.yearProd != null ? film.yearProd.toString() : "",
        rating: film.rating != null ? film.rating.toFixed(1) : "0.0",
    }))
    // Основной контент
    return (
        <FilmCategoryDetails
            categories={genresArray?.filtres || { genres: [], countries: [] }}
            setHoveredCategory={setHoveredCategory}
            hoveredCategory={hoveredCategory}
            setSelectedCategory={setSelectedCategory}
            selectedCategory={selectedCategory}
            films={convertedFilms}
            onFilterChange={handleFilterChange}
        />
    )
}
