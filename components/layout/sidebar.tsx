'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  SquaresFour, 
  Users, 
  Bed, 
  Clipboard, 
  Package, 
  ChartLine 
} from 'phosphor-react'

const navigation = [
  { name: 'Dashboard', href: '/manage/dashboard', icon: SquaresFour },
  { name: 'OPD Queue', href: '/manage/opd', icon: Users },
  { name: 'Bed Management', href: '/manage/beds', icon: Bed },
  { name: 'Admissions', href: '/manage/admissions', icon: Clipboard },
  { name: 'Inventory', href: '/manage/inventory', icon: Package },
  { name: 'Live Metrics', href: '/manage/metrics', icon: ChartLine },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r border-[rgba(55,50,47,0.12)] bg-white">
      <div className="flex h-16 items-center border-b border-[rgba(55,50,47,0.12)] px-6 bg-white">
        <Link href="/">
          <h1 className="text-xl font-semibold font-sans text-[#37322F] cursor-pointer hover:opacity-80 transition-opacity">Medira</h1>
        </Link>
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
                  ? 'bg-[oklch(0.6_0.2_45)] text-white'
                  : 'text-[rgba(55,50,47,0.80)] hover:bg-[rgba(55,50,47,0.05)] hover:text-[#37322F]'
              )}
            >
              <Icon size={20} weight={isActive ? 'bold' : 'regular'} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-[rgba(55,50,47,0.12)] p-4">
        <div className="rounded-lg bg-[rgba(55,50,47,0.05)] p-3 border border-[rgba(55,50,47,0.12)]">
          <p className="text-xs font-medium text-[#37322F]">
            Hospital Management
          </p>
          <p className="mt-1 text-xs text-[rgba(55,50,47,0.80)]">
            Operational Command Center
          </p>
        </div>
      </div>
    </div>
  )
}
