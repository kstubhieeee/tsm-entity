'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Building2, Stethoscope, User, ArrowLeft, Plus, X, Sparkles } from 'lucide-react'

const roles = [
  { id: 'hospital', label: 'Hospital Management', icon: Building2, gradient: 'from-violet-600 to-indigo-600' },
  { id: 'doctor', label: 'Doctor', icon: Stethoscope, gradient: 'from-emerald-600 to-teal-600' },
  { id: 'patient', label: 'Patient', icon: User, gradient: 'from-pink-600 to-rose-600' }
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
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
        
        <div className="w-full max-w-6xl relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-white" />
              <h1 className="text-5xl font-bold text-white">TSM Entity</h1>
            </div>
            <p className="text-neutral-400 text-lg">Choose your role to create an account</p>
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
                      <p className="text-neutral-400 text-sm">Create your {role.label.toLowerCase()} account</p>
                      
                      <div className="mt-6 flex items-center text-sm text-neutral-500 group-hover:text-neutral-300 transition-colors">
                        <span>Register</span>
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
              Already have an account?{' '}
              <button
                onClick={() => router.push('/auth/signin')}
                className="text-white hover:underline font-medium transition-colors"
              >
                Sign in
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
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
      
      <div className="w-full max-w-4xl mx-auto relative z-10">
        <Card className="bg-neutral-900 border-neutral-800 shadow-2xl">
          <CardHeader className="space-y-4">
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
              <CardTitle className="text-3xl text-white">{currentRole.label} Registration</CardTitle>
              <p className="text-neutral-400 mt-2">Create your account with your details</p>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Email *</label>
                  <Input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your.email@example.com"
                    className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Password *</label>
                  <Input
                    type="password"
                    value={formData.password || ''}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter strong password"
                    className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600"
                    required
                  />
                </div>

                {selectedRole === 'patient' && (
                  <>
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-2 mb-4 mt-6">
                        <User className="w-5 h-5 text-white" />
                        <h3 className="text-lg font-semibold text-white">Personal Information</h3>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Full Name *</label>
                      <Input
                        value={formData.fullName || ''}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        placeholder="John Doe"
                        className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Age *</label>
                      <Input
                        type="number"
                        value={formData.age || ''}
                        onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                        placeholder="25"
                        className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Gender *</label>
                      <select
                        className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neutral-700"
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
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Blood Group</label>
                      <select
                        className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neutral-700"
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
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Location *</label>
                      <Input
                        value={formData.location || ''}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="Mumbai, India"
                        className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Occupation</label>
                      <Input
                        value={formData.occupation || ''}
                        onChange={(e) => handleInputChange('occupation', e.target.value)}
                        placeholder="Software Engineer"
                        className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Height (cm)</label>
                      <Input
                        type="number"
                        value={formData.height || ''}
                        onChange={(e) => handleInputChange('height', parseFloat(e.target.value))}
                        placeholder="170"
                        className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Weight (kg)</label>
                      <Input
                        type="number"
                        value={formData.weight || ''}
                        onChange={(e) => handleInputChange('weight', parseFloat(e.target.value))}
                        placeholder="65"
                        className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Contact Number *</label>
                      <Input
                        type="tel"
                        value={formData.contactNumber || ''}
                        onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                        placeholder="+91 98765 43210"
                        className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Date of Birth *</label>
                      <Input
                        type="date"
                        value={formData.dateOfBirth || ''}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        className="bg-neutral-950 border-neutral-800 text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Emergency Contact Name *</label>
                      <Input
                        value={formData.emergencyContactName || ''}
                        onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                        placeholder="Jane Doe"
                        className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Emergency Contact Number *</label>
                      <Input
                        type="tel"
                        value={formData.emergencyContactNumber || ''}
                        onChange={(e) => handleInputChange('emergencyContactNumber', e.target.value)}
                        placeholder="+91 98765 43210"
                        className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Address *</label>
                      <Input
                        value={formData.address || ''}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Street address"
                        className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">City *</label>
                      <Input
                        value={formData.city || ''}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="Mumbai"
                        className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">State *</label>
                      <Input
                        value={formData.state || ''}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        placeholder="Maharashtra"
                        className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Pincode *</label>
                      <Input
                        value={formData.pincode || ''}
                        onChange={(e) => handleInputChange('pincode', e.target.value)}
                        placeholder="400001"
                        className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <div className="flex items-center gap-2 mb-4 mt-6">
                        <Stethoscope className="w-5 h-5 text-white" />
                        <h3 className="text-lg font-semibold text-white">Medical History</h3>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-300 mb-3">Medical Conditions</label>
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
                              className="w-4 h-4 rounded border-neutral-700 bg-neutral-950 text-white focus:ring-neutral-700"
                            />
                            <span className="text-sm text-neutral-400 group-hover:text-white transition-colors">
                              {condition}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Current Medications</label>
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
                          className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600"
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            addArrayItem('currentMedications', tempInput.medications)
                            setTempInput({ ...tempInput, medications: '' })
                          }}
                          className="bg-neutral-800 hover:bg-neutral-700"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      {formData.currentMedications.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {formData.currentMedications.map((med: string, index: number) => (
                            <span key={index} className="inline-flex items-center gap-1 bg-neutral-800 text-white px-3 py-1 rounded-full text-sm">
                              {med}
                              <button type="button" onClick={() => removeArrayItem('currentMedications', index)}>
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Allergies</label>
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
                          className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600"
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            addArrayItem('allergies', tempInput.allergies)
                            setTempInput({ ...tempInput, allergies: '' })
                          }}
                          className="bg-neutral-800 hover:bg-neutral-700"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      {formData.allergies.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {formData.allergies.map((allergy: string, index: number) => (
                            <span key={index} className="inline-flex items-center gap-1 bg-neutral-800 text-white px-3 py-1 rounded-full text-sm">
                              {allergy}
                              <button type="button" onClick={() => removeArrayItem('allergies', index)}>
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-300 mb-3">Family History</label>
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
                              className="w-4 h-4 rounded border-neutral-700 bg-neutral-950 text-white focus:ring-neutral-700"
                            />
                            <span className="text-sm text-neutral-400 group-hover:text-white transition-colors">
                              {condition}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Past Surgeries / Hospitalizations</label>
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
                          className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600"
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            addArrayItem('pastSurgeries', tempInput.surgeries)
                            setTempInput({ ...tempInput, surgeries: '' })
                          }}
                          className="bg-neutral-800 hover:bg-neutral-700"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      {formData.pastSurgeries.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {formData.pastSurgeries.map((surgery: string, index: number) => (
                            <span key={index} className="inline-flex items-center gap-1 bg-neutral-800 text-white px-3 py-1 rounded-full text-sm">
                              {surgery}
                              <button type="button" onClick={() => removeArrayItem('pastSurgeries', index)}>
                                <X className="w-3 h-3" />
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
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Hospital Name *</label>
                      <Input
                        value={formData.hospitalName || ''}
                        onChange={(e) => handleInputChange('hospitalName', e.target.value)}
                        placeholder="City General Hospital"
                        className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Registration Number *</label>
                      <Input
                        value={formData.registrationNumber || ''}
                        onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                        placeholder="HSP123456"
                        className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Hospital Type *</label>
                      <select
                        className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neutral-700"
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
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Address *</label>
                      <Input
                        value={formData.address || ''}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Street address"
                        className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">City *</label>
                      <Input
                        value={formData.city || ''}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="Mumbai"
                        className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">State *</label>
                      <Input
                        value={formData.state || ''}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        placeholder="Maharashtra"
                        className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Pincode *</label>
                      <Input
                        value={formData.pincode || ''}
                        onChange={(e) => handleInputChange('pincode', e.target.value)}
                        placeholder="400001"
                        className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Contact Number *</label>
                      <Input
                        type="tel"
                        value={formData.contactNumber || ''}
                        onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                        placeholder="+91 98765 43210"
                        className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Emergency Contact *</label>
                      <Input
                        type="tel"
                        value={formData.emergencyContact || ''}
                        onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                        placeholder="+91 98765 43210"
                        className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Total Beds *</label>
                      <Input
                        type="number"
                        value={formData.totalBeds || ''}
                        onChange={(e) => handleInputChange('totalBeds', parseInt(e.target.value))}
                        placeholder="100"
                        className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">ICU Beds *</label>
                      <Input
                        type="number"
                        value={formData.icuBeds || ''}
                        onChange={(e) => handleInputChange('icuBeds', parseInt(e.target.value))}
                        placeholder="20"
                        className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Admin Name *</label>
                      <Input
                        value={formData.adminName || ''}
                        onChange={(e) => handleInputChange('adminName', e.target.value)}
                        placeholder="Dr. John Smith"
                        className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Admin Designation *</label>
                      <Input
                        value={formData.adminDesignation || ''}
                        onChange={(e) => handleInputChange('adminDesignation', e.target.value)}
                        placeholder="Chief Medical Officer"
                        className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600"
                        required
                      />
                    </div>
                  </>
                )}

                {selectedRole === 'doctor' && (
                  <>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Full Name *</label>
                      <Input
                        value={formData.fullName || ''}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        placeholder="Dr. John Smith"
                        className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Specialization *</label>
                      <Input
                        value={formData.specialization || ''}
                        onChange={(e) => handleInputChange('specialization', e.target.value)}
                        placeholder="Cardiology"
                        className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">License Number *</label>
                      <Input
                        value={formData.licenseNumber || ''}
                        onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                        placeholder="MED123456"
                        className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Years of Experience *</label>
                      <Input
                        type="number"
                        value={formData.yearsOfExperience || ''}
                        onChange={(e) => handleInputChange('yearsOfExperience', parseInt(e.target.value))}
                        placeholder="10"
                        className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Contact Number *</label>
                      <Input
                        type="tel"
                        value={formData.contactNumber || ''}
                        onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                        placeholder="+91 98765 43210"
                        className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Consultation Fee *</label>
                      <Input
                        type="number"
                        value={formData.consultationFee || ''}
                        onChange={(e) => handleInputChange('consultationFee', parseInt(e.target.value))}
                        placeholder="500"
                        className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Hospital Affiliation</label>
                      <Input
                        value={formData.hospitalAffiliation || ''}
                        onChange={(e) => handleInputChange('hospitalAffiliation', e.target.value)}
                        placeholder="City General Hospital"
                        className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Qualifications (comma-separated) *</label>
                      <Input
                        value={formData.qualifications || ''}
                        onChange={(e) => handleInputChange('qualifications', e.target.value.split(',').map((q: string) => q.trim()))}
                        placeholder="MBBS, MD, MRCP"
                        className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600"
                        required
                      />
                    </div>
                  </>
                )}
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
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>

              <div className="text-center text-sm text-neutral-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => router.push('/auth/signin')}
                  className="text-white hover:underline font-medium"
                >
                  Sign in
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
