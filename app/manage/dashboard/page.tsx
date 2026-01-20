'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useHospitalStore } from '@/lib/store'
import { Users, BedDouble, ClipboardPlus, AlertTriangle, TrendingUp, Activity } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useMemo } from 'react'

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1']

export default function Dashboard() {
  const { opdQueue, beds, admissions, inventory, getLowStockItems } = useHospitalStore()

  const stats = useMemo(() => {
    const waitingPatients = opdQueue.filter(p => p.status === 'waiting').length
    const availableBeds = beds.filter(b => b.status === 'available').length
    const activeAdmissions = admissions.filter(a => a.status === 'active').length
    const lowStock = getLowStockItems().length

    return { waitingPatients, availableBeds, activeAdmissions, lowStock }
  }, [opdQueue, beds, admissions, getLowStockItems])

  const departmentData = useMemo(() => {
    const deptCount: Record<string, number> = {}
    opdQueue.forEach(p => {
      deptCount[p.department] = (deptCount[p.department] || 0) + 1
    })
    return Object.entries(deptCount).map(([name, value]) => ({ name, value }))
  }, [opdQueue])

  const bedOccupancyData = useMemo(() => {
    const deptBeds: Record<string, { total: number; occupied: number }> = {}
    beds.forEach(b => {
      if (!deptBeds[b.department]) {
        deptBeds[b.department] = { total: 0, occupied: 0 }
      }
      deptBeds[b.department].total++
      if (b.status === 'occupied') deptBeds[b.department].occupied++
    })
    return Object.entries(deptBeds).map(([name, data]) => ({
      name,
      occupied: data.occupied,
      available: data.total - data.occupied,
      occupancy: Math.round((data.occupied / data.total) * 100)
    }))
  }, [beds])

  const inventoryData = useMemo(() => {
    return inventory
      .filter(item => item.currentStock <= item.minThreshold * 1.5)
      .map(item => ({
        name: item.name,
        stock: item.currentStock,
        threshold: item.minThreshold
      }))
      .slice(0, 6)
  }, [inventory])

  const admissionTrend = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        admissions: Math.floor(Math.random() * 15) + 5
      }
    })
    return last7Days
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold font-serif text-white">Operational Command View</h1>
        <p className="text-neutral-400 mt-1">Real-time hospital operations monitoring</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-300">OPD Queue</CardTitle>
            <Users className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.waitingPatients}</div>
            <p className="text-xs text-neutral-500 mt-1">patients waiting</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-300">Available Beds</CardTitle>
            <BedDouble className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.availableBeds}</div>
            <p className="text-xs text-neutral-500 mt-1">of {beds.length} total beds</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-300">Active Admissions</CardTitle>
            <ClipboardPlus className="h-5 w-5 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.activeAdmissions}</div>
            <p className="text-xs text-neutral-500 mt-1">currently admitted</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-300">Inventory Alerts</CardTitle>
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-500">{stats.lowStock}</div>
            <p className="text-xs text-neutral-500 mt-1">items below threshold</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Activity className="h-5 w-5 text-purple-500" />
              OPD Load by Department
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {departmentData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Admission Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={admissionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="date" stroke="#737373" />
                <YAxis stroke="#737373" />
                <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', color: '#fff' }} />
                <Line type="monotone" dataKey="admissions" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BedDouble className="h-5 w-5 text-pink-500" />
              Bed Occupancy by Department
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bedOccupancyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="name" stroke="#737373" />
                <YAxis stroke="#737373" />
                <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', color: '#fff' }} />
                <Legend />
                <Bar dataKey="occupied" fill="#ec4899" />
                <Bar dataKey="available" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Inventory Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={inventoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis type="number" stroke="#737373" />
                <YAxis dataKey="name" type="category" width={120} stroke="#737373" />
                <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', color: '#fff' }} />
                <Legend />
                <Bar dataKey="stock" fill="#8b5cf6" name="Current Stock" />
                <Bar dataKey="threshold" fill="#f59e0b" name="Min Threshold" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
