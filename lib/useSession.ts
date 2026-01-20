'use client'

import { useState, useEffect } from 'react'

interface User {
  email: string
  role: string
  name?: string
  id?: string
}

interface Session {
  user: User
}

export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setSession({
            user: {
              email: data.user.email,
              role: data.user.role,
              name: data.user.fullName || data.user.hospitalName || data.user.email,
              id: data.user.id
            }
          })
          setStatus('authenticated')
        } else {
          setSession(null)
          setStatus('unauthenticated')
        }
      } catch (error) {
        setSession(null)
        setStatus('unauthenticated')
      }
    }

    fetchSession()
  }, [])

  return { data: session, status }
}

export async function signOut() {
  await fetch('/api/auth/signout', { method: 'POST' })
  window.location.href = '/auth/signin'
}
