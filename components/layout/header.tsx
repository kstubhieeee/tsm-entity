'use client'

import { Bell, Gear, SignOut } from 'phosphor-react'
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
    <header className="flex h-16 items-center justify-between border-b border-[rgba(55,50,47,0.12)] bg-white px-6">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-sm font-medium text-[#37322F]">
            Hospital Operations Dashboard
          </h2>
          <p className="text-xs text-[rgba(55,50,47,0.80)]">
            {activeAdmissions} active admissions
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative hover:bg-[rgba(55,50,47,0.05)] text-[rgba(55,50,47,0.80)] hover:text-[#37322F]">
          <Bell size={20} weight="regular" />
          {lowStockCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {lowStockCount}
            </span>
          )}
        </Button>
        <Button variant="ghost" size="icon" className="hover:bg-[rgba(55,50,47,0.05)] text-[rgba(55,50,47,0.80)] hover:text-[#37322F]">
          <Gear size={20} weight="regular" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="hover:bg-[rgba(55,50,47,0.05)] text-[rgba(55,50,47,0.80)] hover:text-[#37322F]" 
          onClick={handleSignOut}
        >
          <SignOut size={20} weight="regular" />
        </Button>
      </div>
    </header>
  )
}
