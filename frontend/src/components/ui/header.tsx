"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Menu, X, User, LogOut, UserCog } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuthService } from "@/service/AuthService"
import { Roboto_Slab } from "next/font/google"
import { DynamicMovieSearch } from "@/components/ui/dynamicInput/dynamic_input"
import { UserService } from "@/service/UserService"

const aubrey = Roboto_Slab({ subsets: ["latin"], weight: "400" })

export default function Header() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [menuVisible, setMenuVisible] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [userProfileImage, setUserProfileImage] = useState<string | null>(null) // Состояние для хранения изображения профиля
    const router = useRouter()

    useEffect(() => {
        // Проверяем, что код выполняется на клиенте
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("accessToken")
            const userId = localStorage.getItem("userId")
            const is_subscribe = localStorage.getItem("is_subscribe")
            setIsAuthenticated(!!token && !!userId && !!is_subscribe)

            // Загружаем изображение профиля, если пользователь аутентифицирован
            if (userId) {
                UserService.getUserProfile(userId)
                    .then((profile) => {
                        if (profile) {
                            setUserProfileImage(profile.userImage) // Сохраняем изображение профиля в состоянии
                        }
                    })
                    .catch((error) => {
                        console.error("Ошибка при загрузке изображения профиля:", error)
                    })
            }
        }
    }, [])

    const handleProfileClick = () => {
        router.push("/profile")
        setMenuVisible(false)
        setMobileMenuOpen(false)
    }

    async function handleLogout() {
        setIsAuthenticated(false)
        await AuthService.logoutUser()
        setMenuVisible(false)
        setMobileMenuOpen(false)
    }

    const toggleMenu = () => setMenuVisible(!menuVisible)
    const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen)

    const handleAuthClick = () => {
        router.push("/login")
        setMobileMenuOpen(false)
    }

    return (
        <div className="bg-[#1c1d24]" style={aubrey.style}>
            <div className="flex items-center justify-between mb-6 px-4 py-3">
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleMobileMenu}
                        className="md:hidden w-8 h-8 rounded-full bg-[#2a2c36] flex items-center justify-center border border-gray-700"
                    >
                        {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                    </button>
                </div>

                <div className="hidden md:block w-1/3 max-w-md">
                    <DynamicMovieSearch />
                </div>

                <div className="flex items-center gap-4">
                    {isAuthenticated ? (
                        <div className="relative">
                            <div onClick={toggleMenu} className="w-8 h-8 rounded-full overflow-hidden cursor-pointer">
                                {userProfileImage && (
                                    <Image
                                        src={userProfileImage}
                                        alt="Profile"
                                        width={64}
                                        height={64}
                                        className="object-cover"
                                    />
                                )}
                            </div>
                            <AnimatePresence>
                                {menuVisible && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute top-10 right-0 bg-[#2a2c36] rounded-lg shadow-lg p-2 flex flex-col space-y-2 w-48 border border-gray-700 z-50"
                                    >
                                        <Button
                                            onClick={handleProfileClick}
                                            variant="ghost"
                                            className="flex items-center space-x-2 text-left hover:bg-[#1c1d24] text-gray-200"
                                        >
                                            <UserCog className="h-4 w-4" />
                                            <span>Профиль</span>
                                        </Button>
                                        <Button
                                            onClick={handleLogout}
                                            variant="ghost"
                                            className="flex items-center space-x-2 text-left hover:bg-[#1c1d24] text-gray-200"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            <span>Выйти</span>
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <Button
                            onClick={handleAuthClick}
                            variant="outline"
                            className="rounded-full text-sm bg-[#2a2c36] border-gray-700 hover:bg-[#1c1d24]"
                        >
                            Войти
                        </Button>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="md:hidden py-4 px-4 bg-[#2a2c36] mb-6"
                    >
                        <div className="relative w-full mb-4">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search everything"
                                className="bg-[#1c1d24] text-sm rounded-full w-full pl-10 pr-4 py-2 focus:outline-none border border-gray-700"
                            />
                        </div>
                        <div className="space-y-2">
                            {isAuthenticated ? (
                                <>
                                    <Button
                                        onClick={handleProfileClick}
                                        variant="ghost"
                                        className="w-full justify-start text-gray-200 hover:bg-[#1c1d24]"
                                    >
                                        <User className="h-4 w-4 mr-2" />
                                        Профиль
                                    </Button>
                                    <Button
                                        onClick={handleLogout}
                                        variant="ghost"
                                        className="w-full justify-start text-gray-200 hover:bg-[#1c1d24]"
                                    >
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Выйти
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    onClick={handleAuthClick}
                                    variant="outline"
                                    className="w-full text-gray-200 border-gray-700 hover:bg-[#1c1d24]"
                                >
                                    Войти / Регистрация
                                </Button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}