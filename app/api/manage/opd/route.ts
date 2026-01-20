import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { DBPatient } from '@/lib/db-models'

function calculatePriority(department: string): number {
  const basePriority = Math.random() * 100
  const departmentBonus = department === 'Emergency' ? 50 : 0
  return basePriority + departmentBonus
}

export async function GET() {
  try {
    const db = await getDatabase()
    const patients = await db.collection<DBPatient>('opd_queue')
      .find()
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
    const newPatient: DBPatient = {
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
    
    const db = await getDatabase()
    await db.collection<DBPatient>('opd_queue').updateOne(
      { _id: patientId },
      { $set: { status, updatedAt: new Date() } }
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update patient:', error)
    return NextResponse.json({ error: 'Failed to update patient' }, { status: 500 })
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
    await db.collection<DBPatient>('opd_queue').deleteOne({ _id: patientId as any })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete patient:', error)
    return NextResponse.json({ error: 'Failed to delete patient' }, { status: 500 })
  }
}
