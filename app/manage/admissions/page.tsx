'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Clipboard, Spinner, CheckCircle } from 'phosphor-react'
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
        <Spinner size={32} weight="bold" className="animate-spin text-[oklch(0.6_0.2_45)]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-instrument-serif text-[#37322F]">Patient Admissions</h1>
          <p className="text-[rgba(55,50,47,0.80)] mt-1">Manage hospital admissions and discharges</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-[oklch(0.6_0.2_45)] hover:opacity-90 text-white"
          type="button"
        >
          <Clipboard size={16} weight="bold" className="mr-2" />
          New Admission
        </Button>
      </div>

      {showForm && (
        <Card className="bg-white border-[rgba(55,50,47,0.12)]">
          <CardHeader>
            <CardTitle className="text-[#37322F]">Patient Admission Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  placeholder="Patient Name"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  className="bg-white border-[rgba(55,50,47,0.12)] text-[#37322F]"
                  required
                />
                
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value, bedId: '' })}
                  className="px-3 py-2 bg-white border border-[rgba(55,50,47,0.12)] rounded-lg text-[#37322F]"
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
                  className="px-3 py-2 bg-white border border-[rgba(55,50,47,0.12)] rounded-lg text-[#37322F]"
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
                  className="bg-white border-[rgba(55,50,47,0.12)] text-[#37322F]"
                />

                <Input
                  placeholder="Diagnosis"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  className="bg-white border-[rgba(55,50,47,0.12)] text-[#37322F] md:col-span-2"
                />
              </div>

              {formData.department && availableBeds.length === 0 && (
                <p className="text-amber-600 text-sm">No available beds in {formData.department}</p>
              )}

              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  className="bg-[oklch(0.6_0.2_45)] hover:opacity-90 text-white" 
                  disabled={!formData.department || availableBeds.length === 0}
                >
                  Create Admission
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowForm(false)} 
                  className="border-[rgba(55,50,47,0.12)] text-[rgba(55,50,47,0.80)] hover:bg-[rgba(55,50,47,0.05)]"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        <Card className="bg-white border-[rgba(55,50,47,0.12)]">
          <CardHeader>
            <CardTitle className="text-[#37322F]">Active Admissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {admissions.filter(a => a.status === 'active').length === 0 ? (
                <p className="text-[rgba(55,50,47,0.80)] text-center py-8">No active admissions</p>
              ) : (
                admissions.filter(a => a.status === 'active').map((admission) => {
                  const bed = beds.find(b => b._id === admission.bedId)
                  return (
                    <div
                      key={admission._id}
                      className="flex items-center justify-between p-4 bg-[rgba(55,50,47,0.05)] rounded-lg border border-[rgba(55,50,47,0.12)]"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-[#37322F]">{admission.patientName}</h4>
                          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                            Active
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-[rgba(55,50,47,0.80)]">
                          <div>
                            <span className="text-[rgba(55,50,47,0.80)]">Department:</span> {admission.department}
                          </div>
                          <div>
                            <span className="text-[rgba(55,50,47,0.80)]">Bed:</span> {bed?.bedNumber || 'N/A'}
                          </div>
                          {admission.assignedDoctor && (
                            <div>
                              <span className="text-[rgba(55,50,47,0.80)]">Doctor:</span> {admission.assignedDoctor}
                            </div>
                          )}
                          <div>
                            <span className="text-[rgba(55,50,47,0.80)]">Admitted:</span> {format(new Date(admission.admissionDate), 'MMM dd, yyyy')}
                          </div>
                          {admission.diagnosis && (
                            <div className="col-span-2">
                              <span className="text-[rgba(55,50,47,0.80)]">Diagnosis:</span> {admission.diagnosis}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleDischarge(admission._id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                        type="button"
                      >
                        <CheckCircle size={16} weight="bold" className="mr-2" />
                        Discharge
                      </Button>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[rgba(55,50,47,0.12)]">
          <CardHeader>
            <CardTitle className="text-[#37322F]">Recent Discharges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {admissions.filter(a => a.status === 'discharged').slice(0, 5).length === 0 ? (
                <p className="text-[rgba(55,50,47,0.80)] text-center py-8">No recent discharges</p>
              ) : (
                admissions.filter(a => a.status === 'discharged').slice(0, 5).map((admission) => (
                  <div
                    key={admission._id}
                    className="flex items-center justify-between p-4 bg-[rgba(55,50,47,0.05)] rounded-lg border border-[rgba(55,50,47,0.12)]"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-[#37322F]">{admission.patientName}</h4>
                        <Badge className="bg-[rgba(55,50,47,0.10)] text-[rgba(55,50,47,0.80)] border-[rgba(55,50,47,0.12)]">
                          Discharged
                        </Badge>
                      </div>
                      <div className="flex gap-4 mt-2 text-sm text-[rgba(55,50,47,0.80)]">
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
