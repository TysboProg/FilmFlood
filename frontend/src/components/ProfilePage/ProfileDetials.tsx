"use client";

import { Skeleton } from "@/components/ui/skeleton"
import { Mail, Calendar, Camera } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import ImageUpload from "./UploadImage"
import { Audiowide } from "next/font/google";
import PaymentHistory from "@/components/ProfilePage/PaymentHistory";

const audiowide = Audiowide({
    weight: "400",
    subsets: ["latin"]
})

function formatDate(dateString: string) {
    try {
        const date = new Date(dateString)
        return date.toLocaleDateString("ru-RU", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    } catch (error) {
        return "Дата недоступна"
    }
}
interface UserProfile {
    username: string
    email: string
    created_at: string
    updated_at: string
    userImage: string
}

interface Payment {
    id: string
    order_id: string
    number_order: string
    receipt_url: string
    order_date: string
    amount: number
}

interface ProfileDetailsProps {
    userData: UserProfile;
    loading: boolean;
    paymentData: Payment[]
}

export default function ProfileDetials({userData, loading, paymentData}: ProfileDetailsProps) {

     console.log(userData)
    if (loading || !userData) {
        return (
            <div className="min-h-screen bg-[#1E1F26] text-white p-4 md:p-8">
                <div className="max-w-5xl mx-auto">
                    <ProfileSkeleton />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#1E1F26] text-white" style={audiowide.style}>
            {/* Header with user info */}
            <div className="max-w-5xl mx-auto p-4 md:p-8">
                <Card className="bg-[#282A36] border-none shadow-lg overflow-hidden">
                    <div className="relative h-40 bg-gradient-to-r from-[#2D2F3A] to-[#1E1F26]">
                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#282A36] to-transparent"></div>
                    </div>

                    <CardContent className="pt-0 pb-6">
                        <div className="flex flex-col md:flex-row gap-6 relative">
                            {/* Avatar section */}
                            <div className="relative -mt-16 ml-6">
                                <Avatar className="h-28 w-28 border-4 border-[#282A36] shadow-lg">
                                    <AvatarImage src={userData.userImage} alt={userData.username} />
                                    <AvatarFallback className="bg-red-600">
                                        {userData.username?.[0]?.toUpperCase() ?? "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            className="absolute bottom-0 right-0 rounded-full p-2 bg-red-600 hover:bg-red-700 border-none"
                                        >
                                            <Camera className="h-4 w-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md bg-[#282A36] border-[#3A3D4A]">
                                        <DialogHeader>
                                            <DialogTitle className="text-white">Изменить фото профиля</DialogTitle>
                                        </DialogHeader>
                                        <ImageUpload currentImage={userData.userImage} />
                                    </DialogContent>
                                </Dialog>
                            </div>

                            {/* User info section */}
                            <div className="flex flex-col px-6 md:px-0 mt-4 md:mt-0">
                                <CardTitle className="text-2xl md:text-3xl font-bold mb-2">
                                    {userData.username}
                                </CardTitle>
                                <div className="flex flex-col space-y-2 text-sm text-gray-400">
                                    <div className="flex items-center space-x-2">
                                        <Mail className="h-4 w-4 text-red-500" />
                                        <span>{userData.email}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="h-4 w-4 text-red-500" />
                                        <span>Профиль создан: {formatDate(userData.created_at)}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="h-4 w-4 text-red-500" />
                                        <span>Последнее обновление: {formatDate(userData.updated_at)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="ml-auto mt-4 md:mt-0 px-6 md:px-0">
                                <Button className="bg-red-600 hover:bg-red-700 text-white border-none">
                                    Редактировать профиль
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <PaymentHistory payments={paymentData} />
            </div>
        </div>
    )
}

function ProfileSkeleton() {
    return (
        <Card className="bg-[#282A36] border-none shadow-lg overflow-hidden">
            <div className="h-40 bg-[#2D2F3A]"></div>
            <CardContent className="pt-0 pb-6">
                <div className="flex flex-col md:flex-row gap-6 relative">
                    <div className="relative -mt-16 ml-6">
                        <Skeleton className="h-28 w-28 rounded-full" />
                    </div>
                    <div className="flex flex-col px-6 md:px-0 mt-4 md:mt-0">
                        <Skeleton className="h-8 w-48 mb-4" />
                        <Skeleton className="h-4 w-72 mb-2" />
                        <Skeleton className="h-4 w-64 mb-2" />
                        <Skeleton className="h-4 w-56" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
