import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { UserRole } from './models'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'tsm-entity-secret-key-change-in-production'
)

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export interface JWTPayload {
  userId: string
  email: string
  role: UserRole
}

export async function createToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as UserRole
    }
  } catch {
    return null
  }
}
