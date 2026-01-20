"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FileText, Upload, PaperPlaneTilt, TrendUp, Warning, CheckCircle, Clock, Activity, ChartLine, Lightning, Leaf, Calendar, ArrowRight, ShieldCheck, Heart, Target } from "phosphor-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface LabAnalysis {
    reportType: string
    testDate: string
    keyFindings: {
        parameter: string
        value: string
        normalRange: string
        status: "Normal" | "High" | "Low" | "Critical"
        significance: string
    }[]
    overallAssessment: {
        status: "Normal" | "Attention Needed" | "Urgent Care Required"
        summary: string
        riskLevel: "Low" | "Medium" | "High"
    }
    recommendations: {
        immediate: string[]
        lifestyle: string[]
        followUp: string[]
        dietary: string[]
    }
    trends: {
        parameter: string
        trend: "Improving" | "Stable" | "Worsening"
        description: string
    }[]
    redFlags: string[]
    nextSteps: string[]
    confidence: number
}

export default function LabAnalyzerPage() {
    const [image, setImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [additionalInfo, setAdditionalInfo] = useState("")
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [analysis, setAnalysis] = useState<LabAnalysis | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isSettingReminder, setIsSettingReminder] = useState(false)
    const [reminderMessage, setReminderMessage] = useState<string | null>(null)

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            if (file.type.startsWith('image/')) {
                setImage(file)
                const reader = new FileReader()
                reader.onload = (e) => {
                    setImagePreview(e.target?.result as string)
                }
                reader.readAsDataURL(file)
                setError(null)
            } else {
                setError("Please upload a valid image file")
            }
        }
    }

    const convertImageToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => {
                const base64String = (reader.result as string).split(',')[1]
                resolve(base64String)
            }
            reader.onerror = reject
            reader.readAsDataURL(file)
        })
    }

    const analyzeLabReport = async () => {
        if (!image) {
            setError("Please upload a lab report image")
            return
        }

        setIsAnalyzing(true)
        setError(null)

        try {
            const base64Image = await convertImageToBase64(image)

            const response = await fetch('/api/analyze-lab-report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: base64Image,
                    additionalInfo: additionalInfo.trim()
                })
            })

            if (!response.ok) {
                throw new Error('Failed to analyze lab report')
            }

            const result = await response.json()
            setAnalysis(result)
        } catch (error) {
            console.error('Error analyzing lab report:', error)
            setError('Failed to analyze lab report. Please try again.')
        } finally {
            setIsAnalyzing(false)
        }
    }

    const setReminder = async () => {
        setIsSettingReminder(true)
        setReminderMessage(null)

        try {
            const reminderTime = new Date()
            reminderTime.setHours(reminderTime.getHours() + 24)

            const requestBody = {
                message: "Reminder set successfully! You will be notified about your medicine schedule✅",
                user: "Hemant",
                time: reminderTime.toISOString()
            }

            const webhookUrl = 'https://n8n.alightbeast.in/webhook/aaaa8f9d-0979-48da-aefd-1f6ecc1ad44e'

            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            })

            if (response.ok) {
                setReminderMessage("Reminder set successfully! You will be notified about your medicine schedule.")
            } else {
                throw new Error('Failed to set reminder')
            }
        } catch (error) {
            console.error('Error setting reminder:', error)
            setReminderMessage("Failed to set reminder. Please try again.")
        } finally {
            setIsSettingReminder(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Normal": return "bg-green-500 text-white"
            case "High": return "bg-yellow-500 text-white"
            case "Low": return "bg-blue-500 text-white"
            case "Critical": return "bg-red-500 text-white"
            default: return "bg-gray-500 text-white"
        }
    }

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case "Low": return "bg-green-500 text-white"
            case "Medium": return "bg-yellow-500 text-white"
            case "High": return "bg-red-500 text-white"
            default: return "bg-gray-500 text-white"
        }
    }

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case "Improving": return <TrendUp size={16} weight="regular" className="text-green-500" />
            case "Stable": return <Activity size={16} weight="regular" className="text-blue-500" />
            case "Worsening": return <TrendUp size={16} weight="regular" className="text-red-500 rotate-180" />
            default: return <Activity size={16} weight="regular" className="text-gray-500" />
        }
    }

    return (
        <div className="min-h-screen bg-white p-6">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    <h1 className="text-4xl font-instrument-serif text-[#37322F] mb-4">
                        AI Lab Report Analyzer
                    </h1>
                    <p className="text-xl text-[rgba(55,50,47,0.80)] font-sans max-w-3xl mx-auto">
                        Upload your medical lab reports and get comprehensive AI-powered analysis with insights, trends, and personalized recommendations
                    </p>
                </motion.div>

                {/* Upload Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    <Card className="border border-[rgba(55,50,47,0.12)] shadow-sm bg-white">
                        <CardHeader className="bg-white">
                            <CardTitle className="font-sans font-semibold text-[#37322F] flex items-center gap-2">
                                <FileText size={20} weight="regular" />
                                Upload Lab Report
                            </CardTitle>
                            <CardDescription className="font-sans">
                                Upload blood test, urine test, X-ray, or any other medical report for analysis
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="bg-white space-y-4">
                            {/* Image Upload */}
                            <div className="border-2 border-dashed border-[rgba(55,50,47,0.12)] rounded-lg p-8 text-center">
                                {imagePreview ? (
                                    <div className="space-y-4">
                                        <img
                                            src={imagePreview}
                                            alt="Lab report preview"
                                            className="max-h-64 mx-auto rounded-lg border border-[rgba(55,50,47,0.12)]"
                                        />
                                        <Button
                                            onClick={() => {
                                                setImage(null)
                                                setImagePreview(null)
                                            }}
                                            variant="outline"
                                            className="border border-[rgba(55,50,47,0.12)] hover:bg-[rgba(55,50,47,0.05)]"
                                        >
                                            Remove Image
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <Upload size={64} weight="regular" className="mx-auto text-[rgba(55,50,47,0.50)]" />
                                        <div>
                                            <p className="text-lg font-sans font-semibold text-[#37322F] mb-2">
                                                Upload Lab Report
                                            </p>
                                            <p className="text-sm font-sans text-[rgba(55,50,47,0.80)] mb-4">
                                                PNG, JPG up to 10MB
                                            </p>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                                id="report-upload"
                                            />
                                            <label htmlFor="report-upload">
                                                <Button
                                                    asChild
                                                    className="bg-[oklch(0.6_0.2_45)] text-white hover:bg-[oklch(0.6_0.2_45)]/90 font-sans font-semibold"
                                                >
                                                    <span className="cursor-pointer">
                                                        Choose Report
                                                    </span>
                                                </Button>
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Additional Information */}
                            <div className="space-y-2">
                                <label className="text-sm font-sans font-medium text-[#37322F]">
                                    Additional Context (Optional)
                                </label>
                                <Textarea
                                    placeholder="Enter your age, symptoms, medical history, medications, or specific concerns about the report..."
                                    value={additionalInfo}
                                    onChange={(e) => setAdditionalInfo(e.target.value)}
                                    className="border border-[rgba(55,50,47,0.12)] rounded-lg font-sans"
                                    rows={3}
                                />
                            </div>

                            {/* Error Display */}
                            {error && (
                                <Alert className="border-2 border-red-500 bg-red-50">
                                    <Warning size={16} weight="regular" />
                                    <AlertDescription className="font-sans">
                                        {error}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Analyze Button */}
                            <Button
                                onClick={analyzeLabReport}
                                disabled={!image || isAnalyzing}
                                className="w-full bg-[oklch(0.6_0.2_45)] text-white border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_#151616] disabled:opacity-50 disabled:cursor-not-allowed font-poppins font-bold text-lg py-6"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                                        />
                                        Analyzing Report...
                                    </>
                                ) : (
                                    <>
                                        <PaperPlaneTilt size={20} weight="regular" className="mr-2" />
                                        Analyze Lab Report
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Analysis Results */}
                {analysis && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-6"
                    >
                        {/* Overall Assessment */}
                        <Card className="border border-[rgba(55,50,47,0.12)] shadow-sm bg-white">
                            <CardHeader className="bg-white">
                                <CardTitle className="font-sans font-semibold text-[#37322F] flex items-center gap-2">
                                    <ChartLine size={20} weight="regular" />
                                    Overall Assessment - {analysis.reportType}
                                </CardTitle>
                                <div className="flex gap-2">
                                    <Badge className={`font-sans ${getRiskColor(analysis.overallAssessment.riskLevel)}`}>
                                        {analysis.overallAssessment.riskLevel} Risk
                                    </Badge>
                                    <Badge className="bg-[oklch(0.6_0.2_45)] text-white font-sans">
                                        {analysis.confidence}% Confidence
                                    </Badge>
                                    <Badge className="bg-white border border-[rgba(55,50,47,0.12)] text-[#37322F] font-sans">
                                        {analysis.testDate}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className={`p-4 rounded-xl border-2 ${analysis.overallAssessment.status === "Normal" ? "bg-green-50 border-green-500" :
                                    analysis.overallAssessment.status === "Attention Needed" ? "bg-yellow-50 border-yellow-500" :
                                        "bg-red-50 border-red-500"
                                    }`}>
                                    <h4 className="font-sans font-semibold text-[#37322F] mb-2">
                                        Status: {analysis.overallAssessment.status}
                                    </h4>
                                    <p className="font-poppins text-[#151616]">
                                        {analysis.overallAssessment.summary}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Key Findings */}
                        <Card className="border border-[rgba(55,50,47,0.12)] shadow-sm bg-white">
                            <CardHeader className="bg-white">
                                <CardTitle className="font-sans font-semibold text-[#37322F] flex items-center gap-2">
                                    <Activity className="w-5 h-5" />
                                    Key Findings
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {analysis.keyFindings.map((finding, idx) => (
                                        <div key={idx} className="p-4 bg-[rgba(55,50,47,0.05)] rounded-lg border border-[rgba(55,50,47,0.12)]">
                                            <div className="flex justify-between items-start mb-2">
                                                <h5 className="font-sans font-semibold text-[#37322F]">
                                                    {finding.parameter}
                                                </h5>
                                                <Badge className={`font-sans ${getStatusColor(finding.status)}`}>
                                                    {finding.status}
                                                </Badge>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                                                <div>
                                                    <p className="text-xs font-sans text-[rgba(55,50,47,0.80)]">Your Value</p>
                                                    <p className="font-sans font-medium text-[#37322F]">{finding.value}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-sans text-[rgba(55,50,47,0.80)]">Normal Range</p>
                                                    <p className="font-sans font-medium text-[#37322F]">{finding.normalRange}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-sans text-[rgba(55,50,47,0.80)]">Status</p>
                                                    <p className="font-sans font-medium text-[#37322F]">{finding.status}</p>
                                                </div>
                                            </div>
                                            <p className="text-sm font-sans text-[rgba(55,50,47,0.80)]">
                                                <strong>Significance:</strong> {finding.significance}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Red Flags */}
                        {analysis.redFlags.length > 0 && (
                            <Card className="border-2 border-red-500 shadow-sm bg-red-50">
                                <CardHeader className="bg-white">
                                    <CardTitle className="font-sans font-semibold text-red-700 flex items-center gap-2">
                                        <Warning size={20} weight="regular" />
                                        Critical Alerts
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {analysis.redFlags.map((flag, idx) => (
                                            <div key={idx} className="p-3 bg-red-100 rounded border border-red-300">
                                                <div className="flex items-center gap-2">
                                                    <Warning size={16} weight="regular" className="text-red-600 flex-shrink-0" />
                                                    <p className="font-sans text-red-800">{flag}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Trends */}
                        {analysis.trends.length > 0 && (
                            <Card className="border border-[rgba(55,50,47,0.12)] shadow-sm bg-white">
                                <CardHeader className="bg-white">
                                    <CardTitle className="font-sans font-semibold text-[#37322F] flex items-center gap-2">
                                        <TrendUp size={20} weight="regular" />
                                        Health Trends
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {analysis.trends.map((trend, idx) => (
                                            <div key={idx} className="p-4 bg-[rgba(55,50,47,0.05)] rounded-lg border border-[rgba(55,50,47,0.12)]">
                                                <div className="flex items-center gap-2 mb-2">
                                                    {getTrendIcon(trend.trend)}
                                                    <h5 className="font-sans font-semibold text-[#37322F]">
                                                        {trend.parameter}
                                                    </h5>
                                                    <Badge className="bg-white border border-[rgba(55,50,47,0.12)] text-[#37322F] font-sans text-xs">
                                                        {trend.trend}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm font-sans text-[rgba(55,50,47,0.80)]">
                                                    {trend.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Recommendations */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Immediate Actions */}
                            <Card className="border border-[rgba(55,50,47,0.12)] shadow-sm bg-white">
                                <CardHeader className="bg-white">
                                    <CardTitle className="font-sans font-semibold text-[#37322F] flex items-center gap-2">
                                        <Clock size={20} weight="regular" />
                                        Immediate Actions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {analysis.recommendations.immediate.map((action, idx) => (
                                            <div key={idx} className="p-3 bg-red-50 rounded border border-red-200">
                                                <div className="flex items-center gap-2">
                                                    <Lightning size={16} weight="regular" className="text-red-600 flex-shrink-0" />
                                                    <p className="font-sans text-[#37322F]">{action}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Lifestyle Changes */}
                            <Card className="border border-[rgba(55,50,47,0.12)] shadow-sm bg-white">
                                <CardHeader className="bg-white">
                                    <CardTitle className="font-sans font-semibold text-[#37322F] flex items-center gap-2">
                                        <CheckCircle size={20} weight="regular" />
                                        Lifestyle Recommendations
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {analysis.recommendations.lifestyle.map((rec, idx) => (
                                            <div key={idx} className="p-3 bg-green-50 rounded border border-green-200">
                                                <div className="flex items-center gap-2">
                                                    <Leaf size={16} weight="regular" className="text-green-600 flex-shrink-0" />
                                                    <p className="font-sans text-[#37322F]">{rec}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Dietary Recommendations */}
                            <Card className="border border-[rgba(55,50,47,0.12)] shadow-sm bg-white">
                                <CardHeader className="bg-white">
                                    <CardTitle className="font-sans font-semibold text-[#37322F] flex items-center gap-2">
                                        <Activity className="w-5 h-5" />
                                        Dietary Guidelines
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {analysis.recommendations.dietary.map((diet, idx) => (
                                            <div key={idx} className="p-3 bg-blue-50 rounded border border-blue-200">
                                                <div className="flex items-center gap-2">
                                                    <Leaf size={16} weight="regular" className="text-blue-600 flex-shrink-0" />
                                                    <p className="font-sans text-[#37322F]">{diet}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Follow-up */}
                            <Card className="border border-[rgba(55,50,47,0.12)] shadow-sm bg-white">
                                <CardHeader className="bg-white">
                                    <CardTitle className="font-sans font-semibold text-[#37322F] flex items-center gap-2">
                                        <Clock size={20} weight="regular" />
                                        Follow-up Actions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {analysis.recommendations.followUp.map((follow, idx) => (
                                            <div key={idx} className="p-3 bg-purple-50 rounded border border-purple-200">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={16} weight="regular" className="text-purple-600 flex-shrink-0" />
                                                    <p className="font-sans text-[#37322F]">{follow}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Next Steps */}
                        <Card className="border border-[rgba(55,50,47,0.12)] shadow-sm bg-white">
                            <CardHeader className="bg-white">
                                <CardTitle className="font-sans font-semibold text-[#37322F] flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5" />
                                    Next Steps
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {analysis.nextSteps.map((step, idx) => (
                                        <div key={idx} className="p-3 bg-[oklch(0.6_0.2_45)]/10 rounded border border-[oklch(0.6_0.2_45)]">
                                            <div className="flex items-center gap-2">
                                                <ArrowRight size={16} weight="regular" className="text-[#37322F] flex-shrink-0" />
                                                <p className="font-sans text-[#37322F]">{step}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Set Reminder Section */}
                        <Card className="border border-[rgba(55,50,47,0.12)] shadow-sm bg-[oklch(0.6_0.2_45)]/10">
                            <CardHeader className="bg-white">
                                <CardTitle className="font-sans font-semibold text-[#37322F] flex items-center gap-2">
                                    <Calendar size={20} weight="regular" />
                                    Set Medicine Reminder
                                </CardTitle>
                                <CardDescription className="font-sans">
                                    Set a reminder to take your medicines based on the analysis recommendations
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="bg-white space-y-4">
                                {reminderMessage && (
                                    <Alert className={`border-2 ${reminderMessage.includes('successfully') ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                                        {reminderMessage.includes('successfully') ?
                                            <CheckCircle className="h-4 w-4" /> :
                                            <Warning size={16} weight="regular" />
                                        }
                                        <AlertDescription className="font-sans">
                                            {reminderMessage}
                                        </AlertDescription>
                                    </Alert>
                                )}
                                <Button
                                    onClick={setReminder}
                                    disabled={isSettingReminder}
                                    className="w-full bg-[oklch(0.6_0.2_45)] text-white hover:bg-[oklch(0.6_0.2_45)]/90 disabled:opacity-50 disabled:cursor-not-allowed font-sans font-semibold text-lg py-6"
                                >
                                    {isSettingReminder ? (
                                        <>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                                            />
                                            Setting Reminder...
                                        </>
                                    ) : (
                                        <>
                                            <Calendar className="w-5 h-5 mr-2" />
                                            Set Medicine Reminder
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Disclaimer */}
                        <Alert className="border-2 border-orange-500 bg-orange-50">
                            <Warning size={16} weight="regular" />
                            <AlertDescription className="font-sans">
                                <strong>Medical Disclaimer:</strong> This AI analysis is for informational purposes only and should not replace professional medical consultation. Always discuss your lab results with a qualified healthcare provider for proper interpretation and treatment recommendations.
                            </AlertDescription>
                        </Alert>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
