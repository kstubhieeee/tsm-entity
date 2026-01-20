'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Building2, Stethoscope, User, ArrowLeft, Mail, Lock, Sparkles } from 'lucide-react'

const roles = [
  { 
    id: 'hospital', 
    label: 'Hospital Management', 
    icon: Building2, 
    gradient: 'from-violet-600 to-indigo-600',
    description: 'Manage hospital operations and resources'
  },
  { 
    id: 'doctor', 
    label: 'Doctor', 
    icon: Stethoscope, 
    gradient: 'from-emerald-600 to-teal-600',
    description: 'Access patient records and medical tools'
  },
  { 
    id: 'patient', 
    label: 'Patient', 
    icon: User, 
    gradient: 'from-pink-600 to-rose-600',
    description: 'View health records and book appointments'
  }
]

export default function SignInPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: selectedRole })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Sign in failed')
      }

      if (selectedRole === 'hospital') {
        router.push('/manage/dashboard')
      } else if (selectedRole === 'doctor') {
        router.push('/doctor/dashboard')
      } else {
        router.push('/patient/dashboard')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setLoading(false)
    }
  }

  if (!selectedRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(120,119,198,0.05),rgba(255,255,255,0))]" />
        
        <div className="w-full max-w-6xl relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-white" />
              <h1 className="text-5xl font-bold text-white">TSM Entity</h1>
            </div>
            <p className="text-neutral-400 text-lg">Select your role to access your dashboard</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {roles.map((role) => {
              const Icon = role.icon
              return (
                <div
                  key={role.id}
                  className="group cursor-pointer"
                  onClick={() => setSelectedRole(role.id)}
                >
                  <div className="relative bg-neutral-900 border border-neutral-800 rounded-2xl p-8 transition-all duration-300 hover:border-neutral-700 hover:shadow-2xl hover:shadow-white/5 hover:-translate-y-1">
                    <div className={`absolute inset-0 bg-gradient-to-br ${role.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
                    
                    <div className="relative">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${role.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      
                      <h3 className="text-2xl font-bold text-white mb-3">{role.label}</h3>
                      <p className="text-neutral-400 text-sm leading-relaxed">{role.description}</p>
                      
                      <div className="mt-6 flex items-center text-sm text-neutral-500 group-hover:text-neutral-300 transition-colors">
                        <span>Sign in</span>
                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-8 text-center">
            <p className="text-neutral-500">
              Don't have an account?{' '}
              <button
                onClick={() => router.push('/auth/signup')}
                className="text-white hover:underline font-medium transition-colors"
              >
                Create one now
              </button>
            </p>
          </div>
        </div>
      </div>
    )
  }

  const currentRole = roles.find(r => r.id === selectedRole)!
  const Icon = currentRole.icon

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
      
      <div className="w-full max-w-md relative z-10">
        <Card className="bg-neutral-900 border-neutral-800 shadow-2xl">
          <CardHeader className="space-y-4 pb-8">
            <Button
              variant="ghost"
              onClick={() => setSelectedRole(null)}
              className="w-fit -ml-2 text-neutral-400 hover:text-white hover:bg-neutral-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <div className="text-center">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${currentRole.gradient} flex items-center justify-center mx-auto mb-4`}>
                <Icon className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-3xl text-white">{currentRole.label}</CardTitle>
              <p className="text-neutral-400 mt-2">Sign in to your account</p>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="pl-11 bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-neutral-700"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-11 bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-neutral-700"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className={`w-full bg-gradient-to-r ${currentRole.gradient} hover:opacity-90 text-white font-medium py-6 rounded-xl transition-all`}
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              <div className="text-center text-sm text-neutral-500">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => router.push('/auth/signup')}
                  className="text-white hover:underline font-medium"
                >
                  Sign up
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
