"use client"
import Loading from "@/components/ui/loading"
import CommentDetails from "./CommentDetails"
import { FilmService } from "@/service/FilmService"
import Image from "next/image"
import {UserService} from "@/service/UserService";

const CommentContent = ({ filmName }: { filmName: string }) => {

    const { createCommentFilm, loading, data, error } = FilmService.useCreateCommentFilm()
    const getFilmVideo = FilmService.getFilmVideoInfo(filmName)
    const userId = localStorage.getItem("userId")

    const handleSubmit = async (rating: number, comment: string) => {
        if (rating === 0) {
            console.log("Пожалуйста, выберите рейтинг", "error")
            return
        }
        if (comment.trim() === "") {
            console.log("Пожалуйста, напишите комментарий", "error")
            return
        }

        await UserService.createCommentFilm(userId)
        createCommentFilm({comment: comment, rating: rating, film_name: filmName, userId: userId})
    }

    if (loading) {
        return <Loading />
    }

    if (error) {
        console.error(error)
        return <p>Произошла ошибка при загрузке комментариев.</p>
    }

    return (
        <div className="space-y-8">
            <CommentDetails handleSubmit={handleSubmit} />
            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Комментарии</h3>
                {getFilmVideo?.filmName && getFilmVideo?.filmName.length > 0 ? (
                    getFilmVideo?.filmName.comment.map((comment: any, index: any) => (
                        <div key={index} className="bg-gray-800 p-4 rounded-lg flex items-start space-x-4">
                            <Image
                                src={comment.userImage || "/placeholder.svg"}
                                alt={comment.username}
                                width={40}
                                height={40}
                                className="rounded-full"
                            />
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-semibold">{comment.username}</span>
                                    <span className="text-yellow-400">{"★".repeat(comment.rating)}</span>
                                </div>
                                <p>{comment.text}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>Пока нет комментариев.</p>
                )}
            </div>
        </div>
    )
}

export default CommentContent

