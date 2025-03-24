"use client"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { CalendarDays, Globe, Tag, User, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Audiowide } from "next/font/google"

const audiowide = Audiowide({
    weight: "400",
    subsets: ["latin"],
})

const renderValue = (value: any) => {
    if (typeof value === "string") return value
    if (typeof value === "number") return value.toString()
    if (Array.isArray(value)) return value.join(", ")
    if (value && typeof value === "object" && "name" in value) return value.name
    return "Не указано"
}

export default function SerialDetails({ serial }: any) {
    const router = useRouter()

    const handleActorClick = (actorName: string) => {
        const formattedName = encodeURIComponent(actorName)
        router.push(`/actor/${formattedName}`)
    }

    const handleWatchMovie = () => {
        const formattedName = encodeURIComponent(serial.filmName)
        router.push(`/movie/${formattedName}`)
    }

    // Helper function to clean up genre and country names
    const cleanText = (text: string) => {
        return text.replace(/^.*?['"](.*)['"].*$/, '$1'); // Regex to extract inner text
    }

    // Clean genres and countries data before rendering
    const cleanedGenres = serial.genres ? serial.genres.map((genre: string) => cleanText(genre)) : []
    const cleanedCountries = serial.countries ? serial.countries.map((country: string) => cleanText(country)) : []

    return (
        <div className="bg-[#1c1c24] rounded-xl shadow-xl overflow-hidden" style={audiowide.style}>
            <div className="flex flex-col md:flex-row items-center md:items-start">
                <div className="flex justify-center p-4 w-full md:w-1/3 lg:w-1/4">
                    <div className="relative w-[200px] h-[300px] md:w-[300px] md:h-[450px]">
                        <Image
                            src={serial.posterUrl || "/placeholder.svg"}
                            alt={renderValue(serial.filmName)}
                            className="rounded-lg object-contain"
                            fill
                        />
                    </div>
                </div>
                <div className="p-4 md:p-8 w-full md:w-2/3 lg:w-3/4">
                    <h1 className="block mt-1 text-3xl md:text-4xl leading-tight font-bold text-white">
                        {renderValue(serial.filmName)}
                    </h1>
                    <p className="mt-2 text-gray-400 text-sm md:text-base">{renderValue(serial.description)}</p>

                    <div className="flex items-center gap-3 mt-3">
                        <div className="bg-[#ffcc00] text-black font-bold px-2 py-1 rounded text-sm">{serial.rating}</div>
                        <div className="text-white/70 text-sm border border-white/20 px-2 py-1 rounded">{serial.ageRating}</div>
                        <div className="text-white/70 text-sm border border-white/20 px-2 py-1 rounded">{serial.watchTime} мин</div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                        <InfoItem icon={CalendarDays} label="Год выпуска" value={serial.yearProd} />
                        <InfoItem icon={Globe} label="Страна" value={cleanedCountries.join(", ")} />
                    </div>

                    <div className="mt-6">
                        <h2 className="text-lg md:text-xl font-semibold text-white flex items-center">
                            <Tag className="h-5 w-5 mr-2 text-[#ff3e3e]" />
                            Жанры
                        </h2>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {cleanedGenres.length > 0 ? (
                                cleanedGenres.map((genre: any, index: any) => (
                                    <span key={index} className="px-3 py-1 rounded-full text-sm font-medium bg-[#2a2a36] text-white">
                                        {genre}
                                    </span>
                                ))
                            ) : (
                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-[#2a2a36] text-white">
                                    Жанр не указан
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="mt-8">
                        <Button
                            onClick={handleWatchMovie}
                            className="bg-[#ff3e3e] hover:bg-[#e62e2e] text-white font-bold py-3 px-6 rounded-md inline-flex items-center"
                        >
                            <Play className="h-5 w-5 mr-2 fill-white" />
                            Смотреть фильм
                        </Button>
                    </div>
                </div>
            </div>

            <div className="p-4 md:p-8 border-t border-[#2a2a36] mt-4">
                <h2 className="text-xl md:text-2xl font-semibold text-white flex items-center mb-4">
                    <User className="h-6 w-6 mr-2 text-[#ff3e3e]" />
                    Актеры
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {serial.actors &&
                        serial.actors.map((actor: any, index: any) => (
                            <div
                                key={index}
                                onClick={() => handleActorClick(actor.actorName)}
                                className="bg-[#2a2a36] rounded-lg overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                            >
                                <div className="relative w-full h-36 sm:h-48">
                                    <Image
                                        src={actor.posterUrl || "/poster-not.jpg"}
                                        alt={actor.actorName}
                                        layout="fill"
                                        objectFit="cover"
                                    />
                                </div>
                                <div className="p-2 sm:p-4">
                                    <h3 className="text-sm sm:text-base font-semibold text-white">{actor.actorName}</h3>
                                    <p className="text-gray-400 text-xs">Год рождения: {actor.dateOfBirth || "Не указано"}</p>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    )
}

function InfoItem({ icon: Icon, label, value }: any) {
    return (
        <div className="flex items-center text-gray-400 text-sm md:text-base">
            <Icon className="h-5 w-5 mr-2 text-[#ff3e3e]" />
            <span>
                <span className="font-medium text-white">{label}:</span> {renderValue(value)}
            </span>
        </div>
    )
}
