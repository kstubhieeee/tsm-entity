'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Package, Warning, TrendDown, Spinner, Plus } from 'phosphor-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface InventoryItem {
  _id: string
  name: string
  category: 'medicine' | 'consumable' | 'equipment'
  currentStock: number
  minThreshold: number
  unit: string
  lastRestocked: string
}

const COLORS = ['oklch(0.6 0.2 45)', '#ec4899', '#f59e0b']

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [restockItem, setRestockItem] = useState<string | null>(null)
  const [restockQty, setRestockQty] = useState('')

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/manage/inventory')
      const data = await response.json()
      setInventory(data.inventory || [])
    } catch (error) {
      console.error('Failed to fetch inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const initializeInventory = async () => {
    try {
      setLoading(true)
      await fetch('/api/manage/init', { method: 'POST' })
      await fetchInventory()
    } catch (error) {
      console.error('Failed to initialize:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [])

  const handleRestock = async (itemId: string) => {
    if (!restockQty || parseInt(restockQty) <= 0) return
    
    try {
      await fetch('/api/manage/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          quantity: parseInt(restockQty),
          action: 'restock'
        })
      })
      await fetchInventory()
      setRestockItem(null)
      setRestockQty('')
    } catch (error) {
      console.error('Failed to restock:', error)
    }
  }

  const lowStockItems = inventory.filter(item => item.currentStock <= item.minThreshold)

  const categoryData = [
    { name: 'Medicine', value: inventory.filter(i => i.category === 'medicine').length },
    { name: 'Consumable', value: inventory.filter(i => i.category === 'consumable').length },
    { name: 'Equipment', value: inventory.filter(i => i.category === 'equipment').length }
  ]

  const stockData = inventory.slice(0, 6).map(item => ({
    name: item.name.substring(0, 15) + (item.name.length > 15 ? '...' : ''),
    stock: item.currentStock,
    threshold: item.minThreshold
  }))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size={32} weight="bold" className="animate-spin text-[oklch(0.6_0.2_45)]" />
      </div>
    )
  }

  if (inventory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-[rgba(55,50,47,0.80)]">No inventory found in database</p>
        <Button onClick={initializeInventory} className="bg-[oklch(0.6_0.2_45)] hover:opacity-90 text-white" type="button">
          Initialize Inventory
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-instrument-serif text-[#37322F]">Inventory Management</h1>
        <p className="text-[rgba(55,50,47,0.80)] mt-1">Track and manage hospital supplies</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white border-[rgba(55,50,47,0.12)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#37322F]">Total Items</CardTitle>
            <Package size={20} weight="bold" className="text-[oklch(0.6_0.2_45)]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#37322F]">{inventory.length}</div>
            <p className="text-xs text-[rgba(55,50,47,0.80)] mt-1">in inventory</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[rgba(55,50,47,0.12)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#37322F]">Low Stock Alerts</CardTitle>
            <Warning size={20} weight="bold" className="text-[oklch(0.6_0.2_45)]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[oklch(0.6_0.2_45)]">{lowStockItems.length}</div>
            <p className="text-xs text-[rgba(55,50,47,0.80)] mt-1">items below threshold</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[rgba(55,50,47,0.12)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#37322F]">Categories</CardTitle>
            <TrendDown size={20} weight="bold" className="text-[oklch(0.6_0.2_45)]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#37322F]">3</div>
            <p className="text-xs text-[rgba(55,50,47,0.80)] mt-1">item categories</p>
          </CardContent>
        </Card>
      </div>

      {lowStockItems.length > 0 && (
        <Card className="bg-white border-[rgba(55,50,47,0.12)] border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-[#37322F] flex items-center gap-2">
              <Warning size={20} weight="bold" className="text-[oklch(0.6_0.2_45)]" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockItems.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-4 bg-[rgba(55,50,47,0.05)] rounded-lg border border-[rgba(55,50,47,0.12)]"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-[#37322F]">{item.name}</h4>
                      <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                        Low Stock
                      </Badge>
                    </div>
                    <div className="flex gap-4 mt-2 text-sm text-[rgba(55,50,47,0.80)]">
                      <span>Current: {item.currentStock} {item.unit}</span>
                      <span>• Min: {item.minThreshold} {item.unit}</span>
                      <span>• Category: {item.category}</span>
                    </div>
                  </div>
                  {restockItem === item._id ? (
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={restockQty}
                        onChange={(e) => setRestockQty(e.target.value)}
                        placeholder="Quantity"
                        className="w-24 bg-white border-[rgba(55,50,47,0.12)] text-[#37322F]"
                        min="1"
                      />
                      <Button 
                        onClick={() => handleRestock(item._id)} 
                        className="bg-[oklch(0.6_0.2_45)] hover:opacity-90 text-white"
                        type="button"
                      >
                        Confirm
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setRestockItem(null)
                          setRestockQty('')
                        }} 
                        className="border-[rgba(55,50,47,0.12)] text-[rgba(55,50,47,0.80)] hover:bg-[rgba(55,50,47,0.05)]"
                        type="button"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => setRestockItem(item._id)} 
                      className="bg-green-500 hover:bg-green-600 text-white"
                      type="button"
                    >
                      <Plus size={16} weight="bold" className="mr-2" />
                      Restock
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-white border-[rgba(55,50,47,0.12)]">
          <CardHeader>
            <CardTitle className="text-[#37322F]">Stock Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stockData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(55,50,47,0.12)" />
                <XAxis dataKey="name" stroke="rgba(55,50,47,0.80)" />
                <YAxis stroke="rgba(55,50,47,0.80)" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid rgba(55,50,47,0.12)', color: '#37322F' }} />
                <Bar dataKey="stock" fill="oklch(0.6 0.2 45)" name="Current Stock" />
                <Bar dataKey="threshold" fill="#f59e0b" name="Min Threshold" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white border-[rgba(55,50,47,0.12)]">
          <CardHeader>
            <CardTitle className="text-[#37322F]">Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="oklch(0.6 0.2 45)"
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid rgba(55,50,47,0.12)', color: '#37322F' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-[rgba(55,50,47,0.12)]">
        <CardHeader>
          <CardTitle className="text-[#37322F]">All Inventory Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {inventory.map((item) => {
              const stockPercent = (item.currentStock / item.minThreshold) * 100
              return (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-4 bg-[rgba(55,50,47,0.05)] rounded-lg border border-[rgba(55,50,47,0.12)]"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-[#37322F]">{item.name}</h4>
                      <Badge variant="outline" className="text-[rgba(55,50,47,0.80)] border-[rgba(55,50,47,0.12)]">
                        {item.category}
                      </Badge>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm text-[rgba(55,50,47,0.80)] mb-1">
                        <span>{item.currentStock} {item.unit}</span>
                        <span>Min: {item.minThreshold}</span>
                      </div>
                      <div className="w-full bg-[rgba(55,50,47,0.12)] rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            stockPercent <= 100 ? 'bg-red-500' :
                            stockPercent <= 150 ? 'bg-amber-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(stockPercent, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  {restockItem === item._id ? (
                    <div className="flex gap-2 ml-4">
                      <Input
                        type="number"
                        value={restockQty}
                        onChange={(e) => setRestockQty(e.target.value)}
                        placeholder="Quantity"
                        className="w-24 bg-white border-[rgba(55,50,47,0.12)] text-[#37322F]"
                        min="1"
                      />
                      <Button 
                        onClick={() => handleRestock(item._id)} 
                        size="sm" 
                        className="bg-[oklch(0.6_0.2_45)] hover:opacity-90 text-white"
                        type="button"
                      >
                        Add
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setRestockItem(null)
                          setRestockQty('')
                        }} 
                        className="border-[rgba(55,50,47,0.12)] text-[rgba(55,50,47,0.80)] hover:bg-[rgba(55,50,47,0.05)]"
                        type="button"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => setRestockItem(item._id)} 
                      size="sm" 
                      className="ml-4 bg-[rgba(55,50,47,0.05)] hover:bg-[rgba(55,50,47,0.10)] text-[#37322F] border border-[rgba(55,50,47,0.12)]"
                      type="button"
                    >
                      <Plus size={16} weight="bold" className="mr-1" />
                      Restock
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
