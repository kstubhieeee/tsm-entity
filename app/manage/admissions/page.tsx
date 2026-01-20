'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ClipboardPlus, Loader2, UserCheck } from 'lucide-react'
import { format } from 'date-fns'

interface Bed {
  _id: string
  department: string
  bedNumber: string
  status: 'available' | 'occupied'
}

interface Admission {
  _id: string
  patientName: string
  department: string
  bedId: string
  admissionDate: string
  diagnosis?: string
  assignedDoctor?: string
  status: 'active' | 'discharged'
}

export default function AdmissionsPage() {
  const [admissions, setAdmissions] = useState<Admission[]>([])
  const [beds, setBeds] = useState<Bed[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    patientName: '',
    department: '',
    bedId: '',
    diagnosis: '',
    assignedDoctor: ''
  })

  const fetchData = async () => {
    try {
      const [admissionsRes, bedsRes] = await Promise.all([
        fetch('/api/manage/admissions'),
        fetch('/api/manage/beds')
      ])
      const admissionsData = await admissionsRes.json()
      const bedsData = await bedsRes.json()
      setAdmissions(admissionsData.admissions || [])
      setBeds(bedsData.beds || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/manage/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          patientId: 'temp-' + Date.now()
        })
      })
      
      if (response.ok) {
        await fetchData()
        setFormData({
          patientName: '',
          department: '',
          bedId: '',
          diagnosis: '',
          assignedDoctor: ''
        })
        setShowForm(false)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create admission')
      }
    } catch (error) {
      console.error('Failed to create admission:', error)
    }
  }

  const handleDischarge = async (admissionId: string) => {
    try {
      await fetch('/api/manage/admissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admissionId })
      })
      await fetchData()
    } catch (error) {
      console.error('Failed to discharge patient:', error)
    }
  }

  const availableBeds = beds.filter(b => b.status === 'available' && 
    (formData.department ? b.department === formData.department : true))

  const departments = Array.from(new Set(beds.map(b => b.department)))

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
          <h1 className="text-3xl font-semibold font-serif text-white">Patient Admissions</h1>
          <p className="text-neutral-400 mt-1">Manage hospital admissions and discharges</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-white text-black hover:bg-neutral-200"
          type="button"
        >
          <ClipboardPlus className="w-4 h-4 mr-2" />
          New Admission
        </Button>
      </div>

      {showForm && (
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white">Patient Admission Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  placeholder="Patient Name"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  className="bg-neutral-950 border-neutral-800 text-white"
                  required
                />
                
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value, bedId: '' })}
                  className="px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>

                <select
                  value={formData.bedId}
                  onChange={(e) => setFormData({ ...formData, bedId: e.target.value })}
                  className="px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                  required
                  disabled={!formData.department}
                >
                  <option value="">Select Bed</option>
                  {availableBeds.map(bed => (
                    <option key={bed._id} value={bed._id}>{bed.bedNumber}</option>
                  ))}
                </select>

                <Input
                  placeholder="Assigned Doctor"
                  value={formData.assignedDoctor}
                  onChange={(e) => setFormData({ ...formData, assignedDoctor: e.target.value })}
                  className="bg-neutral-950 border-neutral-800 text-white"
                />

                <Input
                  placeholder="Diagnosis"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  className="bg-neutral-950 border-neutral-800 text-white md:col-span-2"
                />
              </div>

              {formData.department && availableBeds.length === 0 && (
                <p className="text-amber-500 text-sm">No available beds in {formData.department}</p>
              )}

              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  className="bg-white text-black hover:bg-neutral-200" 
                  disabled={!formData.department || availableBeds.length === 0}
                >
                  Create Admission
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowForm(false)} 
                  className="border-neutral-700 text-red-500 hover:bg-neutral-800"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white">Active Admissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {admissions.filter(a => a.status === 'active').length === 0 ? (
                <p className="text-neutral-500 text-center py-8">No active admissions</p>
              ) : (
                admissions.filter(a => a.status === 'active').map((admission) => {
                  const bed = beds.find(b => b._id === admission.bedId)
                  return (
                    <div
                      key={admission._id}
                      className="flex items-center justify-between p-4 bg-neutral-950 rounded-lg border border-neutral-800"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-white">{admission.patientName}</h4>
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                            Active
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-neutral-400">
                          <div>
                            <span className="text-neutral-500">Department:</span> {admission.department}
                          </div>
                          <div>
                            <span className="text-neutral-500">Bed:</span> {bed?.bedNumber || 'N/A'}
                          </div>
                          {admission.assignedDoctor && (
                            <div>
                              <span className="text-neutral-500">Doctor:</span> {admission.assignedDoctor}
                            </div>
                          )}
                          <div>
                            <span className="text-neutral-500">Admitted:</span> {format(new Date(admission.admissionDate), 'MMM dd, yyyy')}
                          </div>
                          {admission.diagnosis && (
                            <div className="col-span-2">
                              <span className="text-neutral-500">Diagnosis:</span> {admission.diagnosis}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleDischarge(admission._id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                        type="button"
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        Discharge
                      </Button>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white">Recent Discharges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {admissions.filter(a => a.status === 'discharged').slice(0, 5).length === 0 ? (
                <p className="text-neutral-500 text-center py-8">No recent discharges</p>
              ) : (
                admissions.filter(a => a.status === 'discharged').slice(0, 5).map((admission) => (
                  <div
                    key={admission._id}
                    className="flex items-center justify-between p-4 bg-neutral-950 rounded-lg border border-neutral-800"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-white">{admission.patientName}</h4>
                        <Badge className="bg-neutral-700 text-neutral-300">
                          Discharged
                        </Badge>
                      </div>
                      <div className="flex gap-4 mt-2 text-sm text-neutral-400">
                        <span>{admission.department}</span>
                        <span>• Admitted: {format(new Date(admission.admissionDate), 'MMM dd')}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
