"use client"

import { Bell, MagnifyingGlass } from "phosphor-react"
import { Button } from "@/components/ui/button"
import { ProfileDropdown } from "./profile-dropdown"

interface DashboardHeaderProps {
  userRole?: 'clinician' | 'patient'
}

export function DashboardHeader({ userRole = 'clinician' }: DashboardHeaderProps) {
    const getSearchPlaceholder = () => {
        return userRole === 'clinician' 
            ? "Search patients, cases, or medical data..."
            : "Search health records, appointments, or symptoms..."
    }

    return (
        <header className="h-16 bg-white border-b border-[rgba(55,50,47,0.12)] flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <MagnifyingGlass size={16} weight="regular" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgba(55,50,47,0.50)]" />
                    <input
                        type="text"
                        placeholder={getSearchPlaceholder()}
                        className="w-96 pl-10 pr-4 py-2 border border-[rgba(55,50,47,0.12)] rounded-lg font-sans text-sm placeholder:text-[rgba(55,50,47,0.50)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.6_0.2_45)] transition-colors bg-white text-[#37322F]"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative hover:bg-[rgba(55,50,47,0.05)] text-[rgba(55,50,47,0.80)] hover:text-[#37322F]"
                >
                    <Bell size={20} weight="regular" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-[oklch(0.6_0.2_45)] border border-white rounded-full"></div>
                </Button>

                <ProfileDropdown />
            </div>
        </header>
    )
}
