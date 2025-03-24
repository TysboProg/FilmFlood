"use client"
import Loading from "@/components/ui/loading"
import { useState, useEffect } from "react"
import { FilmService } from "@/service/FilmService"
import SerialCategoryDetails from "@/components/SerialCategory/SerialCategoryDetails";
import {SerialService} from "@/service/SerialService";

// Define the interface to match the backend data format
interface Film {
    filmName: string;
    rating: number;
    yearProd: number;
    posterUrl: string;
    __typename: string;
}

export default function SerialCategoryContent() {
    const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [genre, setGenre] = useState<string>("")
    const [country, setCountry] = useState<string>("")
    const [rating, setRating] = useState<number>(0)

    // Get filter information
    const genresArray = FilmService.GetFiltresInfo()

    // Get films based on filters
    const getSerialForFilter = SerialService.getSerialForFilterInfo(genre, country, rating)

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
    if (getSerialForFilter?.loading) {
        return <Loading />
    }

    // Если возникла ошибка
    if (getSerialForFilter?.error) {
        return <div className="text-center text-red-600">Не удалось загрузить сериалы</div>
    }

    const serials = getSerialForFilter?.serialFilter
    // Если объект `films` пустой
    const serialsArray = Array.isArray(serials) ? serials : serials ? [serials] : []
    const convertedSerials = serialsArray.map((serial) => ({
        ...serial,
        yearProd: serial.yearProd != null ? serial.yearProd.toString() : "",
        rating: serial.rating != null ? serial.rating.toFixed(1) : "0.0",
    }))
    // Основной контент
    return (
        <SerialCategoryDetails
            categories={genresArray?.filtres || { genres: [], countries: [] }}
            setHoveredCategory={setHoveredCategory}
            hoveredCategory={hoveredCategory}
            setSelectedCategory={setSelectedCategory}
            selectedCategory={selectedCategory}
            serials={convertedSerials}
            onFilterChange={handleFilterChange}
        />
    )
}
