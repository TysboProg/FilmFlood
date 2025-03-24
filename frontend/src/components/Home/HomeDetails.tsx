"use client"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Play, Star, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Audiowide } from "next/font/google"
import { motion } from "framer-motion"
import { useMediaQuery } from "@/hooks/use-media-query"

const audiowide = Audiowide({
    weight: "400",
    subsets: ["latin"],
})

interface MovieItem {
    filmName: string
    posterUrl: string
    previewUrl?: string
    textUrl?: string
    yearProd?: number
    rating?: string
}

interface MovieDetailsProps {
    films: MovieItem[] | MovieItem
    serials: MovieItem[] | MovieItem
    featured?: MovieItem
}

export default function HomeDetails({ films = [], serials = [] }: MovieDetailsProps) {
    // Process input arrays safely
    const filmsArray = (Array.isArray(films) ? films : [films]).filter(Boolean)
    const serialsArray = (Array.isArray(serials) ? serials : [serials]).filter(Boolean)

    // Responsive breakpoints
    const isMobile = useMediaQuery("(max-width: 640px)")
    const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1023px)")

    // Calculate items per view based on screen size
    const getItemsPerView = () => {
        if (isMobile) return 2
        if (isTablet) return 3
        return 6
    }

    const itemsPerView = getItemsPerView()

    // State for featured items
    const [featuredItems, setFeaturedItems] = useState<MovieItem[]>([])
    const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0)
    const [isTransitioning, setIsTransitioning] = useState(false)

    // State for film and serial carousels
    const [filmStartIndex, setFilmStartIndex] = useState(0)
    const [serialStartIndex, setSerialStartIndex] = useState(0)
    const [isFilmSliding, setIsFilmSliding] = useState(false)
    const [isSerialSliding, setIsSerialSliding] = useState(false)

    // Use refs to prevent dependency issues in useEffect
    const filmsRef = useRef(filmsArray)
    const serialsRef = useRef(serialsArray)

    // Update refs when props change
    useEffect(() => {
        filmsRef.current = filmsArray
        serialsRef.current = serialsArray
    }, [filmsArray, serialsArray])

    // Select random featured items - only run once on mount
    useEffect(() => {
        // Function to select random items
        const selectRandomFeatured = () => {
            const allMedia = [...filmsRef.current, ...serialsRef.current].filter((item) => item && item.posterUrl)

            // Shuffle and take up to 5 items
            const shuffled = [...allMedia].sort(() => 0.5 - Math.random())
            const selected = shuffled.slice(0, Math.min(5, shuffled.length))

            setFeaturedItems(selected)
        }

        selectRandomFeatured()
    }, []) // Empty dependency array - only run once on mount

    // Set up interval to change featured item
    useEffect(() => {
        if (featuredItems.length <= 1) return

        const changeFeature = () => {
            setIsTransitioning(true)

            // Wait for fade-out animation to complete
            setTimeout(() => {
                setCurrentFeaturedIndex((prev) => (prev === featuredItems.length - 1 ? 0 : prev + 1))

                // Wait a bit before starting fade-in animation
                setTimeout(() => {
                    setIsTransitioning(false)
                }, 100)
            }, 300) // Half of the transition duration
        }

        // Initial timeout to start the cycle
        const initialTimeout = setTimeout(changeFeature, 3000)

        // Set up the interval
        const interval = setInterval(changeFeature, 3000)

        return () => {
            clearTimeout(initialTimeout)
            clearInterval(interval)
        }
    }, [featuredItems])

    // Manual navigation for featured carousel
    const navigateFeatured = (direction: "prev" | "next") => {
        setIsTransitioning(true)

        setTimeout(() => {
            if (direction === "prev") {
                setCurrentFeaturedIndex((prev) => (prev === 0 ? featuredItems.length - 1 : prev - 1))
            } else {
                setCurrentFeaturedIndex((prev) => (prev === featuredItems.length - 1 ? 0 : prev + 1))
            }

            setTimeout(() => {
                setIsTransitioning(false)
            }, 100)
        }, 300)
    }

    // Navigation for films carousel
    const navigateFilms = (direction: "prev" | "next") => {
        if (isFilmSliding) return

        setIsFilmSliding(true)

        if (direction === "prev") {
            if (filmStartIndex > 0) {
                setFilmStartIndex((prev) => prev - 1)
            }
        } else {
            if (filmStartIndex < filmsArray.length - 1) {
                setFilmStartIndex((prev) => prev + 1)
            }
        }

        // Reset sliding state after animation completes
        setTimeout(() => {
            setIsFilmSliding(false)
        }, 300)
    }

    // Navigation for serials carousel
    const navigateSerials = (direction: "prev" | "next") => {
        if (isSerialSliding) return

        setIsSerialSliding(true)

        if (direction === "prev") {
            if (serialStartIndex > 0) {
                setSerialStartIndex((prev) => prev - 1)
            }
        } else {
            if (serialStartIndex < serialsArray.length - 1) {
                setSerialStartIndex((prev) => prev + 1)
            }
        }

        // Reset sliding state after animation completes
        setTimeout(() => {
            setIsSerialSliding(false)
        }, 300)
    }

    // Current featured item
    const currentFeatured = featuredItems[currentFeaturedIndex] || null

    // Calculate max index for films and serials to prevent showing empty cells
    const maxFilmIndex = Math.max(0, filmsArray.length - itemsPerView)
    const maxSerialIndex = Math.max(0, serialsArray.length - itemsPerView)

    return (
        <div className="min-h-screen bg-[#1c1c24] text-white" style={audiowide.style}>
            <div className="max-w-[1400px] mx-auto px-4 py-6">
                {/* Hero Featured Section */}
                <div className="relative rounded-2xl overflow-hidden mb-12 shadow-[0_0_40px_rgba(0,0,0,0.3)] border border-gray-800">
                    <div className="relative h-[300px] sm:h-[400px] md:h-[500px] w-full">
                        {/* Background image with transition */}
                        <div
                            className={cn(
                                "absolute inset-0 transition-opacity duration-1000",
                                isTransitioning ? "opacity-0" : "opacity-100",
                            )}
                        >
                            {currentFeatured && (
                                <Image
                                    src={currentFeatured.posterUrl || "/placeholder.svg"}
                                    alt={currentFeatured?.filmName || "No Title"}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
                        </div>

                        {/* Preview video/image if available - hide on mobile */}
                        {currentFeatured?.previewUrl && (
                            <div className="hidden md:block absolute top-8 right-8 w-1/3 h-2/5 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-gray-700">
                                <div
                                    className={cn(
                                        "w-full h-full transition-opacity duration-1000",
                                        isTransitioning ? "opacity-0" : "opacity-100",
                                    )}
                                >
                                    {currentFeatured?.previewUrl && (
                                        <Image
                                            src={currentFeatured.previewUrl || "/placeholder.svg"}
                                            alt={`Preview of ${currentFeatured?.filmName}`}
                                            fill
                                            className="object-cover"
                                        />
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Content with transition */}
                        <div
                            className={cn(
                                "absolute bottom-0 left-0 p-4 sm:p-6 md:p-10 max-w-full sm:max-w-md transition-all duration-1000",
                                isTransitioning ? "opacity-0 translate-y-8" : "opacity-100 translate-y-0",
                            )}
                        >
                            {currentFeatured?.textUrl ? (
                                <div className="flex h-10 sm:h-16 -left-[60px] mb-2 sm:mb-5 relative justify-center items-center">
                                    <Image
                                        src={currentFeatured?.textUrl || "/placeholder.svg"}
                                        alt={`${currentFeatured?.filmName} title`}
                                        width={500}
                                        height={200}
                                        className="object-contain max-w-full max-h-full"
                                    />
                                </div>
                            ) : (
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4 text-white drop-shadow-lg line-clamp-2">
                                    {currentFeatured?.filmName || "Featured Title"}
                                </h1>
                            )}

                            <div className="flex items-center gap-2 sm:gap-4 mt-2 sm:mt-6">
                                {currentFeatured?.rating && (
                                    <Badge className="bg-yellow-500 text-black px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-medium">
                                        <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5 sm:mr-1 inline fill-black" />
                                        {currentFeatured?.rating}
                                    </Badge>
                                )}
                                {currentFeatured?.yearProd && (
                                    <Badge
                                        variant="outline"
                                        className="px-2 sm:px-3 py-0.5 sm:py-1 text-white border-gray-500 text-xs sm:text-sm"
                                    >
                                        {currentFeatured?.yearProd}
                                    </Badge>
                                )}
                            </div>

                            <Link href={`/movie/${encodeURIComponent(currentFeatured?.filmName)}`}>
                                <div className="mt-4 sm:mt-8 flex items-center gap-4">
                                    <Button className="bg-red-600 hover:bg-red-700 rounded-full px-4 sm:px-8 py-2 sm:py-6 text-sm sm:text-base font-medium shadow-lg transition-transform hover:scale-105">
                                        <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 fill-white" /> Watch Now
                                    </Button>
                                </div>
                            </Link>
                        </div>

                        {/* Carousel Navigation */}
                        <div className="absolute bottom-4 sm:bottom-10 right-4 sm:right-10 flex gap-2 sm:gap-3">
                            <Button
                                size="icon"
                                variant="outline"
                                className="rounded-full h-8 w-8 sm:h-10 sm:w-10 bg-black/30 border-gray-600 hover:bg-gray-800"
                                onClick={() => navigateFeatured("prev")}
                            >
                                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                            </Button>
                            <Button
                                size="icon"
                                variant="outline"
                                className="rounded-full h-8 w-8 sm:h-10 sm:w-10 bg-black/30 border-gray-600 hover:bg-gray-800"
                                onClick={() => navigateFeatured("next")}
                            >
                                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                            </Button>
                        </div>

                        {/* Carousel Indicators */}
                        <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-2">
                            {featuredItems.map((_, index) => (
                                <div
                                    key={`indicator-${index}`}
                                    className={cn(
                                        "h-1 sm:h-1.5 rounded-full transition-all duration-300",
                                        currentFeaturedIndex === index
                                            ? "w-6 sm:w-8 bg-red-600"
                                            : "w-1.5 sm:w-2 bg-gray-500 cursor-pointer hover:bg-gray-400",
                                    )}
                                    onClick={() => {
                                        setIsTransitioning(true)
                                        setTimeout(() => {
                                            setCurrentFeaturedIndex(index)
                                            setTimeout(() => setIsTransitioning(false), 100)
                                        }, 500)
                                    }}
                                ></div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Films Section */}
                <section className="mb-10 sm:mb-16">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Фильмы</h2>
                        <div className="flex gap-2">
                            <Button
                                size="icon"
                                variant="outline"
                                className="rounded-full h-8 w-8 sm:h-9 sm:w-9 border-gray-700 bg-gray-700 hover:bg-gray-800 hover:text-white"
                                onClick={() => navigateFilms("prev")}
                                disabled={filmStartIndex === 0 || isFilmSliding}
                            >
                                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                            </Button>
                            <Button
                                size="icon"
                                variant="outline"
                                className="rounded-full h-8 w-8 sm:h-9 sm:w-9 border-gray-700 bg-gray-700 hover:bg-gray-800 hover:text-white"
                                onClick={() => navigateFilms("next")}
                                disabled={filmStartIndex >= maxFilmIndex || isFilmSliding}
                            >
                                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                            </Button>
                        </div>
                    </div>

                    <div className="relative overflow-hidden">
                        <motion.div
                            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-5"
                            initial={false}
                            animate={{
                                x: isMobile
                                    ? `calc(-${filmStartIndex * (100 / 2)}%)`
                                    : isTablet
                                        ? `calc(-${filmStartIndex * (100 / 3)}%)`
                                        : `calc(-${filmStartIndex * (100 / 6)}%)`,
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                                duration: 0.5,
                            }}
                            style={{
                                width: isMobile
                                    ? `calc(${(Math.max(filmsArray.length, 2) * 100) / 2}%)`
                                    : isTablet
                                        ? `calc(${(Math.max(filmsArray.length, 3) * 100) / 3}%)`
                                        : `calc(${(Math.max(filmsArray.length, 6) * 100) / 6}%)`,
                                gridTemplateColumns: isMobile
                                    ? `repeat(${Math.max(filmsArray.length, 2)}, minmax(0, 1fr))`
                                    : isTablet
                                        ? `repeat(${Math.max(filmsArray.length, 3)}, minmax(0, 1fr))`
                                        : `repeat(${Math.max(filmsArray.length, 6)}, minmax(0, 1fr))`,
                            }}
                        >
                            {filmsArray.length > 0 ? (
                                filmsArray.map((item, index) => (
                                    <Link
                                        key={`film-${index}`}
                                        href={item?.filmName ? `/film/${encodeURIComponent(item?.filmName)}` : "#"}
                                        className="group"
                                    >
                                        <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-gray-800 transition-all duration-300 ease-in-out group-hover:scale-105 group-hover:shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-gray-800 group-hover:border-gray-700">
                                            <Image
                                                src={item?.posterUrl || "/placeholder.svg?height=300&width=200"}
                                                alt={item?.filmName || "Poster"}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                            {/* Play button overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <div className="bg-red-600 rounded-full p-2 sm:p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                                                    <Play className="w-4 h-4 sm:w-6 sm:h-6 fill-white" />
                                                </div>
                                            </div>

                                            <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <h3 className="text-xs sm:text-sm font-medium truncate">{item?.filmName || "Untitled"}</h3>
                                                <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
                                                    {item?.yearProd && <p className="text-[10px] sm:text-xs text-gray-300">{item?.yearProd}</p>}
                                                    {item?.rating && (
                                                        <div className="flex items-center text-[10px] sm:text-xs text-yellow-500">
                                                            <Star className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 fill-yellow-500" />
                                                            {item?.rating}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-8 sm:py-12 text-gray-400 bg-gray-800/30 rounded-xl border border-gray-800">
                                    No films available
                                </div>
                            )}
                        </motion.div>
                    </div>
                </section>

                {/* Serials Section */}
                <section>
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Сериалы</h2>
                        <div className="flex gap-2">
                            <Button
                                size="icon"
                                variant="outline"
                                className="rounded-full h-8 w-8 sm:h-9 sm:w-9 border-gray-700 bg-gray-700 hover:bg-gray-800 hover:text-white"
                                onClick={() => navigateSerials("prev")}
                                disabled={serialStartIndex === 0 || isSerialSliding}
                            >
                                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                            </Button>
                            <Button
                                size="icon"
                                variant="outline"
                                className="rounded-full h-8 w-8 sm:h-9 sm:w-9 border-gray-700 bg-gray-700 hover:bg-gray-800 hover:text-white"
                                onClick={() => navigateSerials("next")}
                                disabled={serialStartIndex >= maxSerialIndex || isSerialSliding}
                            >
                                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                            </Button>
                        </div>
                    </div>

                    <div className="relative overflow-hidden">
                        <motion.div
                            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-5"
                            initial={false}
                            animate={{
                                x: isMobile
                                    ? `calc(-${serialStartIndex * (100 / 2)}%)`
                                    : isTablet
                                        ? `calc(-${serialStartIndex * (100 / 3)}%)`
                                        : `calc(-${serialStartIndex * (100 / 6)}%)`,
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                                duration: 0.5,
                            }}
                            style={{
                                width: isMobile
                                    ? `calc(${(Math.max(serialsArray.length, 2) * 100) / 2}%)`
                                    : isTablet
                                        ? `calc(${(Math.max(serialsArray.length, 3) * 100) / 3}%)`
                                        : `calc(${(Math.max(serialsArray.length, 6) * 100) / 6}%)`,
                                gridTemplateColumns: isMobile
                                    ? `repeat(${Math.max(serialsArray.length, 2)}, minmax(0, 1fr))`
                                    : isTablet
                                        ? `repeat(${Math.max(serialsArray.length, 3)}, minmax(0, 1fr))`
                                        : `repeat(${Math.max(serialsArray.length, 6)}, minmax(0, 1fr))`,
                            }}
                        >
                            {serialsArray.length > 0 ? (
                                serialsArray.map((item, index) => (
                                    <Link
                                        key={`serial-${index}`}
                                        href={`/serial/${encodeURIComponent(item?.filmName)}`}
                                        className="group"
                                    >
                                        <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-gray-800 transition-all duration-300 ease-in-out group-hover:scale-105 group-hover:shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-gray-800 group-hover:border-gray-700">
                                            <Image
                                                src={item?.posterUrl || "/placeholder.svg?height=300&width=200"}
                                                alt={item?.filmName || "Poster"}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                            {/* Play button overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <div className="bg-red-600 rounded-full p-2 sm:p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                                                    <Play className="w-4 h-4 sm:w-6 sm:h-6 fill-white" />
                                                </div>
                                            </div>

                                            <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <h3 className="text-xs sm:text-sm font-medium truncate">{item?.filmName || "Untitled"}</h3>
                                                <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
                                                    {item?.yearProd && <p className="text-[10px] sm:text-xs text-gray-300">{item?.yearProd}</p>}
                                                    {item?.rating && (
                                                        <div className="flex items-center text-[10px] sm:text-xs text-yellow-500">
                                                            <Star className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 fill-yellow-500" />
                                                            {item?.rating}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-8 sm:py-12 text-gray-400 bg-gray-800/30 rounded-xl border border-gray-800">
                                    No serials available
                                </div>
                            )}
                        </motion.div>
                    </div>
                </section>
            </div>
        </div>
    )
}

