"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Users, MagnifyingGlass, Calendar, FileText, Activity, Phone, Envelope } from "phosphor-react"

export default function PatientsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const patients = [
    {
      id: "1",
      name: "John Doe",
      age: 45,
      gender: "Male",
      lastVisit: "2024-01-15",
      status: "Active",
      condition: "Hypertension",
      phone: "+1 234-567-8900",
      email: "john.doe@email.com"
    },
    {
      id: "2",
      name: "Sarah Johnson",
      age: 32,
      gender: "Female",
      lastVisit: "2024-01-10",
      status: "Active",
      condition: "Diabetes Type 2",
      phone: "+1 234-567-8901",
      email: "sarah.j@email.com"
    },
    {
      id: "3",
      name: "Michael Chen",
      age: 28,
      gender: "Male",
      lastVisit: "2024-01-08",
      status: "Follow-up",
      condition: "Migraine",
      phone: "+1 234-567-8902",
      email: "m.chen@email.com"
    },
    {
      id: "4",
      name: "Emily Davis",
      age: 55,
      gender: "Female",
      lastVisit: "2023-12-20",
      status: "Inactive",
      condition: "Arthritis",
      phone: "+1 234-567-8903",
      email: "emily.d@email.com"
    }
  ]

  const stats = [
    { label: "Total Patients", value: "247", icon: Users, color: "bg-blue-100 text-blue-700" },
    { label: "Active Cases", value: "189", icon: Activity, color: "bg-green-100 text-green-700" },
    { label: "This Month", value: "42", icon: Calendar, color: "bg-orange-100 text-orange-700" },
    { label: "Pending Reports", value: "12", icon: FileText, color: "bg-purple-100 text-purple-700" }
  ]

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-sans font-bold text-[#37322F] mb-2">Patient Management</h1>
          <p className="text-[rgba(55,50,47,0.80)] font-sans">Manage patient cases and medical records</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="border border-[rgba(55,50,47,0.12)] shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-sans text-[rgba(55,50,47,0.80)] mb-1">{stat.label}</p>
                      <p className="text-2xl font-sans font-bold text-[#37322F]">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                      <Icon size={24} weight="regular" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card className="border border-[rgba(55,50,47,0.12)] shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-sans font-semibold text-[#37322F]">Patient Directory</CardTitle>
                <CardDescription className="font-sans">Search and manage patient records</CardDescription>
              </div>
              <div className="relative w-64">
                <MagnifyingGlass size={20} weight="regular" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgba(55,50,47,0.50)]" />
                <Input
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border border-[rgba(55,50,47,0.12)]"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {patients.map((patient) => (
                <div
                  key={patient.id}
                  className="p-4 border border-[rgba(55,50,47,0.12)] rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-sans font-semibold text-[#37322F]">{patient.name}</h3>
                        <Badge
                          className={
                            patient.status === "Active"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : patient.status === "Follow-up"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-gray-50 text-gray-700 border-gray-200"
                          }
                        >
                          {patient.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-[rgba(55,50,47,0.80)]">
                        <div>
                          <span className="font-medium">Age:</span> {patient.age} years
                        </div>
                        <div>
                          <span className="font-medium">Gender:</span> {patient.gender}
                        </div>
                        <div>
                          <span className="font-medium">Condition:</span> {patient.condition}
                        </div>
                        <div>
                          <span className="font-medium">Last Visit:</span> {patient.lastVisit}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-sm text-[rgba(55,50,47,0.80)]">
                        <div className="flex items-center gap-1">
                          <Phone size={16} weight="regular" />
                          <span>{patient.phone}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Envelope size={16} weight="regular" />
                          <span>{patient.email}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm" className="border border-[rgba(55,50,47,0.12)]">
                        View Records
                      </Button>
                      <Button size="sm" className="bg-[oklch(0.6_0.2_45)] text-white hover:bg-[oklch(0.6_0.2_45)]/90">
                        Schedule Visit
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
