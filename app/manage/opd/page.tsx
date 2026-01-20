'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Clock, UserPlus, CheckCircle, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const departments = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Medicine', 'Emergency']

interface Patient {
  _id: string
  name: string
  age: number
  gender: 'male' | 'female' | 'other'
  contact: string
  checkInTime: string
  priority: number
  department: string
  status: 'waiting' | 'in-consultation' | 'completed'
}

export default function OPDPage() {
  const [opdQueue, setOpdQueue] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedDept, setSelectedDept] = useState<string>('')
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male' as 'male' | 'female' | 'other',
    contact: '',
    department: 'General Medicine'
  })

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/manage/opd')
      const data = await response.json()
      setOpdQueue(data.patients || [])
    } catch (error) {
      console.error('Failed to fetch patients:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/manage/opd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          age: parseInt(formData.age),
          gender: formData.gender,
          contact: formData.contact,
          department: formData.department
        })
      })
      
      if (response.ok) {
        await fetchPatients()
        setFormData({
          name: '',
          age: '',
          gender: 'male',
          contact: '',
          department: 'General Medicine'
        })
        setShowForm(false)
      }
    } catch (error) {
      console.error('Failed to add patient:', error)
    }
  }

  const updateStatus = async (patientId: string, status: Patient['status']) => {
    try {
      await fetch('/api/manage/opd', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, status })
      })
      await fetchPatients()
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const filteredQueue = selectedDept 
    ? opdQueue.filter(p => p.department === selectedDept)
    : opdQueue

  const getAverageWaitTime = (dept: string) => {
    const patients = opdQueue.filter(p => p.department === dept && p.status === 'waiting')
    if (patients.length === 0) return 0
    const now = new Date()
    const totalWait = patients.reduce((sum, p) => {
      return sum + (now.getTime() - new Date(p.checkInTime).getTime())
    }, 0)
    return Math.round(totalWait / patients.length / 60000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold font-serif text-white">OPD Queue Management</h1>
          <p className="text-neutral-400 mt-1">Real-time patient queue tracking</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-white text-black hover:bg-neutral-200"
          type="button"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Patient
        </Button>
      </div>

      {showForm && (
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white">New Patient Registration</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  placeholder="Patient Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-neutral-950 border-neutral-800 text-white"
                  required
                />
                <Input
                  type="number"
                  placeholder="Age"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="bg-neutral-950 border-neutral-800 text-white"
                  required
                />
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <Input
                  placeholder="Contact Number"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className="bg-neutral-950 border-neutral-800 text-white"
                  required
                />
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white md:col-span-2"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-white text-black hover:bg-neutral-200">
                  Add to Queue
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowForm(false)} 
                  className="border-neutral-700 text-red-400 hover:bg-neutral-800"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {departments.map(dept => {
          const deptPatients = opdQueue.filter(p => p.department === dept)
          const waiting = deptPatients.filter(p => p.status === 'waiting').length
          const avgWait = getAverageWaitTime(dept)
          
          return (
            <Card 
              key={dept}
              className={`cursor-pointer transition-all bg-neutral-900 border-neutral-800 hover:border-neutral-700 ${
                selectedDept === dept ? 'ring-2 ring-white' : ''
              }`}
              onClick={() => setSelectedDept(selectedDept === dept ? '' : dept)}
            >
              <CardContent className="pt-6">
                <h3 className="font-semibold text-white mb-2">{dept}</h3>
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <Clock className="w-4 h-4" />
                  <span>{avgWait} min avg wait</span>
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-bold text-white">{waiting}</span>
                  <span className="text-neutral-400 ml-2">waiting</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white">
            {selectedDept ? `${selectedDept} Queue` : 'All Patients'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredQueue.length === 0 ? (
              <p className="text-neutral-500 text-center py-8">No patients in queue</p>
            ) : (
              filteredQueue.map((patient) => (
                <div
                  key={patient._id}
                  className="flex items-center justify-between p-4 bg-neutral-950 rounded-lg border border-neutral-800"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-white">{patient.name}</h4>
                      <Badge variant={
                        patient.status === 'waiting' ? 'default' : 
                        patient.status === 'in-consultation' ? 'secondary' : 
                        'outline'
                      } className={
                        patient.status === 'waiting' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        patient.status === 'in-consultation' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                        'bg-green-500/10 text-green-500 border-green-500/20'
                      }>
                        {patient.status}
                      </Badge>
                    </div>
                    <div className="flex gap-4 mt-2 text-sm text-neutral-400">
                      <span>{patient.age}y • {patient.gender}</span>
                      <span>• {patient.department}</span>
                      <span>• {formatDistanceToNow(new Date(patient.checkInTime), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {patient.status === 'waiting' && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus(patient._id, 'in-consultation')}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                        type="button"
                      >
                        Start Consultation
                      </Button>
                    )}
                    {patient.status === 'in-consultation' && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus(patient._id, 'completed')}
                        className="bg-green-500 hover:bg-green-600 text-white"
                        type="button"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
