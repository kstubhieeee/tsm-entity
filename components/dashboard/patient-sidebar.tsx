"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  House,
  Activity,
  Calendar,
  FileText,
  ChatCircle,
  Gear,
  Heart,
  Pill,
  TrendUp,
  User,
  SignOut,
  ClipboardText,
  Handshake
} from "phosphor-react"
import { signOut } from "@/lib/useSession"

const navigationItems = [
  {
    title: "Dashboard",
    href: "/patient/dashboard",
    icon: House,
    description: "Overview of your health"
  },
  {
    title: "Medic Analyzer",
    href: "/patient/medicine",
    icon: Pill,
    description: "AI-powered medicine analysis"
  },
  {
    title: "Prescription",
    href: "/patient/lab-analyzer",
    icon: ClipboardText,
    description: "Lab reports and prescriptions"
  },
  {
    title: "Appointments",
    href: "/patient/appointments",
    icon: Calendar,
    description: "Schedule and manage visits"
  },
  {
    title: "Medi Support",
    href: "/patient/medi-support",
    icon: Handshake,
    description: "AI-powered medical support"
  },
  {
    title: "Health Records",
    href: "/patient/records",
    icon: FileText,
    description: "Your medical history"
  },
  {
    title: "History",
    href: "/patient/history",
    icon: TrendUp,
    description: "Appointments & payments"
  }
]

export function PatientSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <Sidebar className="border-r border-[rgba(55,50,47,0.12)] bg-white">
      <SidebarHeader className="border-b border-[rgba(55,50,47,0.12)] p-4">
        <Link href="/patient/dashboard" className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-10 h-10 bg-[oklch(0.6_0.2_45)] rounded-lg flex items-center justify-center"
          >
            <Heart size={24} weight="bold" className="text-white" />
          </motion.div>
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-sans font-semibold text-[#37322F]">
                Medira
              </h1>
              <p className="text-xs font-sans text-[rgba(55,50,47,0.80)]">
                Patient Portal
              </p>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <nav className="space-y-1">
          {navigationItems.map((item, index) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 font-sans font-medium group ${
                    isActive
                      ? "bg-[oklch(0.6_0.2_45)] text-white"
                      : "text-[rgba(55,50,47,0.80)] hover:bg-[rgba(55,50,47,0.05)] hover:text-[#37322F]"
                  }`}
                >
                  <Icon size={20} weight={isActive ? "bold" : "regular"} />
                  {!isCollapsed && (
                    <span className="text-sm">{item.title}</span>
                  )}
                </Link>
              </motion.div>
            )
          })}
        </nav>
      </SidebarContent>

      <SidebarFooter className="border-t border-[rgba(55,50,47,0.12)] p-4">
        <Button
          onClick={() => signOut({ callbackUrl: '/login' })}
          variant="ghost"
          className="w-full hover:bg-red-50 text-red-600 hover:text-red-700 font-sans"
        >
          <SignOut size={16} weight="regular" className="mr-2" />
          {!isCollapsed && "Sign Out"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
