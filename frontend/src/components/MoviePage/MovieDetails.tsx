import VideoPlayer from "./CustomPlayer/CustomPlayer"
import { Audiowide } from 'next/font/google'
import CommentContent from "./Comment/CommentContent"

interface FilmMovieDetailsProps {
    film_name: string
    videoUrl: string
    showError: (message: string) => void
}

const audiowide = Audiowide({
    weight: "400",
    subsets: ["latin"],
})

export default function MovieDetails({ film_name, videoUrl, showError }: FilmMovieDetailsProps) {
    const handlePlayerError = () => {
        const errorMessage = `Ошибка при воспроизведении видео: Ссылка на фильм не получена`
        showError(errorMessage)
    }

    return (
        <div className="min-h-screen bg-[#1A1B23] text-white" style={audiowide.style}>
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
                        {film_name}
                    </h2>

                    <div className="mb-8 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(255,0,0,0.15)]">
                        <VideoPlayer videoUrl={videoUrl} onError={handlePlayerError} />
                    </div>
                </div>
            </main>
            <div className="bg-[#12131A] py-8 border-t border-gray-800">
                <div className="container mx-auto px-4 max-w-5xl">
                    <CommentContent filmName={film_name} />
                </div>
            </div>
        </div>
    )
}
