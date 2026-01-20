'use client'

import { Bell, Settings, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useHospitalStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'

export function Header() {
  const router = useRouter()
  const inventory = useHospitalStore((state) => state.inventory)
  const admissions = useHospitalStore((state) => state.admissions)
  
  const lowStockCount = useMemo(() => {
    return inventory.filter(item => item.currentStock <= item.minThreshold).length
  }, [inventory])
  
  const activeAdmissions = useMemo(() => {
    return admissions.filter(a => a.status === 'active').length
  }, [admissions])

  const handleSignOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' })
    router.push('/auth/signin')
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-neutral-800 bg-neutral-950 px-6">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-sm font-medium text-white">
            Hospital Operations Dashboard
          </h2>
          <p className="text-xs text-neutral-500">
            {activeAdmissions} active admissions
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative hover:bg-neutral-900 text-neutral-400 hover:text-white">
          <Bell className="h-5 w-5" />
          {lowStockCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {lowStockCount}
            </span>
          )}
        </Button>
        <Button variant="ghost" size="icon" className="hover:bg-neutral-900 text-neutral-400 hover:text-white">
          <Settings className="h-5 w-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="hover:bg-neutral-900 text-neutral-400 hover:text-white" 
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
