"use client"

import { useState } from "react"
import { useSession, signOut } from "@/lib/useSession"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { CaretDown, User, Gear, SignOut, ShieldCheck } from "phosphor-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export function ProfileDropdown() {
    const { data: session } = useSession()
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)

    const handleLogout = async () => {
        // Clear any cached data and sign out completely
        try {
            // Clear local storage and session storage
            localStorage.clear()
            sessionStorage.clear()
            
            // Sign out with redirect to login
            await signOut({
                callbackUrl: "/login",
                redirect: true,
            })
        } catch (error) {
            console.error('Logout error:', error)
            // Force redirect even if signOut fails
            window.location.href = "/login"
        }
    }

    if (!session?.user) {
        return null
    }

    return (
        <div className="relative">
            <Button
                onClick={() => setIsOpen(!isOpen)}
                variant="ghost"
                className="flex items-center gap-3 px-3 py-2 hover:bg-[rgba(55,50,47,0.05)] transition-all duration-200 font-sans font-medium text-[#37322F]"
            >
                <Avatar className="w-8 h-8 border border-[rgba(55,50,47,0.12)]">
                    <AvatarImage
                        src={session.user.image || ""}
                        alt={session.user.name || "User"}
                    />
                    <AvatarFallback className="bg-[oklch(0.6_0.2_45)] text-white font-semibold text-sm">
                        {session.user.name?.charAt(0) || "U"}
                    </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-[#37322F]">{session.user.name}</p>
                    <p className="text-xs text-[rgba(55,50,47,0.80)]">{session.user.email}</p>
                </div>
                <CaretDown
                    size={16}
                    weight="bold"
                    className={`transition-all duration-300 ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                />
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Dropdown */}
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute right-0 top-full mt-2 w-64 bg-white border border-[rgba(55,50,47,0.12)] shadow-lg rounded-lg z-50"
                        >
                            <div className="p-4 border-b border-[rgba(55,50,47,0.12)]">
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-12 h-12 border border-[rgba(55,50,47,0.12)]">
                                        <AvatarImage
                                            src={session.user.image || ""}
                                            alt={session.user.name || "User"}
                                        />
                                        <AvatarFallback className="bg-[oklch(0.6_0.2_45)] text-white font-semibold">
                                            {session.user.name?.charAt(0) || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="font-sans font-semibold text-[#37322F]">
                                            {session.user.name}
                                        </p>
                                        <p className="text-sm font-sans text-[rgba(55,50,47,0.80)]">
                                            {session.user.email}
                                        </p>
                                        <div className="flex items-center gap-1 mt-1">
                                            <ShieldCheck size={12} weight="bold" className="text-[oklch(0.6_0.2_45)]" />
                                            <span className="text-xs font-sans text-[rgba(55,50,47,0.80)]">
                                                Medical Professional
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-2">
                                <button
                                    onClick={() => {
                                        setIsOpen(false)
                                        router.push('/profile')
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[rgba(55,50,47,0.05)] transition-all duration-200 font-sans text-[#37322F] text-sm"
                                >
                                    <User size={16} weight="regular" />
                                    <span>View Profile</span>
                                </button>

                                <button
                                    onClick={() => {
                                        setIsOpen(false)
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[rgba(55,50,47,0.05)] transition-all duration-200 font-sans text-[#37322F] text-sm"
                                >
                                    <Gear size={16} weight="regular" />
                                    <span>Settings</span>
                                </button>

                                <div className="border-t border-[rgba(55,50,47,0.12)] my-2"></div>

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all duration-200 font-sans text-[#37322F] text-sm"
                                >
                                    <SignOut size={16} weight="regular" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
