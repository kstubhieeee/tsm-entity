import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { DBAdmission } from '@/lib/db-models'
import { ObjectId } from 'mongodb'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

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
    
    const admissions = await db.collection<DBAdmission>('admissions')
      .find(query)
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
    
    const bed = await db.collection('beds').findOne({ 
      _id: new ObjectId(bedId)
    })
    
    if (!bed) {
      console.error('Bed not found for bedId:', bedId)
      return NextResponse.json({ error: 'Bed not found' }, { status: 404 })
    }
    
    if (bed.hospitalId && bed.hospitalId.toString() !== hospitalId.toString()) {
      console.error('Bed belongs to different hospital. Bed hospitalId:', bed.hospitalId.toString(), 'Request hospitalId:', hospitalId.toString())
      return NextResponse.json({ error: 'Bed does not belong to this hospital' }, { status: 403 })
    }
    
    if (bed.status !== 'available') {
      return NextResponse.json({ error: 'Bed not available' }, { status: 400 })
    }
    
    const tempPatientId = patientId ? new ObjectId(patientId) : new ObjectId()
    
    const newAdmission: DBAdmission = {
      hospitalId: hospitalId,
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
    
    console.log('=== ADMISSION WORKFLOW START ===')
    console.log('1. Creating admission for:', patientName)
    console.log('2. Bed ID:', bedId)
    console.log('3. Hospital ID:', hospitalId.toString())
    
    const result = await db.collection<DBAdmission>('admissions').insertOne(newAdmission)
    console.log('4. Admission created with ID:', result.insertedId.toString())
    
    console.log('5. Updating bed status to occupied...')
    const bedUpdateResult = await db.collection('beds').updateOne(
      { _id: new ObjectId(bedId) },
      { 
        $set: { 
          status: 'occupied', 
          patientId: tempPatientId, 
          hospitalId: hospitalId,
          lastUpdated: new Date() 
        } 
      }
    )
    
    console.log('6. Bed update result:', {
      matchedCount: bedUpdateResult.matchedCount,
      modifiedCount: bedUpdateResult.modifiedCount,
      acknowledged: bedUpdateResult.acknowledged,
      bedId: bedId,
      hospitalId: hospitalId.toString()
    })
    
    if (bedUpdateResult.matchedCount === 0) {
      console.error('❌ ERROR: Bed not found for update! BedId:', bedId)
      console.error('Rolling back admission...')
      await db.collection<DBAdmission>('admissions').deleteOne({ _id: result.insertedId })
      return NextResponse.json({ error: 'Failed to update bed status - bed not found' }, { status: 500 })
    }
    
    if (bedUpdateResult.modifiedCount === 0) {
      console.warn('⚠️ WARNING: Bed matched but not modified. Bed may already be occupied.')
    } else {
      console.log('✅ SUCCESS: Bed status updated to occupied!')
    }
    
    console.log('=== ADMISSION WORKFLOW END ===')
    
    const updatedBed = await db.collection('beds').findOne({ _id: new ObjectId(bedId) })
    
    return NextResponse.json({ 
      admission: { ...newAdmission, _id: result.insertedId },
      bedNumber: updatedBed?.bedNumber || bed.bedNumber
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
    
    const admission = await db.collection<DBAdmission>('admissions').findOne({ 
      _id: new ObjectId(admissionId),
      hospitalId: hospitalId
    })
    
    if (!admission) {
      return NextResponse.json({ error: 'Admission not found' }, { status: 404 })
    }
    
    await db.collection<DBAdmission>('admissions').updateOne(
      { _id: new ObjectId(admissionId), hospitalId: hospitalId },
      { 
        $set: { 
          status: 'discharged',
          dischargeDate: new Date(),
          updatedAt: new Date()
        }
      }
    )
    
    const bedUpdateResult = await db.collection('beds').updateOne(
      { _id: admission.bedId },
      { 
        $set: { 
          status: 'available', 
          patientId: undefined, 
          lastUpdated: new Date() 
        } 
      }
    )
    
    console.log('Bed discharge update result:', {
      matchedCount: bedUpdateResult.matchedCount,
      modifiedCount: bedUpdateResult.modifiedCount,
      bedId: admission.bedId.toString()
    })
    
    if (bedUpdateResult.matchedCount === 0) {
      console.error('Failed to update bed status - bed not found for bedId:', admission.bedId.toString())
    }
    
    if (bedUpdateResult.modifiedCount === 0 && bedUpdateResult.matchedCount > 0) {
      console.warn('Bed update matched but did not modify - bed may already be available')
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to discharge patient:', error)
    return NextResponse.json({ error: 'Failed to discharge patient' }, { status: 500 })
  }
}
