import { ObjectId } from 'mongodb'

export interface DBPatient {
  _id?: ObjectId
  userId?: ObjectId
  name: string
  age: number
  gender: 'male' | 'female' | 'other'
  contact: string
  checkInTime: Date
  priority: number
  department: string
  status: 'waiting' | 'in-consultation' | 'completed'
  createdAt: Date
  updatedAt: Date
}

export interface DBBed {
  _id?: ObjectId
  hospitalId?: ObjectId
  department: string
  bedNumber: string
  status: 'available' | 'occupied'
  patientId?: ObjectId
  lastUpdated: Date
  createdAt: Date
}

export interface DBAdmission {
  _id?: ObjectId
  hospitalId?: ObjectId
  patientId: ObjectId
  patientName: string
  department: string
  bedId: ObjectId
  admissionDate: Date
  diagnosis?: string
  status: 'active' | 'discharged'
  assignedDoctor?: string
  dischargeDate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface DBInventoryItem {
  _id?: ObjectId
  hospitalId?: ObjectId
  name: string
  category: 'medicine' | 'consumable' | 'equipment'
  currentStock: number
  minThreshold: number
  unit: string
  lastRestocked: Date
  usageHistory: {
    date: Date
    quantity: number
    admissionId?: ObjectId
  }[]
  createdAt: Date
  updatedAt: Date
}
