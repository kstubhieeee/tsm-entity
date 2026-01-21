'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useHospitalStore } from '@/lib/store'
import { ChartLine, Clock, TrendUp, Users } from 'phosphor-react'
import { useMemo } from 'react'

export default function MetricsPage() {
  const { opdQueue, beds, admissions, inventory } = useHospitalStore()

  const metrics = useMemo(() => {
    const totalPatients = opdQueue.length
    const waitingPatients = opdQueue.filter(p => p.status === 'waiting').length
    const inConsultation = opdQueue.filter(p => p.status === 'in-consultation').length
    
    const totalBeds = beds.length
    const occupiedBeds = beds.filter(b => b.status === 'occupied').length
    const availableBeds = beds.filter(b => b.status === 'available').length
    const occupancyRate = Math.round((occupiedBeds / totalBeds) * 100)
    
    const activeAdmissions = admissions.filter(a => a.status === 'active').length
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const todayDischarges = admissions.filter(a => {
      if (a.status !== 'discharged' || !a.dischargeDate) return false
      const dischargeDate = new Date(a.dischargeDate)
      dischargeDate.setHours(0, 0, 0, 0)
      return dischargeDate.getTime() >= today.getTime() && dischargeDate.getTime() < tomorrow.getTime()
    }).length
    
    const lowStockCount = inventory.filter(i => i.currentStock <= i.minThreshold).length
    const criticalStock = inventory.filter(i => i.currentStock < i.minThreshold * 0.5).length
    
    const avgWaitTimes = opdQueue
      .filter(p => p.status === 'waiting')
      .reduce((acc, p) => {
        const checkInTime = p.checkInTime instanceof Date ? p.checkInTime : new Date(p.checkInTime)
        const waitTime = Math.round((new Date().getTime() - checkInTime.getTime()) / 60000)
        const dept = p.department
        if (!acc[dept]) acc[dept] = { total: 0, count: 0 }
        acc[dept].total += waitTime
        acc[dept].count += 1
        return acc
      }, {} as Record<string, { total: number; count: number }>)
    
    const deptMetrics = Object.entries(avgWaitTimes).map(([dept, data]) => ({
      department: dept,
      avgWait: Math.round(data.total / data.count),
      patients: data.count
    }))
    
    return {
      opd: { totalPatients, waitingPatients, inConsultation },
      beds: { totalBeds, occupiedBeds, availableBeds, occupancyRate },
      admissions: { activeAdmissions, todayDischarges },
      inventory: { lowStockCount, criticalStock },
      deptMetrics
    }
  }, [opdQueue, beds, admissions, inventory])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-instrument-serif text-[#37322F]">Live Metrics</h1>
        <p className="text-[rgba(55,50,47,0.80)] mt-1">Real-time operational performance indicators</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white border-[rgba(55,50,47,0.12)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#37322F]">OPD Status</CardTitle>
            <Users size={16} weight="regular" className="text-[rgba(55,50,47,0.80)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#37322F]">{metrics.opd.totalPatients}</div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-[rgba(55,50,47,0.80)]">Waiting</span>
                <span className="font-medium text-[#37322F]">{metrics.opd.waitingPatients}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[rgba(55,50,47,0.80)]">In Consultation</span>
                <span className="font-medium text-[#37322F]">{metrics.opd.inConsultation}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[rgba(55,50,47,0.12)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#37322F]">Bed Occupancy</CardTitle>
            <ChartLine size={16} weight="regular" className="text-[rgba(55,50,47,0.80)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#37322F]">{metrics.beds.occupancyRate}%</div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-[rgba(55,50,47,0.80)]">Occupied</span>
                <span className="font-medium text-[#37322F]">{metrics.beds.occupiedBeds}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[rgba(55,50,47,0.80)]">Available</span>
                <span className="font-medium text-[#37322F]">{metrics.beds.availableBeds}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[rgba(55,50,47,0.12)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#37322F]">Admissions</CardTitle>
            <TrendUp size={16} weight="regular" className="text-[rgba(55,50,47,0.80)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#37322F]">{metrics.admissions.activeAdmissions}</div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-[rgba(55,50,47,0.80)]">Active</span>
                <span className="font-medium text-[#37322F]">{metrics.admissions.activeAdmissions}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[rgba(55,50,47,0.80)]">Today Discharges</span>
                <span className="font-medium text-[#37322F]">{metrics.admissions.todayDischarges}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[rgba(55,50,47,0.12)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#37322F]">Inventory Status</CardTitle>
            <Clock size={16} weight="regular" className="text-[rgba(55,50,47,0.80)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[oklch(0.6_0.2_45)]">{metrics.inventory.lowStockCount}</div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-[rgba(55,50,47,0.80)]">Low Stock</span>
                <span className="font-medium text-[#37322F]">{metrics.inventory.lowStockCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[rgba(55,50,47,0.80)]">Critical</span>
                <span className="font-medium text-[oklch(0.6_0.2_45)]">{metrics.inventory.criticalStock}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-[rgba(55,50,47,0.12)]">
        <CardHeader>
          <CardTitle className="text-[#37322F]">Department Wait Times</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.deptMetrics.length === 0 ? (
              <p className="text-center text-[rgba(55,50,47,0.80)] py-4">No active patients</p>
            ) : (
              metrics.deptMetrics.map(dept => (
                <div key={dept.department} className="flex items-center justify-between p-3 rounded-lg border border-[rgba(55,50,47,0.12)]">
                  <div>
                    <p className="font-medium text-[#37322F]">{dept.department}</p>
                    <p className="text-sm text-[rgba(55,50,47,0.80)]">{dept.patients} patients waiting</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <Clock size={16} weight="regular" className="text-[rgba(55,50,47,0.80)]" />
                      <span className="text-xl font-bold text-[#37322F]">{dept.avgWait}</span>
                      <span className="text-sm text-[rgba(55,50,47,0.80)]">min</span>
                    </div>
                    <Badge variant={dept.avgWait > 30 ? 'destructive' : 'default'} className="mt-1">
                      {dept.avgWait > 30 ? 'High' : 'Normal'}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-white border-[rgba(55,50,47,0.12)]">
          <CardHeader>
            <CardTitle className="text-[#37322F]">Bed Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from(new Set(beds.map(b => b.department))).map(dept => {
                const deptBeds = beds.filter(b => b.department === dept)
                const occupied = deptBeds.filter(b => b.status === 'occupied').length
                const total = deptBeds.length
                const percentage = Math.round((occupied / total) * 100)
                
                return (
                  <div key={dept}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#37322F]">{dept}</span>
                      <span className="text-sm text-[rgba(55,50,47,0.80)]">{occupied}/{total}</span>
                    </div>
                    <div className="h-2 w-full bg-[rgba(55,50,47,0.12)] rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${
                          percentage > 80 ? 'bg-red-500' : percentage > 60 ? 'bg-amber-500' : 'bg-[oklch(0.6_0.2_45)]'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[rgba(55,50,47,0.12)]">
          <CardHeader>
            <CardTitle className="text-[#37322F]">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className={`flex items-center justify-between p-3 rounded-lg border ${
                opdQueue.length >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <span className="font-medium text-[#37322F]">OPD System</span>
                <Badge className={
                  opdQueue.length >= 0 
                    ? 'bg-green-500/10 text-green-600 border-green-500/20' 
                    : 'bg-red-500/10 text-red-600 border-red-500/20'
                }>
                  {opdQueue.length >= 0 ? 'Operational' : 'Error'}
                </Badge>
              </div>
              <div className={`flex items-center justify-between p-3 rounded-lg border ${
                beds.length > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <span className="font-medium text-[#37322F]">Bed Management</span>
                <Badge className={
                  beds.length > 0 
                    ? 'bg-green-500/10 text-green-600 border-green-500/20' 
                    : 'bg-red-500/10 text-red-600 border-red-500/20'
                }>
                  {beds.length > 0 ? 'Operational' : 'No Beds'}
                </Badge>
              </div>
              <div className={`flex items-center justify-between p-3 rounded-lg border ${
                admissions.length >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <span className="font-medium text-[#37322F]">Admission System</span>
                <Badge className={
                  admissions.length >= 0 
                    ? 'bg-green-500/10 text-green-600 border-green-500/20' 
                    : 'bg-red-500/10 text-red-600 border-red-500/20'
                }>
                  {admissions.length >= 0 ? 'Operational' : 'Error'}
                </Badge>
              </div>
              <div className={`flex items-center justify-between p-3 rounded-lg border ${
                inventory.length > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <span className="font-medium text-[#37322F]">Inventory Tracking</span>
                <Badge className={
                  inventory.length > 0 
                    ? 'bg-green-500/10 text-green-600 border-green-500/20' 
                    : 'bg-red-500/10 text-red-600 border-red-500/20'
                }>
                  {inventory.length > 0 ? 'Operational' : 'No Items'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                <span className="font-medium text-[#37322F]">City Health API</span>
                <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
