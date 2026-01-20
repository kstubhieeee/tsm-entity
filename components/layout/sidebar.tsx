'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Users, 
  BedDouble, 
  ClipboardPlus, 
  Package, 
  Activity 
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/manage/dashboard', icon: LayoutDashboard },
  { name: 'OPD Queue', href: '/manage/opd', icon: Users },
  { name: 'Bed Management', href: '/manage/beds', icon: BedDouble },
  { name: 'Admissions', href: '/manage/admissions', icon: ClipboardPlus },
  { name: 'Inventory', href: '/manage/inventory', icon: Package },
  { name: 'Live Metrics', href: '/manage/metrics', icon: Activity },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r border-neutral-800 bg-neutral-950">
      <div className="flex h-16 items-center border-b border-neutral-800 px-6 bg-gradient-to-r from-neutral-900 to-neutral-950">
        <h1 className="text-xl font-semibold font-serif text-white">TSM Entity</h1>
      </div>
      
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all',
                isActive
                  ? 'bg-white text-black'
                  : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-neutral-800 p-4">
        <div className="rounded-lg bg-neutral-900 p-3 border border-neutral-800">
          <p className="text-xs font-medium text-white">
            Hospital Management
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            Operational Command Center
          </p>
        </div>
      </div>
    </div>
  )
}
