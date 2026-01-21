'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bed, Spinner, ArrowClockwise } from 'phosphor-react'

interface Bed {
  _id: string
  department: string
  bedNumber: string
  status: 'available' | 'occupied'
  lastUpdated: string
}

export default function BedsPage() {
  const [beds, setBeds] = useState<Bed[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchBeds = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true)
      }
      const response = await fetch('/api/manage/beds')
      const data = await response.json()
      setBeds(data.beds || [])
    } catch (error) {
      console.error('Failed to fetch beds:', error)
    } finally {
      setLoading(false)
      if (showRefreshing) {
        setRefreshing(false)
      }
    }
  }

  const initializeBeds = async () => {
    try {
      setLoading(true)
      await fetch('/api/manage/init', { method: 'POST' })
      await fetchBeds()
    } catch (error) {
      console.error('Failed to initialize:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBeds()

    intervalRef.current = setInterval(() => {
      fetchBeds(true)
    }, 5000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const departments = Array.from(new Set(beds.map(b => b.department)))

  const getBedsByDepartment = (dept: string) => {
    return beds.filter(b => b.department === dept)
  }

  const getOccupancyRate = (dept: string) => {
    const deptBeds = getBedsByDepartment(dept)
    const occupied = deptBeds.filter(b => b.status === 'occupied').length
    return Math.round((occupied / deptBeds.length) * 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size={32} weight="bold" className="animate-spin text-[oklch(0.6_0.2_45)]" />
      </div>
    )
  }

  if (beds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-[rgba(55,50,47,0.80)]">No beds found in database</p>
        <Button onClick={initializeBeds} className="bg-[oklch(0.6_0.2_45)] hover:opacity-90 text-white" type="button">
          Initialize Beds
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-instrument-serif text-[#37322F]">Bed Management</h1>
          <p className="text-[rgba(55,50,47,0.80)] mt-1">Real-time bed availability tracking</p>
        </div>
        <Button
          onClick={() => fetchBeds(true)}
          disabled={refreshing}
          className="bg-[oklch(0.6_0.2_45)] hover:opacity-90 text-white disabled:opacity-50"
          type="button"
        >
          <ArrowClockwise size={16} weight="bold" className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <div className="space-y-6">
        {departments.map(dept => {
          const deptBeds = getBedsByDepartment(dept)
          const available = deptBeds.filter(b => b.status === 'available').length
          const occupied = deptBeds.filter(b => b.status === 'occupied').length
          const occupancyRate = getOccupancyRate(dept)

          return (
            <Card key={dept} className="bg-white border-[rgba(55,50,47,0.12)]">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-[#37322F]">{dept}</CardTitle>
                    <p className="text-sm text-[rgba(55,50,47,0.80)] mt-1">
                      {available} available • {occupied} occupied
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#37322F]">{occupancyRate}%</div>
                    <div className="text-xs text-[rgba(55,50,47,0.80)]">Occupancy</div>
                  </div>
                </div>
                <div className="w-full bg-[rgba(55,50,47,0.12)] rounded-full h-2 mt-4">
                  <div
                    className={`h-2 rounded-full transition-all ${occupancyRate > 80 ? 'bg-red-500' :
                      occupancyRate > 60 ? 'bg-amber-500' :
                        'bg-green-500'
                      }`}
                    style={{ width: `${occupancyRate}%` }}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                  {deptBeds.map((bed) => (
                    <div
                      key={bed._id}
                      className={`aspect-square rounded-lg flex flex-col items-center justify-center p-2 border transition-all ${bed.status === 'available'
                        ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20'
                        : 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20'
                        }`}
                    >
                      <Bed size={16} weight="bold" className={
                        bed.status === 'available' ? 'text-green-500' : 'text-red-500'
                      } />
                      <span className="text-xs text-[#37322F] mt-1">{bed.bedNumber.split('-')[1]}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
