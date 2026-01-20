import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { DBInventoryItem } from '@/lib/db-models'
import { ObjectId } from 'mongodb'

export async function GET() {
  try {
    const db = await getDatabase()
    const inventory = await db.collection<DBInventoryItem>('inventory').find().toArray()
    
    return NextResponse.json({ inventory })
  } catch (error) {
    console.error('Failed to fetch inventory:', error)
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const db = await getDatabase()
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
    
    await db.collection<DBInventoryItem>('inventory').deleteMany({})
    await db.collection<DBInventoryItem>('inventory').insertMany(items)
    
    return NextResponse.json({ success: true, count: items.length })
  } catch (error) {
    console.error('Failed to initialize inventory:', error)
    return NextResponse.json({ error: 'Failed to initialize inventory' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { itemId, quantity, action, admissionId } = body
    
    const db = await getDatabase()
    
    if (action === 'restock') {
      await db.collection<DBInventoryItem>('inventory').updateOne(
        { _id: new ObjectId(itemId) },
        { 
          $inc: { currentStock: quantity },
          $set: { lastRestocked: new Date(), updatedAt: new Date() }
        }
      )
    } else if (action === 'use') {
      await db.collection<DBInventoryItem>('inventory').updateOne(
        { _id: new ObjectId(itemId) },
        { 
          $inc: { currentStock: -quantity },
          $push: { 
            usageHistory: {
              date: new Date(),
              quantity,
              admissionId: admissionId ? new ObjectId(admissionId) : undefined
            }
          },
          $set: { updatedAt: new Date() }
        }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update inventory:', error)
    return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 })
  }
}
