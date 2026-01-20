import { ObjectId } from 'mongodb'

export interface HospitalUser {
  _id?: ObjectId
  email: string
  password: string
  role: 'hospital'
  hospitalName: string
  registrationNumber: string
  hospitalType: 'government' | 'private' | 'trust'
  address: string
  city: string
  state: string
  pincode: string
  contactNumber: string
  emergencyContact: string
  totalBeds: number
  icuBeds: number
  adminName: string
  adminDesignation: string
  createdAt: Date
  updatedAt: Date
}

export interface DoctorUser {
  _id?: ObjectId
  email: string
  password: string
  role: 'doctor'
  fullName: string
  specialization: string
  licenseNumber: string
  yearsOfExperience: number
  qualifications: string[]
  hospitalAffiliation?: string
  contactNumber: string
  availableTimings: {
    day: string
    startTime: string
    endTime: string
  }[]
  consultationFee: number
  createdAt: Date
  updatedAt: Date
}

export interface PatientUser {
  _id?: ObjectId
  email: string
  password: string
  role: 'patient'
  fullName: string
  age: number
  dateOfBirth: Date
  gender: 'male' | 'female' | 'other'
  bloodGroup?: string
  location: string
  occupation?: string
  height?: number
  weight?: number
  contactNumber: string
  emergencyContactName: string
  emergencyContactNumber: string
  address: string
  city: string
  state: string
  pincode: string
  medicalConditions: string[]
  currentMedications: string[]
  allergies: string[]
  familyHistory: string[]
  pastSurgeries: string[]
  createdAt: Date
  updatedAt: Date
}

export type UserRole = 'hospital' | 'doctor' | 'patient'

export type User = HospitalUser | DoctorUser | PatientUser
