import { NextRequest } from 'next/server'
import { verifyToken } from './auth'
import { cookies } from 'next/headers'

export async function getServerSession(request?: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return null
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return null
    }

    return {
      user: {
        email: payload.email,
        role: payload.role,
        id: payload.userId
      }
    }
  } catch (error) {
    return null
  }
}
