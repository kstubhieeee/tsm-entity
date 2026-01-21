import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { DBPatient } from '@/lib/db-models'
import { ObjectId } from 'mongodb'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

function calculatePriority(department: string): number {
  const basePriority = Math.random() * 100
  const departmentBonus = department === 'Emergency' ? 50 : 0
  return basePriority + departmentBonus
}

export async function GET() {
  try {
    const db = await getDatabase()
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    let query: any = {}
    
    if (token) {
      const payload = await verifyToken(token)
      if (payload && payload.role === 'hospital') {
        query.hospitalId = new ObjectId(payload.userId)
      }
    }
    
    const patients = await db.collection<DBPatient>('opd_queue')
      .find(query)
      .sort({ priority: -1 })
      .toArray()
    
    return NextResponse.json({ patients })
  } catch (error) {
    console.error('Failed to fetch OPD queue:', error)
    return NextResponse.json({ error: 'Failed to fetch OPD queue' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, age, gender, contact, department } = body
    
    const db = await getDatabase()
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'hospital') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    const hospitalId = new ObjectId(payload.userId)
    
    const newPatient: DBPatient = {
      hospitalId: hospitalId,
      name,
      age,
      gender,
      contact,
      department,
      checkInTime: new Date(),
      priority: calculatePriority(department),
      status: 'waiting',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await db.collection<DBPatient>('opd_queue').insertOne(newPatient)
    
    return NextResponse.json({ 
      patient: { ...newPatient, _id: result.insertedId } 
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to add patient:', error)
    return NextResponse.json({ error: 'Failed to add patient' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { patientId, status } = body
    
    if (!patientId || !status) {
      return NextResponse.json({ error: 'Patient ID and status are required' }, { status: 400 })
    }
    
    const db = await getDatabase()
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    let query: any = { _id: new ObjectId(patientId) }
    
    if (token) {
      const payload = await verifyToken(token)
      if (payload && payload.role === 'hospital') {
        query.hospitalId = new ObjectId(payload.userId)
      }
    }
    
    const result = await db.collection<DBPatient>('opd_queue').updateOne(
      query,
      { $set: { status, updatedAt: new Date() } }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update patient:', error)
    return NextResponse.json({ 
      error: 'Failed to update patient',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('id')
    
    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID required' }, { status: 400 })
    }
    
    const db = await getDatabase()
    const result = await db.collection<DBPatient>('opd_queue').deleteOne({ 
      _id: new ObjectId(patientId) 
    })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete patient:', error)
    return NextResponse.json({ 
      error: 'Failed to delete patient',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
