'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useHospitalStore } from '@/lib/store'
import { Activity, Clock, TrendingUp, Users } from 'lucide-react'
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
    const todayDischarges = admissions.filter(a => {
      const today = new Date().toDateString()
      return a.status === 'discharged'
    }).length
    
    const lowStockCount = inventory.filter(i => i.currentStock <= i.minThreshold).length
    const criticalStock = inventory.filter(i => i.currentStock < i.minThreshold * 0.5).length
    
    const avgWaitTimes = opdQueue
      .filter(p => p.status === 'waiting')
      .reduce((acc, p) => {
        const waitTime = Math.round((new Date().getTime() - p.checkInTime.getTime()) / 60000)
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
        <h1 className="text-3xl font-semibold font-serif">Live Metrics</h1>
        <p className="text-muted-foreground mt-1">Real-time operational performance indicators</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">OPD Status</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.opd.totalPatients}</div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Waiting</span>
                <span className="font-medium">{metrics.opd.waitingPatients}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">In Consultation</span>
                <span className="font-medium">{metrics.opd.inConsultation}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bed Occupancy</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.beds.occupancyRate}%</div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Occupied</span>
                <span className="font-medium">{metrics.beds.occupiedBeds}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Available</span>
                <span className="font-medium">{metrics.beds.availableBeds}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Admissions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.admissions.activeAdmissions}</div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Active</span>
                <span className="font-medium">{metrics.admissions.activeAdmissions}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Today Discharges</span>
                <span className="font-medium">{metrics.admissions.todayDischarges}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inventory Status</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{metrics.inventory.lowStockCount}</div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Low Stock</span>
                <span className="font-medium">{metrics.inventory.lowStockCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Critical</span>
                <span className="font-medium text-destructive">{metrics.inventory.criticalStock}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Department Wait Times</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.deptMetrics.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No active patients</p>
            ) : (
              metrics.deptMetrics.map(dept => (
                <div key={dept.department} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div>
                    <p className="font-medium">{dept.department}</p>
                    <p className="text-sm text-muted-foreground">{dept.patients} patients waiting</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xl font-bold">{dept.avgWait}</span>
                      <span className="text-sm text-muted-foreground">min</span>
                    </div>
                    <Badge variant={dept.avgWait > 30 ? 'destructive' : 'success'} className="mt-1">
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
        <Card>
          <CardHeader>
            <CardTitle>Bed Distribution</CardTitle>
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
                      <span className="text-sm font-medium">{dept}</span>
                      <span className="text-sm text-muted-foreground">{occupied}/{total}</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${
                          percentage > 80 ? 'bg-destructive' : percentage > 60 ? 'bg-amber-500' : 'bg-primary'
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

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                <span className="font-medium">OPD System</span>
                <Badge variant="success">Operational</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                <span className="font-medium">Bed Management</span>
                <Badge variant="success">Operational</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                <span className="font-medium">Admission System</span>
                <Badge variant="success">Operational</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                <span className="font-medium">Inventory Tracking</span>
                <Badge variant="success">Operational</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                <span className="font-medium">City Health API</span>
                <Badge variant="success">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
