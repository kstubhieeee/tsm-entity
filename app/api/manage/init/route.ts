import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { DBBed, DBInventoryItem } from '@/lib/db-models'

export async function POST() {
  try {
    const db = await getDatabase()
    
    const departments = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Medicine', 'Emergency']
    const beds: DBBed[] = []
    
    for (const dept of departments) {
      const bedCount = dept === 'Emergency' ? 15 : 10
      for (let i = 1; i <= bedCount; i++) {
        beds.push({
          department: dept,
          bedNumber: `${dept.substring(0, 3).toUpperCase()}-${i.toString().padStart(3, '0')}`,
          status: Math.random() > 0.6 ? 'available' : 'occupied',
          lastUpdated: new Date(),
          createdAt: new Date()
        })
      }
    }
    
    await db.collection('beds').deleteMany({})
    await db.collection('beds').insertMany(beds)
    
    const items: DBInventoryItem[] = [
      {
        name: 'Paracetamol 500mg',
        category: 'medicine',
        currentStock: 1500,
        minThreshold: 500,
        unit: 'tablets',
        lastRestocked: new Date(),
        usageHistory: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Amoxicillin 250mg',
        category: 'medicine',
        currentStock: 800,
        minThreshold: 300,
        unit: 'capsules',
        lastRestocked: new Date(),
        usageHistory: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'IV Drip Set',
        category: 'consumable',
        currentStock: 250,
        minThreshold: 100,
        unit: 'units',
        lastRestocked: new Date(),
        usageHistory: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Surgical Gloves',
        category: 'consumable',
        currentStock: 2000,
        minThreshold: 500,
        unit: 'pairs',
        lastRestocked: new Date(),
        usageHistory: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Insulin 100IU/ml',
        category: 'medicine',
        currentStock: 150,
        minThreshold: 200,
        unit: 'vials',
        lastRestocked: new Date(),
        usageHistory: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Oxygen Cylinder',
        category: 'equipment',
        currentStock: 45,
        minThreshold: 20,
        unit: 'units',
        lastRestocked: new Date(),
        usageHistory: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Bandages',
        category: 'consumable',
        currentStock: 450,
        minThreshold: 200,
        unit: 'rolls',
        lastRestocked: new Date(),
        usageHistory: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Syringes 10ml',
        category: 'consumable',
        currentStock: 1200,
        minThreshold: 400,
        unit: 'units',
        lastRestocked: new Date(),
        usageHistory: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
    
    await db.collection('inventory').deleteMany({})
    await db.collection('inventory').insertMany(items)
    
    return NextResponse.json({ 
      success: true, 
      initialized: {
        beds: beds.length,
        inventory: items.length
      }
    })
  } catch (error) {
    console.error('Failed to initialize database:', error)
    return NextResponse.json({ error: 'Failed to initialize database' }, { status: 500 })
  }
}
