'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Buildings, Heartbeat, User, ArrowLeft, Plus, X } from 'phosphor-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const roles = [
  { id: 'hospital', label: 'Hospital Management', icon: Buildings, color: 'oklch(0.6_0.2_45)' },
  { id: 'doctor', label: 'Doctor', icon: Heartbeat, color: 'black' },
  { id: 'patient', label: 'Patient', icon: User, color: 'oklch(0.6_0.2_45)' }
]

const medicalConditions = [
  'Diabetes', 'Hypertension', 'Asthma', 'Heart Disease',
  'Arthritis', 'Cancer', 'Depression', 'Anxiety',
  'Allergies', 'Kidney Disease', 'Liver Disease', 'Thyroid Disorder'
]

const familyHistoryOptions = [
  'Heart Disease', 'Cancer', 'Diabetes', 'Hypertension',
  'Stroke', 'Kidney Disease', 'Mental Health Issues', 'Genetic Disorders',
  'Arthritis', 'Osteoporosis'
]

export default function SignUpPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedRole, setSelectedRole] = useState<string | null>(searchParams.get('role') || null)
  const [formData, setFormData] = useState<Record<string, any>>({
    medicalConditions: [],
    currentMedications: [],
    allergies: [],
    familyHistory: [],
    pastSurgeries: []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tempInput, setTempInput] = useState({ medications: '', allergies: '', surgeries: '' })

  useEffect(() => {
    const role = searchParams.get('role')
    if (role && ['hospital', 'doctor', 'patient'].includes(role)) {
      setSelectedRole(role)
    }
  }, [searchParams])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleArrayItem = (field: string, item: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter((i: string) => i !== item)
        : [...prev[field], item]
    }))
  }

  const addArrayItem = (field: string, value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }))
    }
  }

  const removeArrayItem = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_: any, i: number) => i !== index)
    }))
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: selectedRole })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Sign up failed')
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
                    <Link href="/auth/signin">
                      <div className="px-2 sm:px-3 md:px-[14px] py-1 sm:py-[6px] bg-white shadow-[0px_1px_2px_rgba(55,50,47,0.12)] overflow-hidden rounded-full flex justify-center items-center cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col justify-center text-[#37322F] text-xs md:text-[13px] font-medium leading-5 font-sans">
                          Log in
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
                      Join Medira Platform
                    </div>
                    <div className="w-full max-w-[506.08px] lg:w-[506.08px] text-center flex justify-center flex-col text-[rgba(55,50,47,0.80)] sm:text-lg md:text-xl leading-[1.4] sm:leading-[1.45] md:leading-[1.5] lg:leading-7 font-sans px-2 sm:px-4 md:px-0 lg:text-lg font-medium text-sm">
                      Choose your role to create an account
                      <br className="hidden sm:block" />
                      and start managing healthcare operations.
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
                    Already have an account?{' '}
                    <Link href="/auth/signin" className="text-[#37322F] hover:underline font-medium transition-colors">
                      Sign in
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
                  <Link href="/auth/signin">
                    <div className="px-2 sm:px-3 md:px-[14px] py-1 sm:py-[6px] bg-white shadow-[0px_1px_2px_rgba(55,50,47,0.12)] overflow-hidden rounded-full flex justify-center items-center cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col justify-center text-[#37322F] text-xs md:text-[13px] font-medium leading-5 font-sans">
                        Log in
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            <div className="pt-16 sm:pt-20 md:pt-24 lg:pt-[120px] pb-8 sm:pb-12 md:pb-16 flex flex-col justify-start items-center px-2 sm:px-4 md:px-8 lg:px-0 w-full">
              <div className="w-full max-w-[800px] lg:w-[800px]">
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
                  <h1 className="text-[#37322F] text-3xl md:text-4xl leading-tight font-instrument-serif mb-2">
                    {currentRole.label} Registration
                  </h1>
                  <p className="text-[rgba(55,50,47,0.80)] text-base font-normal leading-6 font-sans">
                    Create your account with your details
                  </p>
                </div>

                <form onSubmit={handleSignUp} className="space-y-6">
                  <div className="bg-white border border-[rgba(55,50,47,0.12)] rounded-lg p-6 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-[#37322F] mb-2">Email *</label>
                        <Input
                          type="email"
                          value={formData.email || ''}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="your.email@example.com"
                          className="bg-white border-[rgba(55,50,47,0.12)] text-[#37322F] placeholder:text-[rgba(55,50,47,0.50)]"
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-[#37322F] mb-2">Password *</label>
                        <Input
                          type="password"
                          value={formData.password || ''}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          placeholder="Enter strong password"
                          className="bg-white border-[rgba(55,50,47,0.12)] text-[#37322F] placeholder:text-[rgba(55,50,47,0.50)]"
                          required
                        />
                      </div>

                      {selectedRole === 'patient' && (
                        <>
                          <div className="md:col-span-2 mt-4">
                            <div className="flex items-center gap-2 mb-4">
                              <User size={20} weight="bold" className="text-[#37322F]" />
                              <h3 className="text-lg font-semibold text-[#37322F]">Personal Information</h3>
                            </div>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-[#37322F] mb-2">Full Name *</label>
                            <Input
                              value={formData.fullName || ''}
                              onChange={(e) => handleInputChange('fullName', e.target.value)}
                              placeholder="John Doe"
                              className="bg-white border-[rgba(55,50,47,0.12)] text-[#37322F] placeholder:text-[rgba(55,50,47,0.50)]"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#37322F] mb-2">Age *</label>
                            <Input
                              type="number"
                              value={formData.age || ''}
                              onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                              placeholder="25"
                              className="bg-white border-[rgba(55,50,47,0.12)] text-[#37322F] placeholder:text-[rgba(55,50,47,0.50)]"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#37322F] mb-2">Gender *</label>
                            <select
                              className="w-full px-3 py-2 bg-white border border-[rgba(55,50,47,0.12)] rounded-lg text-[#37322F] focus:outline-none focus:ring-2 focus:ring-[oklch(0.6_0.2_45)]"
                              value={formData.gender || ''}
                              onChange={(e) => handleInputChange('gender', e.target.value)}
                              required
                            >
                              <option value="">Select gender</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#37322F] mb-2">Blood Group</label>
                            <select
                              className="w-full px-3 py-2 bg-white border border-[rgba(55,50,47,0.12)] rounded-lg text-[#37322F] focus:outline-none focus:ring-2 focus:ring-[oklch(0.6_0.2_45)]"
                              value={formData.bloodGroup || ''}
                              onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                            >
                              <option value="">Select blood group</option>
                              <option value="A+">A+</option>
                              <option value="A-">A-</option>
                              <option value="B+">B+</option>
                              <option value="B-">B-</option>
                              <option value="AB+">AB+</option>
                              <option value="AB-">AB-</option>
                              <option value="O+">O+</option>
                              <option value="O-">O-</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#37322F] mb-2">Location *</label>
                            <Input
                              value={formData.location || ''}
                              onChange={(e) => handleInputChange('location', e.target.value)}
                              placeholder="Mumbai, India"
                              className="bg-white border-[rgba(55,50,47,0.12)] text-[#37322F] placeholder:text-[rgba(55,50,47,0.50)]"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#37322F] mb-2">Occupation</label>
                            <Input
                              value={formData.occupation || ''}
                              onChange={(e) => handleInputChange('occupation', e.target.value)}
                              placeholder="Software Engineer"
                              className="bg-white border-[rgba(55,50,47,0.12)] text-[#37322F] placeholder:text-[rgba(55,50,47,0.50)]"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#37322F] mb-2">Height (cm)</label>
                            <Input
                              type="number"
                              value={formData.height || ''}
                              onChange={(e) => handleInputChange('height', parseFloat(e.target.value))}
                              placeholder="170"
                              className="bg-white border-[rgba(55,50,47,0.12)] text-[#37322F] placeholder:text-[rgba(55,50,47,0.50)]"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#37322F] mb-2">Weight (kg)</label>
                            <Input
                              type="number"
                              value={formData.weight || ''}
                              onChange={(e) => handleInputChange('weight', parseFloat(e.target.value))}
                              placeholder="65"
                              className="bg-white border-[rgba(55,50,47,0.12)] text-[#37322F] placeholder:text-[rgba(55,50,47,0.50)]"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#37322F] mb-2">Contact Number *</label>
                            <Input
                              type="tel"
                              value={formData.contactNumber || ''}
                              onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                              placeholder="+91 98765 43210"
                              className="bg-white border-[rgba(55,50,47,0.12)] text-[#37322F] placeholder:text-[rgba(55,50,47,0.50)]"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#37322F] mb-2">Date of Birth *</label>
                            <Input
                              type="date"
                              value={formData.dateOfBirth || ''}
                              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                              className="bg-white border-[rgba(55,50,47,0.12)] text-[#37322F]"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#37322F] mb-2">Emergency Contact Name *</label>
                            <Input
                              value={formData.emergencyContactName || ''}
                              onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                              placeholder="Jane Doe"
                              className="bg-white border-[rgba(55,50,47,0.12)] text-[#37322F] placeholder:text-[rgba(55,50,47,0.50)]"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#37322F] mb-2">Emergency Contact Number *</label>
                            <Input
                              type="tel"
                              value={formData.emergencyContactNumber || ''}
                              onChange={(e) => handleInputChange('emergencyContactNumber', e.target.value)}
                              placeholder="+91 98765 43210"
                              className="bg-white border-[rgba(55,50,47,0.12)] text-[#37322F] placeholder:text-[rgba(55,50,47,0.50)]"
                              required
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-[#37322F] mb-2">Address *</label>
                            <Input
                              value={formData.address || ''}
                              onChange={(e) => handleInputChange('address', e.target.value)}
                              placeholder="Street address"
                              className="bg-white border-[rgba(55,50,47,0.12)] text-[#37322F] placeholder:text-[rgba(55,50,47,0.50)]"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#37322F] mb-2">City *</label>
                            <Input
                              value={formData.city || ''}
                              onChange={(e) => handleInputChange('city', e.target.value)}
                              placeholder="Mumbai"
                              className="bg-white border-[rgba(55,50,47,0.12)] text-[#37322F] placeholder:text-[rgba(55,50,47,0.50)]"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#37322F] mb-2">State *</label>
                            <Input
                              value={formData.state || ''}
                              onChange={(e) => handleInputChange('state', e.target.value)}
                              placeholder="Maharashtra"
                              className="bg-white border-[rgba(55,50,47,0.12)] text-[#37322F] placeholder:text-[rgba(55,50,47,0.50)]"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#37322F] mb-2">Pincode *</label>
                            <Input
                              value={formData.pincode || ''}
                              onChange={(e) => handleInputChange('pincode', e.target.value)}
                              placeholder="400001"
                              className="bg-white border-[rgba(55,50,47,0.12)] text-[#37322F] placeholder:text-[rgba(55,50,47,0.50)]"
                              required
                            />
                          </div>

                          <div className="md:col-span-2 mt-4">
                            <div className="flex items-center gap-2 mb-4">
                              <Heartbeat size={20} weight="bold" className="text-[#37322F]" />
                              <h3 className="text-lg font-semibold text-[#37322F]">Medical History</h3>
                            </div>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-[#37322F] mb-3">Medical Conditions</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {medicalConditions.map((condition) => (
                                <label
                                  key={condition}
                                  className="flex items-center gap-2 cursor-pointer group"
                                >
                                  <input
                                    type="checkbox"
                                    checked={formData.medicalConditions.includes(condition)}
                                    onChange={() => toggleArrayItem('medicalConditions', condition)}
                                    className="w-4 h-4 rounded border-[rgba(55,50,47,0.12)] bg-white text-[oklch(0.6_0.2_45)] focus:ring-[oklch(0.6_0.2_45)]"
                                  />
                                  <span className="text-sm text-[rgba(55,50,47,0.80)] group-hover:text-[#37322F] transition-colors">
                                    {condition}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-[#37322F] mb-2">Current Medications</label>
                            <div className="flex gap-2">
                              <Input
                                value={tempInput.medications}
                                onChange={(e) => setTempInput({ ...tempInput, medications: e.target.value })}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    addArrayItem('currentMedications', tempInput.medications)
                                    setTempInput({ ...tempInput, medications: '' })
                                  }
                                }}
                                placeholder="Enter medication name"
                                className="bg-white border-[rgba(55,50,47,0.12)] text-[#37322F] placeholder:text-[rgba(55,50,47,0.50)]"
                              />
                              <Button
                                type="button"
                                onClick={() => {
                                  addArrayItem('currentMedications', tempInput.medications)
                                  setTempInput({ ...tempInput, medications: '' })
                                }}
                                className="bg-[oklch(0.6_0.2_45)] hover:opacity-90 text-white"
                              >
                                <Plus size={16} weight="bold" />
                              </Button>
                            </div>
                            {formData.currentMedications.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {formData.currentMedications.map((med: string, index: number) => (
                                  <span key={index} className="inline-flex items-center gap-1 bg-[rgba(55,50,47,0.05)] text-[#37322F] px-3 py-1 rounded-full text-sm border border-[rgba(55,50,47,0.12)]">
                                    {med}
                                    <button type="button" onClick={() => removeArrayItem('currentMedications', index)} className="hover:opacity-70">
                                      <X size={12} weight="bold" />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-[#37322F] mb-2">Allergies</label>
                            <div className="flex gap-2">
                              <Input
                                value={tempInput.allergies}
                                onChange={(e) => setTempInput({ ...tempInput, allergies: e.target.value })}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    addArrayItem('allergies', tempInput.allergies)
                                    setTempInput({ ...tempInput, allergies: '' })
                                  }
                                }}
                                placeholder="Enter allergy"
                                className="bg-white border-[rgba(55,50,47,0.12)] text-[#37322F] placeholder:text-[rgba(55,50,47,0.50)]"
                              />
                              <Button
                                type="button"
                                onClick={() => {
                                  addArrayItem('allergies', tempInput.allergies)
                                  setTempInput({ ...tempInput, allergies: '' })
                                }}
                                className="bg-[oklch(0.6_0.2_45)] hover:opacity-90 text-white"
                              >
                                <Plus size={16} weight="bold" />
                              </Button>
                            </div>
                            {formData.allergies.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {formData.allergies.map((allergy: string, index: number) => (
                                  <span key={index} className="inline-flex items-center gap-1 bg-[rgba(55,50,47,0.05)] text-[#37322F] px-3 py-1 rounded-full text-sm border border-[rgba(55,50,47,0.12)]">
                                    {allergy}
                                    <button type="button" onClick={() => removeArrayItem('allergies', index)} className="hover:opacity-70">
                                      <X size={12} weight="bold" />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-[#37322F] mb-3">Family History</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {familyHistoryOptions.map((condition) => (
                                <label
                                  key={condition}
                                  className="flex items-center gap-2 cursor-pointer group"
                                >
                                  <input
                                    type="checkbox"
                                    checked={formData.familyHistory.includes(condition)}
                                    onChange={() => toggleArrayItem('familyHistory', condition)}
                                    className="w-4 h-4 rounded border-[rgba(55,50,47,0.12)] bg-white text-[oklch(0.6_0.2_45)] focus:ring-[oklch(0.6_0.2_45)]"
                                  />
                                  <span className="text-sm text-[rgba(55,50,47,0.80)] group-hover:text-[#37322F] transition-colors">
                                    {condition}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-[#37322F] mb-2">Past Surgeries / Hospitalizations</label>
                            <div className="flex gap-2">
                              <Input
                                value={tempInput.surgeries}
                                onChange={(e) => setTempInput({ ...tempInput, surgeries: e.target.value })}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    addArrayItem('pastSurgeries', tempInput.surgeries)
                                    setTempInput({ ...tempInput, surgeries: '' })
                                  }
                                }}
                                placeholder="Enter surgery/hospitalization"
                                className="bg-white border-[rgba(55,50,47,0.12)] text-[#37322F] placeholder:text-[rgba(55,50,47,0.50)]"
                              />
                              <Button
                                type="button"
                                onClick={() => {
                                  addArrayItem('pastSurgeries', tempInput.surgeries)
                                  setTempInput({ ...tempInput, surgeries: '' })
                                }}
                                className="bg-[oklch(0.6_0.2_45)] hover:opacity-90 text-white"
                              >
                                <Plus size={16} weight="bold" />
                              </Button>
                            </div>
                            {formData.pastSurgeries.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {formData.pastSurgeries.map((surgery: string, index: number) => (
                                  <span key={index} className="inline-flex items-center gap-1 bg-[rgba(55,50,47,0.05)] text-[#37322F] px-3 py-1 rounded-full text-sm border border-[rgba(55,50,47,0.12)]">
                                    {surgery}
                                    <button type="button" onClick={() => removeArrayItem('pastSurgeries', index)} className="hover:opacity-70">
                                      <X size={12} weight="bold" />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      {selectedRole === 'hospital' && (
                        <>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-[#37322F] mb-2">Hospital Name *</label>
                            <Input
                              value={formData.hospitalName || ''}
                              onChange={(e) => handleInputChange('hospitalName', e.target.value)}
                              placeholder="City General Hospital"
                              className="bg-white border-[rgba(55,50,47,0.12)] text-[#37322F] placeholder:text-[rgba(55,50,47,0.50)]"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#37322F] mb-2">Registration Number *</label>
                            <Input
                              value={formData.registrationNumber || ''}
                              onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                              placeholder="HSP123456"
                              className="bg-white border-[rgba(55,50,47,0.12)] text-[#37322F] placeholder:text-[rgba(55,50,47,0.50)]"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#37322F] mb-2">Hospital Type *</label>
                            <select
                              className="w-full px-3 py-2 bg-white border border-[rgba(55,50,47,0.12)] rounded-lg text-[#37322F] focus:outline-none focus:ring-2 focus:ring-[oklch(0.6_0.2_45)]"
                              value={formData.hospitalType || ''}
                              onChange={(e) => handleInputChange('hospitalType', e.target.value)}
                              required
                            >
                              <option value="">Select type</option>
                              <option value="government">Government</option>
                              <option value="private">Private</option>
                              <option value="trust">Trust</option>
                            </select>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-[#37322F] mb-2">Address *</label>
                            <Input
                              value={formData.address || ''}
                              onChange={(e) => handleInputChange('address', e.target.value)}
                              placeholder="Street address"
                              className="bg-white border-[rgba(55,50,47,0.12)] text-[#37322F] placeholder:text-[rgba(55,50,47,0.50)]"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#37322F] mb-2">City *</label>
                            <Input
                              value={formData.city || ''}
                              onChange={(e) => handleInputChange('city', e.target.value)}
                              placeholder="Mumbai"
                              className="bg-white border-[rgba(55,50,47,0.12)] text-[#37322F] placeholder:text-[rgba(55,50,47,0.50)]"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#37322F] mb-2">State *</label>
                            <Input
                              value={formData.state || ''}
                              onChange={(e) => handleInputChange('state', e.target.value)}
                              placeholder="Maharashtra"
                              className="bg-white border-[rgba(55,50,47,0.12)] text-[#37322F] placeholder:text-[rgba(55,50,47,0.50)]"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#37322F] mb-2">Pincode *</label>
                            <Input
                              value={formData.pincode || ''}
                              onChange={(e) => handleInputChange('pincode', e.target.value)}
                              placeholder="400001"
                              className="bg-white border-[rgba(55,50,47,0.12)] text-[#37322F] placeholder:text-[rgba(55,50,47,0.50)]"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#37322F] mb-2">Contact Number *</label>
                            <Input
                              type="tel"
                              value={formData.contactNumber || ''}
                              onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                              placeholder="+91 98765 43210"
                              className="bg-white border-[rgba(55,50,47,0.12)] text-[#37322F] placeholder:text-[rgba(55,50,47,0.50)]"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#37322F] mb-2">Emergency Contact *</label>
                            <Input
                              type="tel"
                              value={formData.emergencyContact || ''}
                              onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                              placeholder="+91 98765 43210"
                              className="bg-white border-[rgba(55,50,47,0.12)] text-[#37322F] placeholder:text-[rgba(55,50,47,0.50)]"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#37322F] mb-2">Total Beds *</label>
                            <Input
                              type="number"
                              value={formData.totalBeds || ''}
                              onChange={(e) => handleInputChange('totalBeds', parseInt(e.target.value))}
                              placeholder="100"
                              className="bg-white border-[rgba(55,50,47,0.12)] text-[#37322F] placeholder:text-[rgba(55,50,47,0.50)]"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#37322F] mb-2">ICU Beds *</label>
                            <Input
                              type="number"
                              value={formData.icuBeds || ''}
                              onChange={(e) => handleInputChange('icuBeds', parseInt(e.target.value))}
                              placeholder="20"
                              className="bg-white border-[rgba(55,50,47,0.12)] text-[#37322F] placeholder:text-[rgba(55,50,47,0.50)]"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#37322F] mb-2">Admin Name *</label>
                            <Input
                              value={formData.adminName || ''}
                              onChange={(e) => handleInputChange('adminName', e.target.value)}
                              placeholder="Dr. John Smith"
                              className="bg-white border-[rgba(55,50,47,0.12)] text-[#37322F] placeholder:text-[rgba(55,50,47,0.50)]"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#37322F] mb-2">Admin Designation *</label>
                            <Input
                              value={formData.adminDesignation || ''}
                              onChange={(e) => handleInputChange('adminDesignation', e.target.value)}
                              placeholder="Chief Medical Officer"
                              className="bg-white border-[rgba(55,50,47,0.12)] text-[#37322F] placeholder:text-[rgba(55,50,47,0.50)]"
                              required
                            />
                          </div>
                        </>
                      )}

                      {selectedRole === 'doctor' && (
                        <>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-[#37322F] mb-2">Full Name *</label>
                            <Input
                              value={formData.fullName || ''}
                              onChange={(e) => handleInputChange('fullName', e.target.value)}
                              placeholder="Dr. John Smith"
                              className="bg-white border-[rgba(55,50,47,0.12)] text-[#37322F] placeholder:text-[rgba(55,50,47,0.50)]"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#37322F] mb-2">Specialization *</label>
                            <Input
                              value={formData.specialization || ''}
                              onChange={(e) => handleInputChange('specialization', e.target.value)}
                              placeholder="Cardiology"
                              className="bg-white border-[rgba(55,50,47,0.12)] text-[#37322F] placeholder:text-[rgba(55,50,47,0.50)]"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#37322F] mb-2">License Number *</label>
                            <Input
                              value={formData.licenseNumber || ''}
                              onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                              placeholder="MED123456"
                              className="bg-white border-[rgba(55,50,47,0.12)] text-[#37322F] placeholder:text-[rgba(55,50,47,0.50)]"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#37322F] mb-2">Years of Experience *</label>
                            <Input
                              type="number"
                              value={formData.yearsOfExperience || ''}
                              onChange={(e) => handleInputChange('yearsOfExperience', parseInt(e.target.value))}
                              placeholder="10"
                              className="bg-white border-[rgba(55,50,47,0.12)] text-[#37322F] placeholder:text-[rgba(55,50,47,0.50)]"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#37322F] mb-2">Contact Number *</label>
                            <Input
                              type="tel"
                              value={formData.contactNumber || ''}
                              onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                              placeholder="+91 98765 43210"
                              className="bg-white border-[rgba(55,50,47,0.12)] text-[#37322F] placeholder:text-[rgba(55,50,47,0.50)]"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#37322F] mb-2">Consultation Fee *</label>
                            <Input
                              type="number"
                              value={formData.consultationFee || ''}
                              onChange={(e) => handleInputChange('consultationFee', parseInt(e.target.value))}
                              placeholder="500"
                              className="bg-white border-[rgba(55,50,47,0.12)] text-[#37322F] placeholder:text-[rgba(55,50,47,0.50)]"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#37322F] mb-2">Hospital Affiliation</label>
                            <Input
                              value={formData.hospitalAffiliation || ''}
                              onChange={(e) => handleInputChange('hospitalAffiliation', e.target.value)}
                              placeholder="City General Hospital"
                              className="bg-white border-[rgba(55,50,47,0.12)] text-[#37322F] placeholder:text-[rgba(55,50,47,0.50)]"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-[#37322F] mb-2">Qualifications (comma-separated) *</label>
                            <Input
                              value={formData.qualifications || ''}
                              onChange={(e) => handleInputChange('qualifications', e.target.value.split(',').map((q: string) => q.trim()))}
                              placeholder="MBBS, MD, MRCP"
                              className="bg-white border-[rgba(55,50,47,0.12)] text-[#37322F] placeholder:text-[rgba(55,50,47,0.50)]"
                              required
                            />
                          </div>
                        </>
                      )}
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
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>

                  <div className="text-center text-sm text-[rgba(55,50,47,0.80)]">
                    Already have an account?{' '}
                    <Link href="/auth/signin" className="text-[#37322F] hover:underline font-medium">
                      Sign in
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
