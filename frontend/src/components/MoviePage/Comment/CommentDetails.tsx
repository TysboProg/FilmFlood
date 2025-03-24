"use client"

import { useState, type MouseEvent } from "react"
import { Star } from "lucide-react"

interface CommentDetailsProps {
    handleSubmit: (rating: number, comment: string) => void
}

export default function CommentDetails({ handleSubmit }: CommentDetailsProps) {
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState("")
    const [hoverRating, setHoverRating] = useState(0)

    const onSubmit = () => {
        handleSubmit(rating, comment)
        setRating(0)
        setComment("")
    }

    const handleTextareaMouseDown = (e: MouseEvent<HTMLTextAreaElement>) => {
        e.stopPropagation()
    }

    return (
        <div className="flex flex-col space-y-5 p-6 w-full max-w-2xl mx-auto bg-[#12131A] text-white rounded-xl border border-gray-800 shadow-lg">
            <h3 className="text-lg font-semibold">Оставить отзыв</h3>

            <div className="flex flex-col space-y-2">
                <label className="text-sm text-gray-400">Ваша оценка</label>
                <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            size={24}
                            className={`cursor-pointer transition-all duration-200 ${
                                star <= (hoverRating || rating)
                                    ? "text-red-500 fill-red-500 scale-110"
                                    : "text-gray-600 hover:text-gray-400"
                            }`}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                        />
                    ))}
                </div>
            </div>

            <div className="flex flex-col space-y-2">
                <label className="text-sm text-gray-400">Ваш комментарий</label>
                <textarea
                    className="w-full p-4 bg-[#1A1B23] border border-gray-700 rounded-lg
                              text-white placeholder-gray-500 focus:outline-none focus:border-red-500
                              resize-none transition-all duration-200"
                    rows={4}
                    placeholder="Поделитесь своими впечатлениями о фильме..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onMouseDown={handleTextareaMouseDown}
                />
            </div>

            <button
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg
                         hover:from-red-500 hover:to-red-600 transition-all duration-200
                         focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                         focus:ring-offset-[#12131A] font-medium shadow-md"
                onClick={onSubmit}
                disabled={!rating || !comment.trim()}
            >
                Отправить отзыв
            </button>
        </div>
    )
}

