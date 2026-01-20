'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Package, AlertTriangle, TrendingDown, Loader2, Plus } from 'lucide-react'
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

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b']

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
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    )
  }

  if (inventory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-neutral-400">No inventory found in database</p>
        <Button onClick={initializeInventory} className="bg-white text-black hover:bg-neutral-200" type="button">
          Initialize Inventory
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold font-serif text-white">Inventory Management</h1>
        <p className="text-neutral-400 mt-1">Track and manage hospital supplies</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-300">Total Items</CardTitle>
            <Package className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{inventory.length}</div>
            <p className="text-xs text-neutral-500 mt-1">in inventory</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-300">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-500">{lowStockItems.length}</div>
            <p className="text-xs text-neutral-500 mt-1">items below threshold</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-300">Categories</CardTitle>
            <TrendingDown className="h-5 w-5 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">3</div>
            <p className="text-xs text-neutral-500 mt-1">item categories</p>
          </CardContent>
        </Card>
      </div>

      {lowStockItems.length > 0 && (
        <Card className="bg-neutral-900 border-neutral-800 border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockItems.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-4 bg-neutral-950 rounded-lg border border-neutral-800"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-white">{item.name}</h4>
                      <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                        Low Stock
                      </Badge>
                    </div>
                    <div className="flex gap-4 mt-2 text-sm text-neutral-400">
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
                        className="w-24 bg-neutral-950 border-neutral-800 text-white"
                        min="1"
                      />
                      <Button 
                        onClick={() => handleRestock(item._id)} 
                        className="bg-white text-black hover:bg-neutral-200"
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
                        className="border-neutral-700 text-red-400 hover:bg-neutral-800"
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
                      <Plus className="w-4 h-4 mr-2" />
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
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white">Stock Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stockData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="name" stroke="#737373" />
                <YAxis stroke="#737373" />
                <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', color: '#fff' }} />
                <Bar dataKey="stock" fill="#8b5cf6" name="Current Stock" />
                <Bar dataKey="threshold" fill="#f59e0b" name="Min Threshold" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white">Category Distribution</CardTitle>
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
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white">All Inventory Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {inventory.map((item) => {
              const stockPercent = (item.currentStock / item.minThreshold) * 100
              return (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-4 bg-neutral-950 rounded-lg border border-neutral-800"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-white">{item.name}</h4>
                      <Badge variant="outline" className="text-neutral-400 border-neutral-700">
                        {item.category}
                      </Badge>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm text-neutral-400 mb-1">
                        <span>{item.currentStock} {item.unit}</span>
                        <span>Min: {item.minThreshold}</span>
                      </div>
                      <div className="w-full bg-neutral-800 rounded-full h-2">
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
                        className="w-24 bg-neutral-950 border-neutral-800 text-white"
                        min="1"
                      />
                      <Button 
                        onClick={() => handleRestock(item._id)} 
                        size="sm" 
                        className="bg-white text-black hover:bg-neutral-200"
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
                        className="border-neutral-700 text-red-400 hover:bg-neutral-800"
                        type="button"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => setRestockItem(item._id)} 
                      size="sm" 
                      className="ml-4 bg-neutral-800 hover:bg-neutral-700 text-white"
                      type="button"
                    >
                      <Plus className="w-4 h-4 mr-1" />
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
