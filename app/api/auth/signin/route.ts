import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { verifyPassword, createToken } from '@/lib/auth'
import { UserRole } from '@/lib/models'

export async function POST(request: Request) {
  try {
    const { email, password, role } = await request.json()
    
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const db = await getDatabase()
    const collectionName = `${role}s`
    const collection = db.collection(collectionName)
    
    const user = await collection.findOne({ email })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    const isValidPassword = await verifyPassword(password, user.password)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    const token = await createToken({
      userId: user._id.toString(),
      email: user.email,
      role: role as UserRole
    })
    
    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        role
      }
    })
    
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    })
    
    return response
  } catch (error) {
    console.error('Signin error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
