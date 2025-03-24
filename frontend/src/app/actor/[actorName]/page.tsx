'use client'
import { Card, CardContent } from '@/components/ui/card';
import ActorContent from "@/components/Actor/ActorContent";
import { useParams } from "next/navigation";

export default function ActorPage() {
    const params = useParams()
    const actorName = (params.actorName as string)

    return (
        <main className="flex-1 flex justify-center p-6">
            <Card className="max-w-4xl w-full bg-gray-700 border-[#e50914]">
                <CardContent className="p-6">
                    <ActorContent actorName={decodeURIComponent(actorName)} />
                </CardContent>
            </Card>
        </main>
    )
};

