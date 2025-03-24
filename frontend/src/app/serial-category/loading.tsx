import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardHeader } from "@/components/ui/card"

export default function Loading() {
    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="pb-4">
                        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-4">
                            <Skeleton className="h-32 w-32 rounded-full" />
                            <div className="space-y-2 w-full">
                                <Skeleton className="h-8 w-48" />
                                <Skeleton className="h-4 w-72" />
                                <Skeleton className="h-4 w-64" />
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            </div>
        </div>
    )
}

