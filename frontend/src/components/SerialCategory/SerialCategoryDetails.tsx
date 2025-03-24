"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Play, Star, Filter, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Audiowide } from "next/font/google"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

const audiowide = Audiowide({
    weight: "400",
    subsets: ["latin"],
})

interface Film {
    id?: string
    filmName: string
    posterUrl: string
    yearProd: string
    rating?: string
    __typename?: string
    genre_name?: string
    country_name?: string
}

interface FilmCategoryDetailsProps {
    categories: {
        genres: string[]
        countries: string[]
    }
    serials: Film[]
    hoveredCategory: string | null
    selectedCategory: string | null
    setHoveredCategory: (category: string | null) => void
    setSelectedCategory: (category: string | null) => void
    onFilterChange: (filters: {
        genre: string | null
        country: string | null
        rating: number
    }) => void
}

export default function SerialCategoryDetails({
        categories,
        serials = [],
        hoveredCategory,
        selectedCategory,
        setHoveredCategory,
        setSelectedCategory,
        onFilterChange,
    }: FilmCategoryDetailsProps) {
    const [selectedGenre, setSelectedGenre] = useState<string | null>(selectedCategory)
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
    const [ratingFilter, setRatingFilter] = useState(0)
    const [activeTab, setActiveTab] = useState<"genres" | "countries">("genres")

    // Parse genres and countries from backend format
    const parseFilterString = (str: string) => {
        const match = str.match(/'([^']+)'/)
        return match ? match[1] : str
    }

    const genres =
        categories?.genres?.map((genreStr) => {
            const name = parseFilterString(genreStr)
            return {
                id: name,
                name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize first letter
            }
        }) || []

    const countries =
        categories?.countries?.map((countryStr) => {
            const name = parseFilterString(countryStr)
            return {
                id: name,
                name,
            }
        }) || []

    // Sync with parent component's selected category
    useEffect(() => {
        if (selectedCategory !== selectedGenre) {
            setSelectedGenre(selectedCategory)
        }
    }, [selectedCategory])

    // Handle filter changes with debounce to avoid too many requests
    useEffect(() => {
        if (onFilterChange) {
            const timeoutId = setTimeout(() => {
                onFilterChange({
                    genre: selectedGenre,
                    country: selectedCountry,
                    rating: ratingFilter,
                })
            }, 300)

            return () => clearTimeout(timeoutId)
        }
    }, [selectedGenre, selectedCountry, ratingFilter, onFilterChange])

    const handleGenreSelect = (genreId: string) => {
        const newGenre = selectedGenre === genreId ? null : genreId
        setSelectedGenre(newGenre)
        setSelectedCategory(newGenre)
    }

    const handleCountrySelect = (countryId: string) => {
        setSelectedCountry((prevCountry) => (prevCountry === countryId ? null : countryId))
    }

    const handleRatingChange = (value: number[]) => {
        setRatingFilter(value[0])
    }

    const clearFilters = () => {
        setSelectedGenre(null)
        setSelectedCategory(null)
        setSelectedCountry(null)
        setRatingFilter(0)
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0f0f17] to-[#1c1c28] text-white" style={audiowide.style}>
            <div className="max-w-[1400px] mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-700">
                        FilmFLOOD
                    </h1>
                    <div className="flex items-center mt-4 md:mt-0">
                        {(selectedGenre || selectedCountry || ratingFilter > 0) && (
                            <Badge
                                variant="outline"
                                className="flex items-center gap-2 px-4 py-2 bg-[#252536]/80 border-[#3a3a5a] backdrop-blur-sm"
                            >
                                <Filter className="w-4 h-4 text-red-500" />
                                <span className="text-sm">
                  {[
                      selectedGenre && `Genre: ${selectedGenre}`,
                      selectedCountry && `Country: ${selectedCountry}`,
                      ratingFilter > 0 && `Rating: ${ratingFilter}+`,
                  ]
                      .filter(Boolean)
                      .join(" • ")}
                </span>
                                <button onClick={clearFilters} className="ml-2 p-1 rounded-full hover:bg-[#3a3a5a] transition-colors">
                                    <X className="w-3 h-3" />
                                </button>
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Filter Section */}
                <div className="mb-10 bg-[#252536]/50 rounded-2xl p-6 border border-[#3a3a5a]/30 backdrop-blur-sm shadow-lg">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8">
                        <div className="space-y-6">
                            {/* Tabs for Genre/Country */}
                            <Tabs
                                defaultValue="genres"
                                className="w-full"
                                onValueChange={(value) => setActiveTab(value as "genres" | "countries")}
                            >
                                <TabsList className="grid grid-cols-2 w-full max-w-md bg-[#1a1a28] p-1 rounded-xl">
                                    <TabsTrigger
                                        value="genres"
                                        className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-700 data-[state=active]:text-white data-[state=active]:shadow-md"
                                    >
                                        Genres
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="countries"
                                        className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-700 data-[state=active]:text-white data-[state=active]:shadow-md"
                                    >
                                        Countries
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>

                            {/* Genre/Country Pills */}
                            <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                {activeTab === "genres"
                                    ? genres.map((genre) => (
                                        <button
                                            key={genre.id}
                                            onClick={() => handleGenreSelect(genre.id)}
                                            onMouseEnter={() => setHoveredCategory(genre.id)}
                                            onMouseLeave={() => setHoveredCategory(null)}
                                            className={cn(
                                                "px-4 py-2 rounded-xl text-sm transition-all duration-300",
                                                selectedGenre === genre.id
                                                    ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-900/20"
                                                    : hoveredCategory === genre.id
                                                        ? "bg-[#3a3a5a] text-white"
                                                        : "bg-[#1a1a28] text-gray-300 hover:bg-[#2a2a3a]",
                                            )}
                                        >
                                            {genre.name}
                                        </button>
                                    ))
                                    : countries.map((country) => (
                                        <button
                                            key={country.id}
                                            onClick={() => handleCountrySelect(country.id)}
                                            className={cn(
                                                "px-4 py-2 rounded-xl text-sm transition-all duration-300",
                                                selectedCountry === country.id
                                                    ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-900/20"
                                                    : "bg-[#1a1a28] text-gray-300 hover:bg-[#2a2a3a]",
                                            )}
                                        >
                                            {country.name}
                                        </button>
                                    ))}
                            </div>
                        </div>

                        {/* Rating Slider */}
                        <div className="flex flex-col md:flex-row items-center gap-6 md:border-l md:border-[#3a3a5a]/50 md:pl-8">
                            <div className="flex items-center gap-2">
                                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                <span className="text-sm font-medium whitespace-nowrap">Rating: {ratingFilter}+</span>
                            </div>
                            <div className="w-full max-w-xs">
                                <Slider
                                    defaultValue={[0]}
                                    max={10}
                                    step={0.5}
                                    value={[ratingFilter]}
                                    onValueChange={handleRatingChange}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            Results
                            <Badge variant="outline" className="ml-2 bg-[#252536] text-gray-300 border-[#3a3a5a]">
                                {serials.length} serials
                            </Badge>
                        </h2>

                        {(selectedGenre || selectedCountry || ratingFilter > 0) && (
                            <button
                                onClick={clearFilters}
                                className="text-sm text-red-500 hover:text-red-400 flex items-center gap-1 px-3 py-1 rounded-lg border border-red-500/20 hover:border-red-500/40 transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                                Clear filters
                            </button>
                        )}
                    </div>

                    {serials.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                            {serials.map((serial, index) => (
                                <Link
                                    key={serial.id || `film-${index}`}
                                    href={`/serial/${encodeURIComponent(serial.filmName)}`}
                                    className="group"
                                >
                                    <Card className="bg-[#1a1a28]/80 border-[#3a3a5a]/30 overflow-hidden h-full transition-all duration-300 hover:border-[#3a3a5a] hover:shadow-xl hover:shadow-black/20 rounded-xl">
                                        <div className="relative aspect-[2/3] overflow-hidden rounded-t-lg">
                                            <Image
                                                src={serial.posterUrl || "/placeholder.svg?height=300&width=200"}
                                                alt={serial.filmName || "Poster"}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                            {/* Play button overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-lg">
                                                    <Play className="w-6 h-6 fill-white" />
                                                </div>
                                            </div>

                                            {/* Rating badge */}
                                            {serial.rating && Number.parseFloat(serial.rating) > 0 && (
                                                <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-md px-2 py-1 flex items-center text-xs text-yellow-500">
                                                    <Star className="w-3 h-3 mr-0.5 fill-yellow-500" />
                                                    {serial.rating}
                                                </div>
                                            )}
                                        </div>
                                        <CardFooter className="p-3 flex flex-col items-start">
                                            <h3 className="text-sm font-medium truncate w-full group-hover:text-red-500 transition-colors">
                                                {serial.filmName || "Untitled"}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1 w-full">
                                                {serial.yearProd && (
                                                    <p className="text-xs text-gray-400 bg-[#252536] px-2 py-0.5 rounded-md">{serial.yearProd}</p>
                                                )}
                                                {serial.genre_name && <p className="text-xs text-gray-400 truncate ml-auto">{serial.genre_name}</p>}
                                            </div>
                                        </CardFooter>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <Card className="bg-[#1a1a28]/50 border-[#3a3a5a]/30 rounded-xl overflow-hidden shadow-lg">
                            <CardContent className="flex flex-col items-center justify-center py-20">
                                <div className="w-16 h-16 mb-4 rounded-full bg-[#252536] flex items-center justify-center">
                                    <Filter className="w-8 h-8 text-gray-500" />
                                </div>
                                <p className="text-gray-400 mb-4 text-lg">No films match your filters</p>
                                <button
                                    onClick={clearFilters}
                                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 rounded-lg text-white hover:from-red-700 hover:to-red-800 transition-colors shadow-md"
                                >
                                    Clear all filters
                                </button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Custom scrollbar styles */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #1a1a28;
                    border-radius: 10px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #3a3a5a;
                    border-radius: 10px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #4a4a6a;
                }
            `}</style>
        </div>
    )
}

