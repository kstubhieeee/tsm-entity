"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartLine, TrendUp, Users, Clock, Activity, Calendar } from "phosphor-react"

export default function AnalyticsPage() {
  const metrics = [
    {
      title: "Total Diagnoses",
      value: "1,247",
      change: "+12.5%",
      trend: "up",
      icon: Activity,
      color: "bg-blue-100 text-blue-700"
    },
    {
      title: "Patients Treated",
      value: "892",
      change: "+8.3%",
      trend: "up",
      icon: Users,
      color: "bg-green-100 text-green-700"
    },
    {
      title: "Avg. Diagnosis Time",
      value: "18 min",
      change: "-5.2%",
      trend: "down",
      icon: Clock,
      color: "bg-orange-100 text-orange-700"
    },
    {
      title: "AI Accuracy Rate",
      value: "94.2%",
      change: "+2.1%",
      trend: "up",
      icon: ChartLine,
      color: "bg-purple-100 text-purple-700"
    }
  ]

  const recentTrends = [
    { period: "Last 7 Days", diagnoses: 142, patients: 98, accuracy: "93.8%" },
    { period: "Last 30 Days", diagnoses: 587, patients: 412, accuracy: "94.1%" },
    { period: "Last 90 Days", diagnoses: 1689, patients: 1189, accuracy: "94.5%" }
  ]

  const topConditions = [
    { condition: "Hypertension", cases: 234, percentage: 18.8 },
    { condition: "Diabetes Type 2", cases: 189, percentage: 15.2 },
    { condition: "Respiratory Infections", cases: 156, percentage: 12.5 },
    { condition: "Migraine", cases: 134, percentage: 10.8 },
    { condition: "Arthritis", cases: 98, percentage: 7.9 }
  ]

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-instrument-serif text-[#37322F] mb-2">Medical Analytics</h1>
          <p className="text-[rgba(55,50,47,0.80)] font-sans">Performance metrics and diagnostic insights</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <Card key={index} className="border border-[rgba(55,50,47,0.12)] shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${metric.color}`}>
                      <Icon size={24} weight="regular" />
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-sans ${
                      metric.trend === "up" ? "text-green-600" : "text-red-600"
                    }`}>
                      <TrendUp size={16} weight="regular" />
                      <span>{metric.change}</span>
                    </div>
                  </div>
                  <p className="text-sm font-sans text-[rgba(55,50,47,0.80)] mb-1">{metric.title}</p>
                  <p className="text-3xl font-sans font-bold text-[#37322F]">{metric.value}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border border-[rgba(55,50,47,0.12)] shadow-sm">
            <CardHeader>
              <CardTitle className="font-sans font-semibold text-[#37322F] flex items-center gap-2">
                <Calendar size={20} weight="regular" />
                Recent Trends
              </CardTitle>
              <CardDescription className="font-sans">Performance over time periods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTrends.map((trend, index) => (
                  <div key={index} className="p-4 border border-[rgba(55,50,47,0.12)] rounded-lg">
                    <h4 className="font-sans font-semibold text-[#37322F] mb-3">{trend.period}</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-[rgba(55,50,47,0.80)] mb-1">Diagnoses</p>
                        <p className="text-lg font-sans font-bold text-[#37322F]">{trend.diagnoses}</p>
                      </div>
                      <div>
                        <p className="text-[rgba(55,50,47,0.80)] mb-1">Patients</p>
                        <p className="text-lg font-sans font-bold text-[#37322F]">{trend.patients}</p>
                      </div>
                      <div>
                        <p className="text-[rgba(55,50,47,0.80)] mb-1">Accuracy</p>
                        <p className="text-lg font-sans font-bold text-[#37322F]">{trend.accuracy}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[rgba(55,50,47,0.12)] shadow-sm">
            <CardHeader>
              <CardTitle className="font-sans font-semibold text-[#37322F] flex items-center gap-2">
                <Activity size={20} weight="regular" />
                Top Conditions
              </CardTitle>
              <CardDescription className="font-sans">Most frequently diagnosed conditions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topConditions.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-sans font-medium text-[#37322F]">{item.condition}</span>
                      <span className="text-sm font-sans text-[rgba(55,50,47,0.80)]">{item.cases} cases</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[oklch(0.6_0.2_45)] h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs font-sans text-[rgba(55,50,47,0.80)]">{item.percentage}% of total</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border border-[rgba(55,50,47,0.12)] shadow-sm">
          <CardHeader>
            <CardTitle className="font-sans font-semibold text-[#37322F] flex items-center gap-2">
              <ChartLine size={20} weight="regular" />
              Diagnostic Performance Chart
            </CardTitle>
            <CardDescription className="font-sans">Visual representation of diagnostic trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-[rgba(55,50,47,0.12)] rounded-lg">
              <div className="text-center">
                <ChartLine size={48} weight="regular" className="mx-auto mb-4 text-[rgba(55,50,47,0.50)]" />
                <p className="font-sans text-[rgba(55,50,47,0.80)]">Chart visualization will be displayed here</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
