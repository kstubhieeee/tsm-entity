import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { hashPassword, createToken } from '@/lib/auth'
import { HospitalUser, DoctorUser, PatientUser, UserRole } from '@/lib/models'

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
