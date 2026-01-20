'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Buildings, Heartbeat, User, ArrowLeft, Envelope, Lock } from 'phosphor-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const roles = [
  { 
    id: 'hospital', 
    label: 'Hospital Management', 
    icon: Buildings, 
    color: 'oklch(0.6_0.2_45)',
    description: 'Manage hospital operations and resources'
  },
  { 
    id: 'doctor', 
    label: 'Doctor', 
    icon: Heartbeat, 
    color: 'black',
    description: 'Access patient records and medical tools'
  },
  { 
    id: 'patient', 
    label: 'Patient', 
    icon: User, 
    color: 'oklch(0.6_0.2_45)',
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
      <div className="w-full min-h-screen relative bg-white overflow-x-hidden flex flex-col justify-start items-center">
        <div className="relative flex flex-col justify-start items-center w-full">
          <div className="w-full max-w-none px-4 sm:px-6 md:px-8 lg:px-0 lg:max-w-[1060px] lg:w-[1060px] relative flex flex-col justify-start items-start min-h-screen">
            <div className="w-[1px] h-full absolute left-4 sm:left-6 md:left-8 lg:left-0 top-0 bg-[rgba(55,50,47,0.12)] shadow-[1px_0px_0px_white] z-0"></div>
            <div className="w-[1px] h-full absolute right-4 sm:right-6 md:right-8 lg:right-0 top-0 bg-[rgba(55,50,47,0.12)] shadow-[1px_0px_0px_white] z-0"></div>

            <div className="self-stretch pt-[9px] overflow-hidden border-b border-[rgba(55,50,47,0.06)] flex flex-col justify-center items-center gap-4 sm:gap-6 md:gap-8 lg:gap-[66px] relative z-10">
              <div className="w-full h-12 sm:h-14 md:h-16 lg:h-[84px] absolute left-0 top-0 flex justify-center items-center z-20 px-6 sm:px-8 md:px-12 lg:px-0">
                <div className="w-full h-0 absolute left-0 top-6 sm:top-7 md:top-8 lg:top-[42px] border-t border-[rgba(55,50,47,0.12)] shadow-[0px_1px_0px_white]"></div>

                <div className="w-full max-w-[calc(100%-32px)] sm:max-w-[calc(100%-48px)] md:max-w-[calc(100%-64px)] lg:max-w-[700px] lg:w-[700px] h-10 sm:h-11 md:h-12 py-1.5 sm:py-2 px-3 sm:px-4 md:px-4 pr-2 sm:pr-3 bg-white backdrop-blur-sm shadow-[0px_0px_0px_2px_white] overflow-hidden rounded-[50px] flex justify-between items-center relative z-30">
                  <div className="flex justify-center items-center">
                    <Link href="/">
                      <div className="flex flex-col justify-center text-[#2F3037] text-sm sm:text-base md:text-lg lg:text-xl font-medium leading-5 font-sans cursor-pointer hover:opacity-80 transition-opacity">
                        Medira
                      </div>
                    </Link>
                  </div>
                  <div className="h-6 sm:h-7 md:h-8 flex justify-start items-start gap-2 sm:gap-3">
                    <Link href="/auth/signup">
                      <div className="px-2 sm:px-3 md:px-[14px] py-1 sm:py-[6px] bg-white shadow-[0px_1px_2px_rgba(55,50,47,0.12)] overflow-hidden rounded-full flex justify-center items-center cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col justify-center text-[#37322F] text-xs md:text-[13px] font-medium leading-5 font-sans">
                          Sign up
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="pt-16 sm:pt-20 md:pt-24 lg:pt-[216px] pb-8 sm:pb-12 md:pb-16 flex flex-col justify-start items-center px-2 sm:px-4 md:px-8 lg:px-0 w-full">
                <div className="w-full max-w-[937px] lg:w-[937px] flex flex-col justify-center items-center gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                  <div className="self-stretch rounded-[3px] flex flex-col justify-center items-center gap-4 sm:gap-5 md:gap-6 lg:gap-8">
                    <div className="w-full max-w-[748.71px] lg:w-[748.71px] text-center flex justify-center flex-col text-[#37322F] text-[24px] xs:text-[28px] sm:text-[36px] md:text-[52px] lg:text-[80px] font-normal leading-[1.1] sm:leading-[1.15] md:leading-[1.2] lg:leading-24 font-serif px-2 sm:px-4 md:px-0">
                      Welcome Back to Medira
                    </div>
                    <div className="w-full max-w-[506.08px] lg:w-[506.08px] text-center flex justify-center flex-col text-[rgba(55,50,47,0.80)] sm:text-lg md:text-xl leading-[1.4] sm:leading-[1.45] md:leading-[1.5] lg:leading-7 font-sans px-2 sm:px-4 md:px-0 lg:text-lg font-medium text-sm">
                      Select your role to access your dashboard
                      <br className="hidden sm:block" />
                      and continue managing healthcare operations.
                    </div>
                  </div>
                </div>

                <div className="w-full max-w-[900px] lg:w-[900px] flex flex-col justify-center items-center gap-6 sm:gap-8 md:gap-10 lg:gap-12 relative z-10 mt-6 sm:mt-8 md:mt-10 lg:mt-12">
                  <div className="backdrop-blur-[8.25px] flex flex-row justify-center items-center gap-3 sm:gap-4 w-full">
                    {roles.map((role) => {
                      const Icon = role.icon
                      return (
                        <div
                          key={role.id}
                          onClick={() => setSelectedRole(role.id)}
                          className="flex-1 max-w-[280px] cursor-pointer"
                        >
                          <div 
                            className="h-14 sm:h-16 px-6 sm:px-8 py-3 relative shadow-[0px_0px_0px_3px_rgba(255,255,255,0.10)_inset] overflow-hidden rounded-full flex justify-center items-center hover:opacity-90 transition-opacity w-full"
                            style={{ backgroundColor: role.color === 'black' ? 'rgba(0,0,0,0.9)' : 'oklch(0.6 0.2 45)' }}
                          >
                            <div className="w-full h-full absolute left-0 top-0 bg-gradient-to-b from-[rgba(255,255,255,0.10)] to-[rgba(0,0,0,0.18)] mix-blend-multiply"></div>
                            <div className="flex flex-row items-center gap-2 text-white text-base sm:text-lg font-semibold leading-6 font-sans tracking-tight text-center">
                              <Icon size={20} weight="bold" />
                              <span>{role.label}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <p className="text-[#605A57] text-sm font-normal leading-6 font-sans">
                    Don't have an account?{' '}
                    <Link href="/auth/signup" className="text-[#37322F] hover:underline font-medium transition-colors">
                      Create one now
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentRole = roles.find(r => r.id === selectedRole)!
  const Icon = currentRole.icon

  return (
    <div className="w-full min-h-screen relative bg-white overflow-x-hidden flex flex-col justify-start items-center">
      <div className="relative flex flex-col justify-start items-center w-full">
        <div className="w-full max-w-none px-4 sm:px-6 md:px-8 lg:px-0 lg:max-w-[1060px] lg:w-[1060px] relative flex flex-col justify-start items-start min-h-screen">
          <div className="w-[1px] h-full absolute left-4 sm:left-6 md:left-8 lg:left-0 top-0 bg-[rgba(55,50,47,0.12)] shadow-[1px_0px_0px_white] z-0"></div>
          <div className="w-[1px] h-full absolute right-4 sm:right-6 md:right-8 lg:right-0 top-0 bg-[rgba(55,50,47,0.12)] shadow-[1px_0px_0px_white] z-0"></div>

          <div className="self-stretch pt-[9px] overflow-hidden border-b border-[rgba(55,50,47,0.06)] flex flex-col justify-center items-center gap-4 sm:gap-6 md:gap-8 lg:gap-[66px] relative z-10">
            <div className="w-full h-12 sm:h-14 md:h-16 lg:h-[84px] absolute left-0 top-0 flex justify-center items-center z-20 px-6 sm:px-8 md:px-12 lg:px-0">
              <div className="w-full h-0 absolute left-0 top-6 sm:top-7 md:top-8 lg:top-[42px] border-t border-[rgba(55,50,47,0.12)] shadow-[0px_1px_0px_white]"></div>

              <div className="w-full max-w-[calc(100%-32px)] sm:max-w-[calc(100%-48px)] md:max-w-[calc(100%-64px)] lg:max-w-[700px] lg:w-[700px] h-10 sm:h-11 md:h-12 py-1.5 sm:py-2 px-3 sm:px-4 md:px-4 pr-2 sm:pr-3 bg-white backdrop-blur-sm shadow-[0px_0px_0px_2px_white] overflow-hidden rounded-[50px] flex justify-between items-center relative z-30">
                <div className="flex justify-center items-center">
                  <Link href="/">
                    <div className="flex flex-col justify-center text-[#2F3037] text-sm sm:text-base md:text-lg lg:text-xl font-medium leading-5 font-sans cursor-pointer hover:opacity-80 transition-opacity">
                      Medira
                    </div>
                  </Link>
                </div>
                <div className="h-6 sm:h-7 md:h-8 flex justify-start items-start gap-2 sm:gap-3">
                  <Link href="/auth/signup">
                    <div className="px-2 sm:px-3 md:px-[14px] py-1 sm:py-[6px] bg-white shadow-[0px_1px_2px_rgba(55,50,47,0.12)] overflow-hidden rounded-full flex justify-center items-center cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col justify-center text-[#37322F] text-xs md:text-[13px] font-medium leading-5 font-sans">
                        Sign up
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            <div className="pt-16 sm:pt-20 md:pt-24 lg:pt-[120px] pb-8 sm:pb-12 md:pb-16 flex flex-col justify-start items-center px-2 sm:px-4 md:px-8 lg:px-0 w-full">
              <div className="w-full max-w-[500px] lg:w-[500px]">
                <button
                  onClick={() => setSelectedRole(null)}
                  className="mb-8 flex items-center gap-2 text-[#605A57] hover:text-[#37322F] text-sm font-medium transition-colors"
                >
                  <ArrowLeft size={16} weight="bold" />
                  Back to role selection
                </button>

                <div className="mb-8 text-center">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: currentRole.color === 'black' ? 'rgba(0,0,0,0.9)' : 'oklch(0.6 0.2 45)' }}
                  >
                    <Icon size={32} weight="bold" className="text-white" />
                  </div>
                  <h1 className="text-[#37322F] text-3xl md:text-4xl font-semibold leading-tight font-sans mb-2">
                    {currentRole.label}
                  </h1>
                  <p className="text-[rgba(55,50,47,0.80)] text-base font-normal leading-6 font-sans">
                    Sign in to your account
                  </p>
                </div>

                <form onSubmit={handleSignIn} className="space-y-5">
                  <div className="bg-white border border-[rgba(55,50,47,0.12)] rounded-lg p-6 space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-[#37322F] mb-2">Email Address</label>
                      <div className="relative">
                        <Envelope size={20} weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(55,50,47,0.50)]" />
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          className="pl-11 bg-white border-[rgba(55,50,47,0.12)] text-[#37322F] placeholder:text-[rgba(55,50,47,0.50)] focus:border-[oklch(0.6_0.2_45)]"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#37322F] mb-2">Password</label>
                      <div className="relative">
                        <Lock size={20} weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(55,50,47,0.50)]" />
                        <Input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="pl-11 bg-white border-[rgba(55,50,47,0.12)] text-[#37322F] placeholder:text-[rgba(55,50,47,0.50)] focus:border-[oklch(0.6_0.2_45)]"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full text-white font-medium py-6 rounded-full transition-all hover:opacity-90"
                    style={{ backgroundColor: currentRole.color === 'black' ? 'rgba(0,0,0,0.9)' : 'oklch(0.6 0.2 45)' }}
                    disabled={loading}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>

                  <div className="text-center text-sm text-[rgba(55,50,47,0.80)]">
                    Don't have an account?{' '}
                    <Link href="/auth/signup" className="text-[#37322F] hover:underline font-medium">
                      Sign up
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
