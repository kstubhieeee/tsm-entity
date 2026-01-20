"use client"

import { motion } from "framer-motion"
import {
    Brain,
    House,
    Users,
    FileText,
    ChartLine,
    Database
} from "phosphor-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/doctor/dashboard",
        icon: House,
    },
    {
        title: "AI Diagnosis",
        href: "/doctor/diagnosis",
        icon: Brain,
    },
    {
        title: "Patient Management",
        href: "/doctor/patients",
        icon: Users,
    },
    {
        title: "Medical Analytics",
        href: "/doctor/analytics",
        icon: ChartLine,
    },
    {
        title: "Medical Research",
        href: "/doctor/research",
        icon: Database,
    }
]

export function DashboardSidebar() {
    const pathname = usePathname()

    return (
        <div className="w-64 bg-white h-screen overflow-y-auto relative border-r border-[rgba(55,50,47,0.12)]">
            <div className="p-6 border-b border-[rgba(55,50,47,0.12)]">
                <Link href="/">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[oklch(0.6_0.2_45)] rounded-lg flex items-center justify-center">
                            <Brain size={24} weight="bold" className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-sans font-semibold text-[#37322F]">
                                Medira
                            </h1>
                            <p className="text-xs font-sans text-[rgba(55,50,47,0.80)]">
                                Doctor Portal
                            </p>
                        </div>
                    </div>
                </Link>
            </div>

            <nav className="p-4">
                <div className="space-y-1">
                    {sidebarItems.map((item, index) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon

                        return (
                            <motion.div
                                key={item.href}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 font-sans font-medium group",
                                        isActive
                                            ? "bg-[oklch(0.6_0.2_45)] text-white"
                                            : "text-[rgba(55,50,47,0.80)] hover:bg-[rgba(55,50,47,0.05)] hover:text-[#37322F]"
                                    )}
                                >
                                    <Icon
                                        size={20}
                                        weight={isActive ? "bold" : "regular"}
                                    />
                                    <span className="text-sm">{item.title}</span>
                                </Link>
                            </motion.div>
                        )
                    })}
                </div>
            </nav>
        </div>
    )
}
