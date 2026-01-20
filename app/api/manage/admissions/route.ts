import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { DBAdmission } from '@/lib/db-models'
import { ObjectId } from 'mongodb'

export async function GET() {
  try {
    const db = await getDatabase()
    const admissions = await db.collection<DBAdmission>('admissions')
      .find()
      .sort({ admissionDate: -1 })
      .toArray()
    
    return NextResponse.json({ admissions })
  } catch (error) {
    console.error('Failed to fetch admissions:', error)
    return NextResponse.json({ error: 'Failed to fetch admissions' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { patientId, patientName, department, bedId, diagnosis, assignedDoctor } = body
    
    const db = await getDatabase()
    
    const bed = await db.collection('beds').findOne({ _id: new ObjectId(bedId) })
    if (!bed || bed.status !== 'available') {
      return NextResponse.json({ error: 'Bed not available' }, { status: 400 })
    }
    
    const tempPatientId = new ObjectId()
    
    const newAdmission: DBAdmission = {
      patientId: tempPatientId,
      patientName,
      department,
      bedId: new ObjectId(bedId),
      admissionDate: new Date(),
      diagnosis,
      assignedDoctor,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await db.collection<DBAdmission>('admissions').insertOne(newAdmission)
    
    await db.collection('beds').updateOne(
      { _id: new ObjectId(bedId) },
      { $set: { status: 'occupied', patientId: tempPatientId, lastUpdated: new Date() } }
    )
    
    return NextResponse.json({ 
      admission: { ...newAdmission, _id: result.insertedId }
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create admission:', error)
    return NextResponse.json({ 
      error: 'Failed to create admission', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { admissionId } = body
    
    const db = await getDatabase()
    const admission = await db.collection<DBAdmission>('admissions').findOne({ 
      _id: new ObjectId(admissionId) 
    })
    
    if (!admission) {
      return NextResponse.json({ error: 'Admission not found' }, { status: 404 })
    }
    
    await db.collection<DBAdmission>('admissions').updateOne(
      { _id: new ObjectId(admissionId) },
      { 
        $set: { 
          status: 'discharged',
          dischargeDate: new Date(),
          updatedAt: new Date()
        }
      }
    )
    
    await db.collection('beds').updateOne(
      { _id: admission.bedId },
      { $set: { status: 'available', patientId: undefined, lastUpdated: new Date() } }
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to discharge patient:', error)
    return NextResponse.json({ error: 'Failed to discharge patient' }, { status: 500 })
  }
}
