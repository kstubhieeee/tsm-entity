"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Calendar, User, Activity, FileArrowDown } from "phosphor-react"

export default function HealthRecordsPage() {
  const records = [
    {
      id: "1",
      type: "Lab Report",
      date: "2024-01-15",
      doctor: "Dr. Smith",
      description: "Complete Blood Count (CBC)",
      status: "Available",
      category: "Laboratory"
    },
    {
      id: "2",
      type: "Prescription",
      date: "2024-01-10",
      doctor: "Dr. Johnson",
      description: "Medication prescription for hypertension",
      status: "Active",
      category: "Prescription"
    },
    {
      id: "3",
      type: "X-Ray Report",
      date: "2023-12-20",
      doctor: "Dr. Williams",
      description: "Chest X-Ray examination",
      status: "Available",
      category: "Imaging"
    },
    {
      id: "4",
      type: "Discharge Summary",
      date: "2023-11-15",
      doctor: "Dr. Brown",
      description: "Hospital discharge summary",
      status: "Archived",
      category: "Hospital"
    }
  ]

  const stats = [
    { label: "Total Records", value: "24", icon: FileText, color: "bg-blue-100 text-blue-700" },
    { label: "This Month", value: "5", icon: Calendar, color: "bg-green-100 text-green-700" },
    { label: "Active Prescriptions", value: "3", icon: Activity, color: "bg-orange-100 text-orange-700" },
    { label: "Pending Reports", value: "2", icon: FileArrowDown, color: "bg-purple-100 text-purple-700" }
  ]

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-instrument-serif text-[#37322F] mb-2">Health Records</h1>
          <p className="text-[rgba(55,50,47,0.80)] font-sans">Your complete medical history and documents</p>
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
            <CardTitle className="font-sans font-semibold text-[#37322F] flex items-center gap-2">
              <FileText size={20} weight="regular" />
              Medical Records
            </CardTitle>
            <CardDescription className="font-sans">Access and download your medical documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="p-4 border border-[rgba(55,50,47,0.12)] rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-sans font-semibold text-[#37322F]">{record.type}</h3>
                        <Badge
                          className={
                            record.status === "Active"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : record.status === "Available"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-gray-50 text-gray-700 border-gray-200"
                          }
                        >
                          {record.status}
                        </Badge>
                        <Badge className="bg-purple-50 text-purple-700 border-purple-200">
                          {record.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-[rgba(55,50,47,0.80)] mb-2">{record.description}</p>
                      <div className="flex items-center gap-4 text-sm text-[rgba(55,50,47,0.80)]">
                        <div className="flex items-center gap-1">
                          <User size={16} weight="regular" />
                          <span>{record.doctor}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={16} weight="regular" />
                          <span>{record.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm" className="border border-[rgba(55,50,47,0.12)]">
                        <FileText size={16} weight="regular" className="mr-2" />
                        View
                      </Button>
                      <Button size="sm" className="bg-[oklch(0.6_0.2_45)] text-white hover:bg-[oklch(0.6_0.2_45)]/90">
                        <Download size={16} weight="regular" className="mr-2" />
                        Download
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
