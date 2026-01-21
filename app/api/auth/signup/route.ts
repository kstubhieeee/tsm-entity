import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { hashPassword, createToken } from '@/lib/auth'
import { HospitalUser, DoctorUser, PatientUser, UserRole } from '@/lib/models'
import { DBBed } from '@/lib/db-models'
import { ObjectId } from 'mongodb'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { role, email, password, ...userData } = body
    
    if (!role || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const db = await getDatabase()
    const collectionName = `${role}s`
    const collection = db.collection(collectionName)
    
    const existingUser = await collection.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }
    
    const hashedPassword = await hashPassword(password)
    
    const timestamp = new Date()
    let newUser: HospitalUser | DoctorUser | PatientUser
    
    if (role === 'hospital') {
      newUser = {
        email,
        password: hashedPassword,
        role: 'hospital',
        ...userData,
        createdAt: timestamp,
        updatedAt: timestamp
      } as HospitalUser
    } else if (role === 'doctor') {
      newUser = {
        email,
        password: hashedPassword,
        role: 'doctor',
        ...userData,
        createdAt: timestamp,
        updatedAt: timestamp
      } as DoctorUser
    } else if (role === 'patient') {
      newUser = {
        email,
        password: hashedPassword,
        role: 'patient',
        ...userData,
        createdAt: timestamp,
        updatedAt: timestamp
      } as PatientUser
    } else {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }
    
    const result = await collection.insertOne(newUser)
    const hospitalId = result.insertedId
    
    if (role === 'hospital') {
      const hospital = newUser as HospitalUser
      const totalBeds = hospital.totalBeds || 0
      const icuBeds = hospital.icuBeds || 0
      const generalBeds = Math.max(0, totalBeds - icuBeds)
      
      const departments = [
        { name: 'Cardiology', allocation: 0.15 },
        { name: 'Neurology', allocation: 0.15 },
        { name: 'Orthopedics', allocation: 0.15 },
        { name: 'Pediatrics', allocation: 0.15 },
        { name: 'General Medicine', allocation: 0.25 },
        { name: 'Emergency', allocation: 0.15 }
      ]
      
      const beds: DBBed[] = []
      let bedCounter = 1
      let allocatedBeds = 0
      
      departments.forEach((dept, index) => {
        let bedCount = Math.floor(generalBeds * dept.allocation)
        if (index === departments.length - 1) {
          bedCount = generalBeds - allocatedBeds
        }
        
        for (let i = 1; i <= bedCount; i++) {
          beds.push({
            hospitalId: hospitalId,
            department: dept.name,
            bedNumber: `${dept.name.substring(0, 3).toUpperCase()}-${bedCounter.toString().padStart(4, '0')}`,
            status: 'available',
            lastUpdated: new Date(),
            createdAt: new Date()
          })
          bedCounter++
          allocatedBeds++
        }
      })
      
      if (icuBeds > 0) {
        for (let i = 1; i <= icuBeds; i++) {
          beds.push({
            hospitalId: hospitalId,
            department: 'ICU',
            bedNumber: `ICU-${bedCounter.toString().padStart(4, '0')}`,
            status: 'available',
            lastUpdated: new Date(),
            createdAt: new Date()
          })
          bedCounter++
        }
      }
      
      if (beds.length > 0) {
        await db.collection<DBBed>('beds').insertMany(beds)
      }
    }
    
    const token = await createToken({
      userId: result.insertedId.toString(),
      email,
      role: role as UserRole
    })
    
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: result.insertedId.toString(),
          email,
          role
        }
      },
      { status: 201 }
    )
    
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    })
    
    return response
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
