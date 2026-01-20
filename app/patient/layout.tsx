"use client"

import { useSession } from "@/lib/useSession"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { PatientSidebar } from "@/components/dashboard/patient-sidebar"

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-[rgba(55,50,47,0.30)] border-t-[#37322F] rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-white">
        <PatientSidebar />
        <div className="flex-1">
          <DashboardHeader userRole="patient" />
          <main className="p-6 bg-white">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
