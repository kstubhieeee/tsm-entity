import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth'

const publicPaths = ['/auth/signin', '/auth/signup']

const roleBasedPaths: Record<string, string> = {
  hospital: '/manage/dashboard',
  doctor: '/doctor/dashboard',
  patient: '/patient/dashboard'
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  const token = request.cookies.get('auth-token')?.value
  
  if (!token && !publicPaths.includes(pathname) && pathname !== '/') {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }
  
  if (token) {
    const payload = await verifyToken(token)
    
    if (!payload) {
      const response = NextResponse.redirect(new URL('/auth/signin', request.url))
      response.cookies.delete('auth-token')
      return response
    }
    
    if (pathname === '/' || publicPaths.includes(pathname)) {
      return NextResponse.redirect(new URL(roleBasedPaths[payload.role] || '/', request.url))
    }
    
    if (pathname.startsWith('/manage') && payload.role !== 'hospital') {
      return NextResponse.redirect(new URL(roleBasedPaths[payload.role], request.url))
    }
    
    if (pathname.startsWith('/doctor') && payload.role !== 'doctor') {
      return NextResponse.redirect(new URL(roleBasedPaths[payload.role], request.url))
    }
    
    if (pathname.startsWith('/patient') && payload.role !== 'patient') {
      return NextResponse.redirect(new URL(roleBasedPaths[payload.role], request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png).*)',
  ],
}
