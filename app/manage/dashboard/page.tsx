'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useHospitalStore } from '@/lib/store'
import { Users, Bed, Clipboard, Warning, TrendUp, ChartLine } from 'phosphor-react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useMemo } from 'react'

const COLORS = ['oklch(0.6 0.2 45)', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1']

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
        <h1 className="text-3xl font-semibold font-sans text-[#37322F]">Operational Command View</h1>
        <p className="text-[rgba(55,50,47,0.80)] mt-1">Real-time hospital operations monitoring</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white border-[rgba(55,50,47,0.12)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#37322F]">OPD Queue</CardTitle>
            <Users size={20} weight="bold" className="text-[oklch(0.6_0.2_45)]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#37322F]">{stats.waitingPatients}</div>
            <p className="text-xs text-[rgba(55,50,47,0.80)] mt-1">patients waiting</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[rgba(55,50,47,0.12)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#37322F]">Available Beds</CardTitle>
            <Bed size={20} weight="bold" className="text-[oklch(0.6_0.2_45)]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#37322F]">{stats.availableBeds}</div>
            <p className="text-xs text-[rgba(55,50,47,0.80)] mt-1">of {beds.length} total beds</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[rgba(55,50,47,0.12)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#37322F]">Active Admissions</CardTitle>
            <Clipboard size={20} weight="bold" className="text-[oklch(0.6_0.2_45)]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#37322F]">{stats.activeAdmissions}</div>
            <p className="text-xs text-[rgba(55,50,47,0.80)] mt-1">currently admitted</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[rgba(55,50,47,0.12)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#37322F]">Inventory Alerts</CardTitle>
            <Warning size={20} weight="bold" className="text-[oklch(0.6_0.2_45)]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[oklch(0.6_0.2_45)]">{stats.lowStock}</div>
            <p className="text-xs text-[rgba(55,50,47,0.80)] mt-1">items below threshold</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-white border-[rgba(55,50,47,0.12)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#37322F]">
              <ChartLine size={20} weight="bold" className="text-[oklch(0.6_0.2_45)]" />
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
                  fill="oklch(0.6 0.2 45)"
                  dataKey="value"
                >
                  {departmentData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid rgba(55,50,47,0.12)', color: '#37322F' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white border-[rgba(55,50,47,0.12)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#37322F]">
              <TrendUp size={20} weight="bold" className="text-[oklch(0.6_0.2_45)]" />
              Admission Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={admissionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(55,50,47,0.12)" />
                <XAxis dataKey="date" stroke="rgba(55,50,47,0.80)" />
                <YAxis stroke="rgba(55,50,47,0.80)" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid rgba(55,50,47,0.12)', color: '#37322F' }} />
                <Line type="monotone" dataKey="admissions" stroke="oklch(0.6 0.2 45)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white border-[rgba(55,50,47,0.12)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#37322F]">
              <Bed size={20} weight="bold" className="text-[oklch(0.6_0.2_45)]" />
              Bed Occupancy by Department
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bedOccupancyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(55,50,47,0.12)" />
                <XAxis dataKey="name" stroke="rgba(55,50,47,0.80)" />
                <YAxis stroke="rgba(55,50,47,0.80)" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid rgba(55,50,47,0.12)', color: '#37322F' }} />
                <Legend />
                <Bar dataKey="occupied" fill="oklch(0.6 0.2 45)" />
                <Bar dataKey="available" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white border-[rgba(55,50,47,0.12)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#37322F]">
              <Warning size={20} weight="bold" className="text-[oklch(0.6_0.2_45)]" />
              Inventory Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={inventoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(55,50,47,0.12)" />
                <XAxis type="number" stroke="rgba(55,50,47,0.80)" />
                <YAxis dataKey="name" type="category" width={120} stroke="rgba(55,50,47,0.80)" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid rgba(55,50,47,0.12)', color: '#37322F' }} />
                <Legend />
                <Bar dataKey="stock" fill="oklch(0.6 0.2 45)" name="Current Stock" />
                <Bar dataKey="threshold" fill="#f59e0b" name="Min Threshold" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
