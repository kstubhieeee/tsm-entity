"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Brain, User, FileText, Activity, Warning, CheckCircle, Clock, TrendUp, ShieldCheck, Heartbeat } from "phosphor-react"

export default function DiagnosisPage() {
  const [patientInfo, setPatientInfo] = useState({
    name: "",
    age: "",
    gender: "",
    symptoms: "",
    medicalHistory: ""
  })
  const [diagnosisStarted, setDiagnosisStarted] = useState(false)
  const [diagnosisComplete, setDiagnosisComplete] = useState(false)

  const handleStartDiagnosis = () => {
    setDiagnosisStarted(true)
    setTimeout(() => {
      setDiagnosisComplete(true)
    }, 2000)
  }

  const diagnosisResults = {
    primaryDiagnosis: {
      condition: "Acute Appendicitis",
      confidence: 87,
      urgency: "High"
    },
    differentialDiagnoses: [
      { condition: "Gastroenteritis", confidence: 12, likelihood: "Low" },
      { condition: "Ovarian Cyst (if female)", confidence: 8, likelihood: "Very Low" },
      { condition: "Urinary Tract Infection", confidence: 5, likelihood: "Very Low" }
    ],
    riskFactors: [
      { factor: "Age (28 years)", risk: "Moderate" },
      { factor: "Symptom duration (6 hours)", risk: "High" },
      { factor: "Localized pain", risk: "High" }
    ],
    recommendations: [
      "Immediate surgical consultation recommended",
      "CT scan or ultrasound to confirm diagnosis",
      "Monitor vital signs closely",
      "Consider pain management while awaiting evaluation"
    ],
    similarCases: [
      { caseId: "C-2024-001", age: 25, gender: "Female", outcome: "Successful appendectomy", similarity: 94 },
      { caseId: "C-2024-045", age: 32, gender: "Male", outcome: "Successful appendectomy", similarity: 89 },
      { caseId: "C-2024-078", age: 19, gender: "Female", outcome: "Successful appendectomy", similarity: 91 }
    ]
  }

  const symptomAnalysis = {
    primarySymptoms: ["Abdominal pain", "Nausea", "Vomiting", "Low-grade fever"],
    severity: "Moderate to Severe",
    duration: "6 hours",
    progression: "Worsening"
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-instrument-serif text-[#37322F] mb-2">AI Diagnosis</h1>
          <p className="text-[rgba(55,50,47,0.80)] font-sans">Advanced AI-powered medical diagnosis</p>
        </div>

        {!diagnosisStarted ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border border-[rgba(55,50,47,0.12)] shadow-sm">
              <CardHeader>
                <CardTitle className="font-sans font-semibold text-[#37322F] flex items-center gap-2">
                  <User size={20} weight="regular" />
                  Patient Information
                </CardTitle>
                <CardDescription className="font-sans">Enter patient details for AI diagnosis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-[#37322F]">Patient Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter patient name"
                      value={patientInfo.name}
                      onChange={(e) => setPatientInfo({ ...patientInfo, name: e.target.value })}
                      className="mt-1 border border-[rgba(55,50,47,0.12)]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="age" className="text-[#37322F]">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="Enter age"
                      value={patientInfo.age}
                      onChange={(e) => setPatientInfo({ ...patientInfo, age: e.target.value })}
                      className="mt-1 border border-[rgba(55,50,47,0.12)]"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="gender" className="text-[#37322F]">Gender</Label>
                  <Select onValueChange={(value) => setPatientInfo({ ...patientInfo, gender: value })}>
                    <SelectTrigger className="mt-1 border border-[rgba(55,50,47,0.12)]">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="symptoms" className="text-[#37322F]">Symptoms</Label>
                  <Textarea
                    id="symptoms"
                    placeholder="Describe patient symptoms in detail..."
                    value={patientInfo.symptoms}
                    onChange={(e) => setPatientInfo({ ...patientInfo, symptoms: e.target.value })}
                    className="mt-1 border border-[rgba(55,50,47,0.12)] min-h-32"
                  />
                </div>
                <div>
                  <Label htmlFor="history" className="text-[#37322F]">Medical History (Optional)</Label>
                  <Textarea
                    id="history"
                    placeholder="Previous medical conditions, medications, allergies..."
                    value={patientInfo.medicalHistory}
                    onChange={(e) => setPatientInfo({ ...patientInfo, medicalHistory: e.target.value })}
                    className="mt-1 border border-[rgba(55,50,47,0.12)] min-h-24"
                  />
                </div>
                <Button
                  onClick={handleStartDiagnosis}
                  disabled={!patientInfo.name || !patientInfo.age || !patientInfo.symptoms}
                  className="w-full bg-[oklch(0.6_0.2_45)] text-white hover:bg-[oklch(0.6_0.2_45)]/90 font-sans font-semibold"
                >
                  <Brain size={20} weight="regular" className="mr-2" />
                  Start AI Diagnosis
                </Button>
              </CardContent>
            </Card>

            <Card className="border border-[rgba(55,50,47,0.12)] shadow-sm">
              <CardHeader>
                <CardTitle className="font-sans font-semibold text-[#37322F] flex items-center gap-2">
                  <FileText size={20} weight="regular" />
                  Quick Reference
                </CardTitle>
                <CardDescription className="font-sans">Tips for accurate diagnosis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-sans font-semibold text-blue-900 mb-2">Symptom Documentation</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Include onset time and duration</li>
                    <li>• Describe pain characteristics</li>
                    <li>• Note associated symptoms</li>
                    <li>• Mention any triggers or alleviating factors</li>
                  </ul>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-sans font-semibold text-green-900 mb-2">AI Analysis Features</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Multi-agent symptom analysis</li>
                    <li>• Literature-based condition matching</li>
                    <li>• Risk factor assessment</li>
                    <li>• Similar case comparison</li>
                  </ul>
                </div>
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h4 className="font-sans font-semibold text-orange-900 mb-2">Important Notes</h4>
                  <ul className="text-sm text-orange-800 space-y-1">
                    <li>• AI diagnosis is a decision support tool</li>
                    <li>• Always verify with clinical judgment</li>
                    <li>• Consider patient history and context</li>
                    <li>• Follow standard medical protocols</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : diagnosisComplete ? (
          <div className="space-y-6">
            <Card className="border border-[rgba(55,50,47,0.12)] shadow-sm bg-green-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle size={32} weight="bold" className="text-green-600" />
                  <div>
                    <h3 className="text-xl font-sans font-bold text-green-900">Diagnosis Complete</h3>
                    <p className="text-sm text-green-700">AI analysis finished successfully</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border border-[rgba(55,50,47,0.12)] shadow-sm">
                <CardHeader>
                  <CardTitle className="font-sans font-semibold text-[#37322F] flex items-center gap-2">
                    <Activity size={20} weight="regular" />
                    Symptom Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-sans text-[rgba(55,50,47,0.80)] mb-2">Primary Symptoms</p>
                    <div className="flex flex-wrap gap-2">
                      {symptomAnalysis.primarySymptoms.map((symptom, index) => (
                        <Badge key={index} className="bg-blue-50 text-blue-700 border-blue-200">
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-sans text-[rgba(55,50,47,0.80)]">Severity</p>
                      <p className="text-lg font-sans font-semibold text-[#37322F]">{symptomAnalysis.severity}</p>
                    </div>
                    <div>
                      <p className="text-sm font-sans text-[rgba(55,50,47,0.80)]">Duration</p>
                      <p className="text-lg font-sans font-semibold text-[#37322F]">{symptomAnalysis.duration}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-sans text-[rgba(55,50,47,0.80)]">Progression</p>
                    <p className="text-lg font-sans font-semibold text-[#37322F]">{symptomAnalysis.progression}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-[rgba(55,50,47,0.12)] shadow-sm">
                <CardHeader>
                  <CardTitle className="font-sans font-semibold text-[#37322F] flex items-center gap-2">
                    <Brain size={20} weight="regular" />
                    Primary Diagnosis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-[oklch(0.6_0.2_45)]/10 border border-[oklch(0.6_0.2_45)] rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-sans font-bold text-[#37322F]">
                        {diagnosisResults.primaryDiagnosis.condition}
                      </h3>
                      <Badge className="bg-red-50 text-red-700 border-red-200">
                        {diagnosisResults.primaryDiagnosis.urgency} Urgency
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[oklch(0.6_0.2_45)] h-2 rounded-full"
                          style={{ width: `${diagnosisResults.primaryDiagnosis.confidence}%` }}
                        />
                      </div>
                      <span className="text-sm font-sans font-semibold text-[#37322F]">
                        {diagnosisResults.primaryDiagnosis.confidence}% confidence
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-sans text-[rgba(55,50,47,0.80)] mb-2">Differential Diagnoses</p>
                    <div className="space-y-2">
                      {diagnosisResults.differentialDiagnoses.map((diagnosis, index) => (
                        <div key={index} className="p-3 border border-[rgba(55,50,47,0.12)] rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="font-sans font-medium text-[#37322F]">{diagnosis.condition}</span>
                            <Badge className="bg-gray-50 text-gray-700 border-gray-200">
                              {diagnosis.confidence}% - {diagnosis.likelihood}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border border-[rgba(55,50,47,0.12)] shadow-sm">
                <CardHeader>
                  <CardTitle className="font-sans font-semibold text-[#37322F] flex items-center gap-2">
                    <ShieldCheck size={20} weight="regular" />
                    Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {diagnosisResults.riskFactors.map((risk, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-[rgba(55,50,47,0.12)] rounded-lg">
                        <span className="font-sans text-[#37322F]">{risk.factor}</span>
                        <Badge
                          className={
                            risk.risk === "High"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : risk.risk === "Moderate"
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                              : "bg-green-50 text-green-700 border-green-200"
                          }
                        >
                          {risk.risk}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-[rgba(55,50,47,0.12)] shadow-sm">
                <CardHeader>
                  <CardTitle className="font-sans font-semibold text-[#37322F] flex items-center gap-2">
                    <Heartbeat size={20} weight="regular" />
                    Treatment Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {diagnosisResults.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border border-[rgba(55,50,47,0.12)] rounded-lg">
                        <CheckCircle size={20} weight="regular" className="text-green-600 mt-0.5" />
                        <span className="font-sans text-[#37322F]">{rec}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border border-[rgba(55,50,47,0.12)] shadow-sm">
              <CardHeader>
                <CardTitle className="font-sans font-semibold text-[#37322F] flex items-center gap-2">
                    <TrendUp size={20} weight="regular" />
                  Similar Cases
                </CardTitle>
                <CardDescription className="font-sans">Historical cases with similar presentations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {diagnosisResults.similarCases.map((caseItem, index) => (
                    <div key={index} className="p-4 border border-[rgba(55,50,47,0.12)] rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-sans font-semibold text-[#37322F]">{caseItem.caseId}</span>
                          <Badge className="bg-green-50 text-green-700 border-green-200">
                            {caseItem.outcome}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-sans text-[rgba(55,50,47,0.80)]">
                            {caseItem.age} years, {caseItem.gender}
                          </span>
                          <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                            {caseItem.similarity}% match
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                onClick={() => {
                  setDiagnosisStarted(false)
                  setDiagnosisComplete(false)
                  setPatientInfo({ name: "", age: "", gender: "", symptoms: "", medicalHistory: "" })
                }}
                variant="outline"
                className="border border-[rgba(55,50,47,0.12)]"
              >
                New Diagnosis
              </Button>
              <Button className="bg-[oklch(0.6_0.2_45)] text-white hover:bg-[oklch(0.6_0.2_45)]/90">
                <FileText size={16} weight="regular" className="mr-2" />
                Save Diagnosis Report
              </Button>
            </div>
          </div>
        ) : (
          <Card className="border border-[rgba(55,50,47,0.12)] shadow-sm">
            <CardContent className="p-12 text-center">
              <Brain size={64} weight="regular" className="mx-auto mb-4 text-[oklch(0.6_0.2_45)] animate-pulse" />
              <h3 className="text-xl font-sans font-semibold text-[#37322F] mb-2">AI Analysis in Progress</h3>
              <p className="text-[rgba(55,50,47,0.80)] mb-4">Processing patient data with multiple AI agents...</p>
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
