"use client"
import MovieContent from "@/components/Home/HomeContent"

export default function HomePage() {
    return (
        <main className="flex-1 bg-[#1c1c24]  w-full min-h-screen">
            <div className="container mx-auto px-4 py-6">
                <MovieContent />
            </div>
        </main>
    )
}