"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/useSession"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, FileText, Users, TrendUp, Heartbeat, Activity, Plus, ChartLine, Calendar, Clock, CurrencyInr, CheckCircle } from "phosphor-react"

interface DoctorAppointment {
  id: string
  appointmentId: string
  patientName: string
  date: string
  time: string
  status: string
  consultationFee: number
  paymentStatus: string
}

export default function MedicalDashboard() {
  const router = useRouter()
  const { data: session } = useSession()
  const [hasProfile, setHasProfile] = useState<boolean | null>(null)
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([])
  const [doctorInfo, setDoctorInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkDoctorProfile()
    fetchAppointments()
  }, [])

  const checkDoctorProfile = async () => {
    try {
      const response = await fetch("/api/doctors/profile")
      if (response.ok) {
        setHasProfile(true)
      } else if (response.status === 404) {
        setHasProfile(false)
        router.push("/doctor/profile-setup")
      }
    } catch (error) {
      console.error("Error checking doctor profile:", error)
      setHasProfile(false)
    }
  }

  const fetchAppointments = async () => {
    try {
      const response = await fetch("/api/doctors/appointments")
      const data = await response.json()
      
      if (data.success) {
        setAppointments(data.appointments || [])
        setDoctorInfo(data.doctorInfo)
      }
    } catch (error) {
      console.error("Failed to fetch appointments:", error)
    } finally {
      setLoading(false)
    }
  }

  if (hasProfile === false) {
    return null // Will redirect to profile setup
  }

  const dashboardOptions = [
    {
      title: "AI Agent Orchestration",
      description: "Multi-agent AI system for comprehensive medical diagnosis",
      icon: Brain,
      color: "oklch(0.6_0.2_45)",
      path: "/doctor/ai-orchestration",
      isNew: true
    },
    {
      title: "Patient Management",
      description: "Manage patient records and medical history",
      icon: Users,
      color: "white",
      path: "/doctor/patients"
    },
    {
      title: "Medical Analytics",
      description: "View diagnostic trends and performance metrics",
      icon: ChartLine,
      color: "white",
      path: "/doctor/analytics"
    },
    {
      title: "Research Portal",
      description: "Access medical literature and research tools",
      icon: FileText,
      color: "white",
      path: "/doctor/research"
    },
    {
      title: "Clinical Workflow",
      description: "Streamlined clinical decision support",
      icon: Heartbeat,
      color: "white",
      path: "/doctor/workflow"
    },
    {
      title: "Health Monitoring",
      description: "Real-time patient monitoring and alerts",
      icon: Activity,
      color: "white",
      path: "/doctor/monitoring"
    }
  ]

  const recentStats = [
    { label: "Diagnoses Today", value: "24", change: "+12%" },
    { label: "Patients Seen", value: "18", change: "+8%" },
    { label: "AI Accuracy", value: "94.2%", change: "+2.1%" },
    { label: "Avg. Time Saved", value: "18min", change: "+5min" }
  ]

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-instrument-serif text-[#37322F] mb-2">
            Medical AI Command Center
          </h1>
          <p className="text-xl font-sans text-[rgba(55,50,47,0.80)]">
            AI-powered medical diagnosis system for clinicians
          </p>
          {doctorInfo && (
            <div className="mt-4 flex items-center justify-center gap-4">
              <Badge className="bg-[oklch(0.6_0.2_45)] text-white border-none">
                {doctorInfo.specialization}
              </Badge>
              <span className="text-[rgba(55,50,47,0.80)]">
                {doctorInfo.totalConsultations} consultations completed
              </span>
            </div>
          )}
        </motion.div>

        {/* Appointments Section */}
        {!loading && appointments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-8"
          >
            <Card className="border border-[rgba(55,50,47,0.12)] shadow-sm">
              <CardHeader>
                <CardTitle className="font-sans font-semibold text-[#37322F] flex items-center gap-2">
                  <Calendar size={24} weight="regular" className="text-[oklch(0.6_0.2_45)]" />
                  Your Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {appointments.slice(0, 6).map((appointment, index) => (
                    <motion.div
                      key={appointment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      className="p-4 bg-white rounded-lg border border-[rgba(55,50,47,0.12)] shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-sans font-semibold text-[#37322F] text-sm">
                          {appointment.patientName}
                        </h4>
                        <Badge 
                          className={
                            appointment.status === "scheduled" 
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : appointment.status === "completed"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-gray-50 text-gray-700 border-gray-200"
                          }
                        >
                          {appointment.status}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-[rgba(55,50,47,0.80)]">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} weight="regular" />
                          <span>{new Date(appointment.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={14} weight="regular" />
                          <span>{appointment.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CurrencyInr size={14} weight="regular" />
                          <span>₹{appointment.consultationFee}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {appointments.length > 6 && (
                  <div className="mt-4 text-center">
                    <Button
                      onClick={() => router.push("/doctor/appointments")}
                      className="bg-[oklch(0.6_0.2_45)] text-white hover:bg-[oklch(0.6_0.2_45)]/90"
                    >
                      View All {appointments.length} Appointments
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {recentStats.map((stat, index) => (
            <Card key={stat.label} className="border border-[rgba(55,50,47,0.12)] shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-sans text-[rgba(55,50,47,0.80)] mb-1">{stat.label}</p>
                    <p className="text-2xl font-sans font-bold text-[#37322F]">{stat.value}</p>
                  </div>
                  <div className="text-xs font-sans text-green-700 bg-green-50 px-2 py-1 rounded">
                    {stat.change}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Main Dashboard Options */}
        <div className="space-y-8">
          {/* AI Agent Orchestration - Main Focus */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center"
          >
            {dashboardOptions.filter(option => option.title === "AI Agent Orchestration").map((option, index) => {
            const Icon = option.icon
            return (
              <motion.div
                key={option.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="w-full max-w-2xl"
              >
                <Card 
                  className="border border-[rgba(55,50,47,0.12)] shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer h-full relative bg-white"
                  onClick={() => router.push(option.path)}
                >
                  {option.isNew && (
                    <div className="absolute -top-3 -right-3 z-10">
                      <div className="bg-[oklch(0.6_0.2_45)] rounded-full px-4 py-1 shadow-md">
                        <span className="text-xs font-sans font-semibold text-white">NEW</span>
                      </div>
                    </div>
                  )}
                  
                  <CardHeader className="pb-8 pt-8">
                    <div className="flex items-center justify-center mb-8">
                      <div
                        className="w-24 h-24 rounded-xl flex items-center justify-center shadow-md bg-[oklch(0.6_0.2_45)]"
                      >
                        <Icon
                          size={48}
                          weight="bold"
                          className="text-white"
                        />
                      </div>
                    </div>
                    <CardTitle className="text-3xl font-sans font-bold text-[#37322F] mb-4 text-center">
                      {option.title}
                    </CardTitle>
                    <CardDescription className="text-lg text-[rgba(55,50,47,0.80)] font-sans text-center leading-relaxed">
                      {option.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-4 pb-8">
                    <Button
                      className="w-full h-16 font-sans font-semibold text-lg bg-[oklch(0.6_0.2_45)] hover:bg-[oklch(0.6_0.2_45)]/90 text-white"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(option.path)
                      }}
                    >
                      Start Diagnosis
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
          </motion.div>

          {/* Secondary Options */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
          >
            {dashboardOptions.filter(option => 
              option.title === "Patient Management" || option.title === "Medical Analytics"
            ).map((option, index) => {
              const Icon = option.icon
              return (
                <motion.div
                  key={option.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                > 
                  <Card 
                    className="border-2 border-[#151616] shadow-[6px_6px_0px_0px_#151616] hover:translate-y-1 hover:shadow-[3px_3px_0px_0px_#151616] transition-all duration-200 cursor-pointer h-full"
                    onClick={() => router.push(option.path)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className="w-14 h-14 rounded-xl border-2 border-[#151616] flex items-center justify-center bg-white"
                        >
                          <Icon className="w-7 h-7 text-[#151616]" />
                        </div>
                      </div>
                      <CardTitle className="text-xl font-poppins font-bold text-[#151616] mb-2">
                        {option.title}
                      </CardTitle>
                      <CardDescription className="text-[#151616]/70 font-poppins">
                        {option.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <Button
                        className="w-full border-2 border-[#151616] shadow-[2px_2px_0px_0px_#151616] hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#151616] transition-all duration-200 font-poppins font-medium bg-white hover:bg-[#FFFFF4] text-[#151616]"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(option.path)
                        }}
                      >
                        Open
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div> */}
        </div>
      </div>
    </div>
  )
}