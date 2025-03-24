"use client"
import SerialContent from "@/components/SerialPage/SerialContent";
import { useParams } from "next/navigation";

export default function FilmPage() {
    const params = useParams()
    const serialName = (params.serialName as string)

    return (
        <main className="flex-1 bg-[#1c1c24]  w-full min-h-screen">
            <div className="container mx-auto px-4 py-6">
                <SerialContent serialName={decodeURIComponent(serialName)} />
            </div>
        </main>
    )
};

