import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { DBBed } from '@/lib/db-models'
import { ObjectId } from 'mongodb'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

export async function GET() {
  try {
    console.log('GET /api/manage/beds called')
    const db = await getDatabase()
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    let query: any = {}
    
    if (token) {
      const payload = await verifyToken(token)
      if (payload && payload.role === 'hospital') {
        query.hospitalId = new ObjectId(payload.userId)
        console.log('Filtering beds by hospitalId:', payload.userId)
      }
    }
    
    console.log('Fetching beds with query:', JSON.stringify(query))
    const beds = await db.collection<DBBed>('beds').find(query).toArray()
    console.log('Found beds:', beds.length)
    
    return NextResponse.json({ beds })
  } catch (error) {
    console.error('Failed to fetch beds:', error)
    return NextResponse.json({ error: 'Failed to fetch beds', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const db = await getDatabase()
    const departments = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Medicine', 'Emergency']
    const beds: DBBed[] = []
    
    for (const [deptIndex, dept] of departments.entries()) {
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
    
    await db.collection<DBBed>('beds').deleteMany({})
    await db.collection<DBBed>('beds').insertMany(beds)
    
    return NextResponse.json({ success: true, count: beds.length })
  } catch (error) {
    console.error('Failed to initialize beds:', error)
    return NextResponse.json({ error: 'Failed to initialize beds' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { bedId, status, patientId } = body
    
    const db = await getDatabase()
    await db.collection<DBBed>('beds').updateOne(
      { _id: new ObjectId(bedId) },
      { 
        $set: { 
          status, 
          patientId: patientId ? new ObjectId(patientId) : undefined,
          lastUpdated: new Date() 
        } 
      }
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update bed:', error)
    return NextResponse.json({ error: 'Failed to update bed' }, { status: 500 })
  }
}
