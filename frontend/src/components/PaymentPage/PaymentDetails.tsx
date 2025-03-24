"use client"
import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail } from "lucide-react"

interface PaymentDetailsProps {
    handleSubmit: (email: string) => Promise<void>;
}

export default function PaymentDetails({ handleSubmit }: PaymentDetailsProps) {
    const [email, setEmail] = useState("")
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            await handleSubmit(email)
            setIsOpen(false)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="absolute top-[400px] left-[700px] bg-gradient-to-r from-red-900/50 to-zinc-900 rounded-xl p-8 text-center shadow-xl border border-red-900/20">
            <h2 className="text-3xl font-bold mb-4 text-white">Интересует подписка?</h2>
            <p className="text-xl text-zinc-300 mb-6 max-w-2xl mx-auto">
                Присоединись к счастливчикам, которые смотрят фильмы и сериалы в неограниченном доступе.
            </p>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-6 rounded-md text-lg border-none shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105">
                        Начать пробную версию
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-gradient-to-b from-zinc-900 to-zinc-950 border border-red-900/30 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl text-white">Начните бесплатную пробную версию</DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Введите вашу электронную почту для 7-дневной бесплатной пробной версии.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleFormSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="flex items-center gap-4">
                                <Label htmlFor="email" className="text-right w-20 flex-shrink-0 text-zinc-300">
                                    Почта
                                </Label>
                                <div className="relative flex-1">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 h-4 w-4" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="example@mail.com"
                                        className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <p className="text-sm text-zinc-400 mt-2 text-center">
                                Мы отправим подтверждение на указанную почту
                            </p>
                        </div>
                        <DialogFooter className="sm:justify-between">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                                disabled={isLoading}
                            >
                                Отмена
                            </Button>
                            <Button
                                type="submit"
                                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-none"
                                disabled={isLoading}
                            >
                                {isLoading ? "Загрузка..." : "Начать пробную версию"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <p className="mt-4 text-zinc-400">Первые 7 дней подписка бесплатная</p>
        </div>
    )
}