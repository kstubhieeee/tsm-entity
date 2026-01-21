"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Activity, MagnifyingGlass, Warning, CheckCircle, Clock, Heartbeat } from "phosphor-react"

export default function SymptomCheckerPage() {
  const [symptoms, setSymptoms] = useState("")
  const [analysisStarted, setAnalysisStarted] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)

  const handleAnalyze = () => {
    setAnalysisStarted(true)
    setTimeout(() => {
      setAnalysisComplete(true)
    }, 2000)
  }

  const analysisResults = {
    possibleConditions: [
      { condition: "Common Cold", confidence: 65, severity: "Low" },
      { condition: "Seasonal Allergies", confidence: 25, severity: "Low" },
      { condition: "Sinusitis", confidence: 10, severity: "Medium" }
    ],
    recommendations: [
      "Rest and stay hydrated",
      "Monitor symptoms for 2-3 days",
      "Consider over-the-counter cold medication",
      "If symptoms worsen, consult a healthcare provider"
    ],
    urgency: "Low",
    nextSteps: [
      "Continue monitoring symptoms",
      "Schedule appointment if symptoms persist beyond 3 days",
      "Seek immediate care if breathing difficulties occur"
    ]
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-instrument-serif text-[#37322F] mb-2">Symptom Checker</h1>
          <p className="text-[rgba(55,50,47,0.80)] font-sans">AI-powered symptom analysis</p>
        </div>

        {!analysisStarted ? (
          <Card className="border border-[rgba(55,50,47,0.12)] shadow-sm">
            <CardHeader>
              <CardTitle className="font-sans font-semibold text-[#37322F] flex items-center gap-2">
                <Activity size={20} weight="regular" />
                Describe Your Symptoms
              </CardTitle>
              <CardDescription className="font-sans">Enter details about your symptoms for AI analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-sans font-medium text-[#37322F] mb-2 block">
                  Symptoms
                </label>
                <Textarea
                  placeholder="Describe your symptoms in detail (e.g., headache, fever, cough, duration, severity)..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="border border-[rgba(55,50,47,0.12)] min-h-32"
                />
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={!symptoms.trim()}
                className="w-full bg-[oklch(0.6_0.2_45)] text-white hover:bg-[oklch(0.6_0.2_45)]/90 font-sans font-semibold"
              >
                <MagnifyingGlass size={20} weight="regular" className="mr-2" />
                Analyze Symptoms
              </Button>
            </CardContent>
          </Card>
        ) : analysisComplete ? (
          <div className="space-y-6">
            <Card className="border border-[rgba(55,50,47,0.12)] shadow-sm bg-green-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle size={32} weight="bold" className="text-green-600" />
                  <div>
                    <h3 className="text-xl font-sans font-bold text-green-900">Analysis Complete</h3>
                    <p className="text-sm text-green-700">AI analysis finished successfully</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-[rgba(55,50,47,0.12)] shadow-sm">
              <CardHeader>
                <CardTitle className="font-sans font-semibold text-[#37322F] flex items-center gap-2">
                  <Heartbeat size={20} weight="regular" />
                  Possible Conditions
                </CardTitle>
                <CardDescription className="font-sans">Based on your symptoms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisResults.possibleConditions.map((item, index) => (
                    <div key={index} className="p-4 border border-[rgba(55,50,47,0.12)] rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-sans font-semibold text-[#37322F]">{item.condition}</h4>
                        <Badge
                          className={
                            item.severity === "Low"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : item.severity === "Medium"
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }
                        >
                          {item.severity} Risk
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[oklch(0.6_0.2_45)] h-2 rounded-full"
                            style={{ width: `${item.confidence}%` }}
                          />
                        </div>
                        <span className="text-sm font-sans font-semibold text-[#37322F]">
                          {item.confidence}% match
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-[rgba(55,50,47,0.12)] shadow-sm">
              <CardHeader>
                <CardTitle className="font-sans font-semibold text-[#37322F] flex items-center gap-2">
                  <CheckCircle size={20} weight="regular" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysisResults.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border border-[rgba(55,50,47,0.12)] rounded-lg">
                      <CheckCircle size={20} weight="regular" className="text-green-600 mt-0.5" />
                      <span className="font-sans text-[#37322F]">{rec}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-[rgba(55,50,47,0.12)] shadow-sm">
              <CardHeader>
                <CardTitle className="font-sans font-semibold text-[#37322F] flex items-center gap-2">
                  <Clock size={20} weight="regular" />
                  Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysisResults.nextSteps.map((step, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border border-[rgba(55,50,47,0.12)] rounded-lg">
                      <Warning size={20} weight="regular" className="text-blue-600 mt-0.5" />
                      <span className="font-sans text-[#37322F]">{step}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                onClick={() => {
                  setAnalysisStarted(false)
                  setAnalysisComplete(false)
                  setSymptoms("")
                }}
                variant="outline"
                className="border border-[rgba(55,50,47,0.12)]"
              >
                New Analysis
              </Button>
              <Button className="bg-[oklch(0.6_0.2_45)] text-white hover:bg-[oklch(0.6_0.2_45)]/90">
                Schedule Appointment
              </Button>
            </div>
          </div>
        ) : (
          <Card className="border border-[rgba(55,50,47,0.12)] shadow-sm">
            <CardContent className="p-12 text-center">
              <Activity size={64} weight="regular" className="mx-auto mb-4 text-[oklch(0.6_0.2_45)] animate-pulse" />
              <h3 className="text-xl font-sans font-semibold text-[#37322F] mb-2">Analyzing Symptoms</h3>
              <p className="text-[rgba(55,50,47,0.80)] mb-4">Processing your symptoms with AI...</p>
              <div className="flex items-center justify-center gap-2">
                <Clock size={20} weight="regular" className="text-[rgba(55,50,47,0.80)] animate-spin" />
                <span className="text-sm font-sans text-[rgba(55,50,47,0.80)]">Please wait</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
