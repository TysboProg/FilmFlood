"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Heart, Home, Menu, X, HandCoins } from "lucide-react"
import { Audiowide } from "next/font/google"

const audiowide = Audiowide({
    weight: "400",
    subsets: ["latin"],
})

const navItems = [
    { title: "Главная", icon: Home, to: "/" },
    { title: "Фильмы", icon: Heart, to: "/film-category" },
    { title: "Сериалы", icon: Calendar, to: "/serial-category" },
    {title: "Подписка", icon: HandCoins, to: "/payment"}
]

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(true)
    const [isMobile, setIsMobile] = useState(false)
    const pathname = usePathname()
    const sidebarRef = useRef<HTMLDivElement>(null)

    // Determine active item based on current path
    const activeIndex = navItems.findIndex((item) => item.to === pathname)

    // Ensure default position is on "Главная" (index 0) if no match found
    const currentActiveIndex = activeIndex === -1 ? 0 : activeIndex

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768
            setIsMobile(mobile)
            if (mobile) {
                setIsOpen(false)
            } else {
                setIsOpen(true)
            }
        }

        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    const toggleMenu = () => setIsOpen(!isOpen)

    // Calculate sidebar width based on state
    const sidebarWidth = isMobile && !isOpen ? 70 : 280

    return (
        <div className="flex" style={audiowide.style}>
            <motion.aside
                ref={sidebarRef}
                initial={{ width: isMobile ? 70 : 280 }}
                animate={{ width: sidebarWidth }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] }}
                className="fixed left-0 top-0 h-full bg-[#1c1c24] text-white z-50 overflow-hidden flex flex-col shadow-xl border-r border-[#2a2a36]"
            >
                {/* Logo */}
                <div className="p-6 border-b border-[#2a2a36] flex items-center h-[80px]">
                    <div className="flex items-center">
                        <span className="font-bold text-xl">Film</span>
                        <motion.span
                            className="font-bold text-xl text-[rgb(239,68,68)]"
                            animate={{ opacity: isMobile && !isOpen ? 0 : 1 }}
                            transition={{ duration: 0.2 }}
                        >
                            FLOOD
                        </motion.span>
                    </div>
                </div>

                {/* Navigation */}
                <div className="p-6 flex-1">
                    <motion.p
                        className="text-xs text-[#9ca3af] mb-6 font-medium uppercase tracking-wider"
                        animate={{ opacity: isMobile && !isOpen ? 0 : 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        News Feed
                    </motion.p>

                    <ul className="relative space-y-8">
                        {/* Animated background circle - fixed positioning */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`circle-${currentActiveIndex}`}
                                style={{ left: isMobile ? "-9px" : "9px" }}
                                className="absolute left-[9px] top-6 w-11 h-11 rounded-full bg-[rgb(239,68,68)] z-0"
                                initial={{
                                    y: currentActiveIndex * 52 + 5, // Added offset for better centering
                                    opacity: 0.9,
                                    scale: 1.1,
                                }}
                                animate={{
                                    y: currentActiveIndex * 71 - 23, // Added offset for better centering
                                    opacity: 0.9,
                                    scale: 1.1,
                                }}
                                exit={{ opacity: 0 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 30,
                                }}
                            />
                        </AnimatePresence>

                        {navItems.map((item, index) => (
                            <li key={item.title} className="flex items-center group cursor-pointer h-10 relative z-10">
                                <Link href={item.to} className="flex items-center w-full">
                                    {index === currentActiveIndex && (
                                        <motion.div
                                            className="absolute left-0 w-1 h-10 bg-[rgb(239,68,68)] rounded-r-md"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.2 }}
                                        />
                                    )}
                                    <div className="flex items-center gap-5 pl-3">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                index === currentActiveIndex
                                                    ? "text-white"
                                                    : "text-[#9ca3af] hover:text-white transition-colors"
                                            }`}
                                            style={isMobile ? { marginLeft: "-20px" } : {}}
                                        >
                                            <item.icon size={20} />
                                        </div>
                                        <motion.span
                                            className={`${
                                                index === currentActiveIndex
                                                    ? "font-medium text-white"
                                                    : "text-[#9ca3af] group-hover:text-white"
                                            } transition-all duration-200 whitespace-nowrap`}
                                            animate={{
                                                opacity: isMobile && !isOpen ? 0 : 1,
                                                x: isMobile && !isOpen ? -10 : 0,
                                            }}
                                            transition={{ duration: 0.1 }}
                                        >
                                            {item.title}
                                        </motion.span>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Mobile Toggle Button */}
                {isMobile && (
                    <div className="flex justify-center py-4 border-t border-[#2a2a36]">
                        <button
                            onClick={toggleMenu}
                            className="p-2 rounded-full bg-[rgb(239,68,68)] hover:bg-[rgb(220,38,38)] transition-colors duration-200 shadow-md"
                            style={{ boxShadow: "0 4px 10px rgba(239, 68, 68, 0.3)" }}
                            aria-label="Toggle menu"
                        >
                            {isOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                )}
            </motion.aside>

            {/* Main content spacer */}
            <div className="flex-grow transition-all duration-300" style={{ marginLeft: `${sidebarWidth}px` }} />
        </div>
    )
}