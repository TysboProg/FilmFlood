"use client"
import Image from "next/image"
import Link from "next/link"
import { CalendarDays, Ruler, Film, MapPin, Briefcase, User, Star, Clock } from "lucide-react"
import { Audiowide } from "next/font/google"

const audiowide = Audiowide({
    weight: "400",
    subsets: ["latin"],
})

export default function ActorDetails({ actor }: any) {
    const colors = {
        background: "#1e2024",
        cardBackground: "#2a2c31",
        accent: "#e50914",
        textPrimary: "#ffffff",
        textSecondary: "#9ca3af",
        border: "#374151",
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: colors.background, ...audiowide.style }}>
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid md:grid-cols-[300px,1fr] gap-8">
                    <div className="space-y-6">
                        <div className="relative group">
                            <Image
                                src={actor.posterUrl || "/placeholder.svg"}
                                alt={actor.actorName || "Actor"}
                                className="rounded-lg max-w-[250px] mx-auto shadow-lg"
                                width={250}
                                height={350}
                                priority
                                style={{ borderWidth: "2px", borderStyle: "solid", borderColor: colors.accent }}
                            />
                            </div>
                        </div>

                        <div className="p-4 rounded-lg" style={{ backgroundColor: colors.cardBackground }}>
                            <h3
                                className="font-semibold mb-3 pb-2"
                                style={{ color: colors.accent, borderBottom: `1px solid ${colors.border}` }}
                            >
                                Информация
                            </h3>
                            <div className="space-y-3">
                                <InfoItem
                                    icon={CalendarDays}
                                    label="Дата рождения"
                                    value={actor.dateOfBirth}
                                    accentColor={colors.accent}
                                />
                                <InfoItem
                                    icon={Ruler}
                                    label="Рост"
                                    value={actor.growth ? `${actor.growth} см` : null}
                                    accentColor={colors.accent}
                                />
                                <InfoItem icon={MapPin} label="Место рождения" value={actor.placeOfBirth} accentColor={colors.accent} />
                                <InfoItem icon={User} label="Пол" value={actor.sex} accentColor={colors.accent} />
                                <InfoItem
                                    icon={CalendarDays}
                                    label="Возраст"
                                    value={actor.age ? `${actor.age} лет` : null}
                                    accentColor={colors.accent}
                                />
                                <InfoItem icon={Briefcase} label="Карьера" value={actor.career} accentColor={colors.accent} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl md:text-4xl font-bold" style={{ color: colors.textPrimary }}>
                                {actor.actorName || "Имя актера не указано"}
                            </h1>
                            <div className="h-8 w-1 rounded-full" style={{ backgroundColor: colors.accent }}></div>
                        </div>

                        <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: colors.cardBackground }}>
                            <h2 className="text-xl md:text-2xl font-semibold mb-4" style={{ color: colors.accent }}>
                                Биография
                            </h2>
                            <p className="text-sm md:text-base leading-relaxed" style={{ color: colors.textSecondary }}>
                                {actor.biography || "Биография отсутствует"}
                            </p>
                        </div>

                        <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: colors.cardBackground }}>
                            <div className="flex items-center justify-between mb-6">
                                <h2
                                    className="text-xl md:text-2xl font-semibold flex items-center"
                                    style={{ color: colors.textPrimary }}
                                >
                                    <Film className="h-6 w-6 mr-3" style={{ color: colors.accent }} />
                                    Фильмография
                                </h2>
                                <span className="text-sm flex items-center" style={{ color: colors.textSecondary }}>
                                    <Clock className="h-4 w-4 mr-1" />
                                    {actor.films?.length || 0} фильмов
                                </span>
                            </div>

                            {actor.films ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                    {actor.films.map((film: any, index: number) => (
                                        <Link key={film.id || index} href={`/film/${encodeURIComponent(film.filmName || "")}`}>
                                        <div
                                                className="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
                                                style={{ backgroundColor: colors.background }}
                                            >
                                                <div className="relative w-full h-48">
                                                    <Image
                                                        src={film.posterUrl || "/placeholder.svg"}
                                                        alt={film.filmName || "Без названия"}
                                                        fill
                                                        className="object-cover"
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                        priority
                                                    />
                                                    <div
                                                        className="absolute inset-0 flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)" }}
                                                    >
                                                        <div className="flex items-center gap-1 text-white text-xs">
                                                            <Star className="h-3 w-3" style={{ color: colors.accent }} />
                                                            <span>{film.rating}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-3">
                                                    <h3 className="font-semibold truncate text-sm" style={{ color: colors.textPrimary }}>
                                                        {film.filmName || "Название не указано"}
                                                    </h3>
                                                    <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                                                        {film.yearProd || "Год не указан"}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div
                                    className="text-center py-8 rounded-lg"
                                    style={{ backgroundColor: colors.background, color: colors.textPrimary }}
                                >
                                    Нет доступных фильмов
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
    )
}

function InfoItem({ icon: Icon, label, value, accentColor }: any) {
    if (!value) return null
    return (
        <div className="flex items-center gap-2" style={{ color: "#9ca3af" }}>
            <Icon className="h-5 w-5" style={{ color: accentColor }} />
            <span className="text-sm">
                <span className="font-medium" style={{ color: "#ffffff" }}>
                    {label}:
                </span>{" "}
                {value}
            </span>
        </div>
    )
}
