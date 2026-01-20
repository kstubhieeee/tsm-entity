"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Star,
  Clock,
  Calendar,
  User,
  CurrencyInr,
  CheckCircle,
  ArrowLeft,
  CreditCard,
  Heartbeat,
  Coins
} from "phosphor-react"
import CoinDiscount from "@/components/payment/coin-discount"

interface Doctor {
  id: string
  name: string
  specialization: string
  experience: string
  rating: number
  consultationFee: number
  image: string
  bio: string
  availability: {
    day: string
    slots: string[]
  }[]
}

interface Appointment {
  id: string
  patientId: string
  doctorId: string
  doctorName: string
  specialization: string
  date: string
  time: string
  status: "scheduled" | "completed" | "cancelled"
  consultationFee: number
  paymentId?: string
  createdAt: string
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function AppointmentsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [selectedDay, setSelectedDay] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [currentStep, setCurrentStep] = useState<"doctors" | "booking" | "payment">("doctors")
  const [loading, setLoading] = useState(false)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [discountData, setDiscountData] = useState<{
    useCoinDiscount: boolean;
    discountAmount: number;
    finalAmount: number;
    coinsUsed: number;
  }>({
    useCoinDiscount: false,
    discountAmount: 0,
    finalAmount: 0,
    coinsUsed: 0,
  })

  useEffect(() => {
    fetchDoctors()
    fetchAppointments()
  }, [])

  const fetchDoctors = async () => {
    try {
      const response = await fetch("/api/doctors")
      const data = await response.json()
      setDoctors(data.doctors || [])
    } catch (error) {
      console.error("Failed to fetch doctors:", error)
    }
  }

  const fetchAppointments = async () => {
    try {
      const response = await fetch("/api/appointments")
      const data = await response.json()
      setAppointments(data.appointments || [])
    } catch (error) {
      console.error("Failed to fetch appointments:", error)
    }
  }

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setCurrentStep("booking")
    setSelectedDay("")
    setSelectedTime("")
  }

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedDay || !selectedTime) return

    setLoading(true)
    try {
      // Apply coin discount if selected
      let discountTransactionId = null;
      if (discountData.useCoinDiscount && discountData.coinsUsed > 0) {
        console.log("Applying coin discount...");
        const discountResponse = await fetch("/api/payment/apply-coin-discount", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            appointmentId: `apt_${Date.now()}`,
            originalAmount: selectedDoctor.consultationFee,
            discountAmount: discountData.discountAmount,
            finalAmount: discountData.finalAmount,
            paymentId: null, // Will be set after payment success
          }),
        });

        if (discountResponse.ok) {
          const discountResult = await discountResponse.json();
          if (discountResult.success) {
            discountTransactionId = discountResult.transaction.id;
            console.log("Coin discount applied successfully");
          }
        }
      }

      console.log("Creating payment order...");
      const finalAmount = discountData.useCoinDiscount ? discountData.finalAmount : selectedDoctor.consultationFee;

      const orderResponse = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalAmount,
          receipt: `apt_${Date.now().toString().slice(-8)}`,
        }),
      });

      if (!orderResponse.ok) {
        const errorText = await orderResponse.text()
        console.error("Order creation failed:", errorText)

        let errorData;
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText }
        }

        const errorMessage = errorData.details || errorData.error || `HTTP ${orderResponse.status}`
        throw new Error(`Payment setup failed: ${errorMessage}`)
      }

      const orderData = await orderResponse.json()
      console.log("Order created successfully:", orderData)

      if (orderData.error) {
        throw new Error(orderData.error)
      }

      if (!window.Razorpay) {
        console.error("Razorpay script not loaded")
        throw new Error("Payment gateway not available. Please refresh and try again.")
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Medira",
        description: `Consultation with ${selectedDoctor.name}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          await verifyPayment(response, orderData.orderId)
        },
        prefill: {
          name: "Patient",
          email: "patient@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "oklch(0.6_0.2_45)"
        },
        modal: {
          ondismiss: function () {
            console.log("Payment modal closed")
            setLoading(false)
          }
        }
      }

      console.log("Opening Razorpay with options:", options)
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) {
      console.error("Payment failed:", error)
      alert(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setLoading(false)
    }
  }

  const verifyPayment = async (paymentResponse: any, orderId: string) => {
    try {
      const verifyResponse = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentResponse.razorpay_payment_id,
          razorpaySignature: paymentResponse.razorpay_signature
        })
      })

      const verifyData = await verifyResponse.json()

      if (verifyData.success) {
        const appointment = await createAppointment(verifyData.paymentId)
        if (appointment && appointment.id) {
          await recordPayment(verifyData.paymentId, orderId, appointment.id)
        }
      }
    } catch (error) {
      console.error("Payment verification failed:", error)
    }
  }

  const createAppointment = async (paymentId: string) => {
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: selectedDoctor?.id,
          doctorName: selectedDoctor?.name,
          specialization: selectedDoctor?.specialization,
          date: selectedDay,
          time: selectedTime,
          consultationFee: discountData.useCoinDiscount ? discountData.finalAmount : selectedDoctor?.consultationFee,
          originalFee: selectedDoctor?.consultationFee,
          discountAmount: discountData.useCoinDiscount ? discountData.discountAmount : 0,
          coinsUsed: discountData.useCoinDiscount ? discountData.coinsUsed : 0,
          paymentId
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setCurrentStep("doctors")
        setSelectedDoctor(null)
        fetchAppointments()
        return data.appointment
      } else {
        throw new Error(data.error || "Failed to create appointment")
      }
    } catch (error) {
      console.error("Failed to create appointment:", error)
      throw error
    }
  }

  const recordPayment = async (paymentId: string, orderId: string, appointmentId: string) => {
    try {
      await fetch("/api/payment/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId,
          doctorId: selectedDoctor?.id,
          amount: selectedDoctor?.consultationFee,
          razorpayPaymentId: paymentId,
          razorpayOrderId: orderId,
          status: "completed"
        })
      })
    } catch (error) {
      console.error("Failed to record payment:", error)
    }
  }

  const getAvailableSlots = (day: string) => {
    if (!selectedDoctor) return []
    const dayAvailability = selectedDoctor.availability.find(a => a.day === day)
    return dayAvailability?.slots || []
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        const existingScript = document.getElementById('razorpay-script')

        if (existingScript) {
          resolve(true)
          return
        }

        const script = document.createElement('script')
        script.id = 'razorpay-script'
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.async = true

        script.onload = () => {
          console.log('Razorpay script loaded successfully')
          resolve(true)
        }

        script.onerror = () => {
          console.error('Failed to load Razorpay script')
          resolve(false)
        }

        document.body.appendChild(script)
      })
    }

    loadRazorpayScript()

    return () => {
      const script = document.getElementById('razorpay-script')
      if (script) {
        document.body.removeChild(script)
      }
    }
  }, [])

  if (currentStep === "booking" && selectedDoctor) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Button
              onClick={() => setCurrentStep("doctors")}
              className="mb-4 bg-white text-[#37322F] border border-[rgba(55,50,47,0.12)] hover:bg-[rgba(55,50,47,0.05)]"
            >
              <ArrowLeft size={16} weight="regular" className="mr-2" />
              Back to Doctors
            </Button>
            <h1 className="text-4xl font-instrument-serif text-[#37322F] mb-2">
              Book Appointment
            </h1>
            <p className="text-[rgba(55,50,47,0.80)] font-sans">
              Schedule your consultation with {selectedDoctor.name}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border border-[rgba(55,50,47,0.12)] shadow-sm bg-white">
                <CardHeader className="bg-white">
                  <CardTitle className="font-sans font-semibold text-[#37322F] flex items-center gap-2">
                    <User size={24} weight="regular" className="text-blue-600" />
                    Doctor Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="bg-white space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-[oklch(0.6_0.2_45)] rounded-xl border-2 border-[#151616] flex items-center justify-center">
                      <Heartbeat size={32} weight="regular" className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-sans font-semibold text-[#37322F] text-lg">
                        {selectedDoctor.name}
                      </h3>
                      <p className="text-[rgba(55,50,47,0.80)]">{selectedDoctor.specialization}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Star size={16} weight="fill" className="text-yellow-500" />
                        <span className="text-sm font-medium">{selectedDoctor.rating}</span>
                        <span className="text-sm text-[rgba(55,50,47,0.80)]">• {selectedDoctor.experience}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[rgba(55,50,47,0.80)] text-sm">{selectedDoctor.bio}</p>
                    <div className="flex items-center gap-2 p-3 bg-[oklch(0.6_0.2_45)]/10 rounded-lg border border-[oklch(0.6_0.2_45)]">
                      <CurrencyInr size={20} weight="regular" className="text-green-600" />
                      <span className="font-semibold text-[#37322F]">
                        ₹{selectedDoctor.consultationFee.toLocaleString()}
                      </span>
                      <span className="text-[rgba(55,50,47,0.80)] text-sm">consultation fee</span>
                    </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border border-[rgba(55,50,47,0.12)] shadow-sm bg-white">
                <CardHeader className="bg-white">
                  <CardTitle className="font-sans font-semibold text-[#37322F] flex items-center gap-2">
                    <Calendar size={24} weight="regular" className="text-green-600" />
                    Select Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="bg-white space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[#151616] mb-2">
                      Available Days
                    </label>
                    <Select onValueChange={setSelectedDay}>
                      <SelectTrigger className="border border-[rgba(55,50,47,0.12)]">
                        <SelectValue placeholder="Select a day" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedDoctor.availability.map((day) => (
                          <SelectItem key={day.day} value={day.day}>
                            {day.day} ({day.slots.length} slots available)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedDay && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <label className="block text-sm font-medium text-[#37322F] mb-2">
                        Available Time Slots
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {getAvailableSlots(selectedDay).map((slot) => (
                          <Button
                            key={slot}
                            onClick={() => setSelectedTime(slot)}
                            className={`text-sm font-medium border transition-all ${selectedTime === slot
                                ? "bg-[oklch(0.6_0.2_45)] text-white border-[oklch(0.6_0.2_45)]"
                                : "bg-white text-[#37322F] hover:bg-[oklch(0.6_0.2_45)]/10 border-[rgba(55,50,47,0.12)]"
                              }`}
                          >
                            {slot}
                          </Button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {selectedDay && selectedTime && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-green-50 rounded-xl border-2 border-green-200"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-800">Appointment Summary</span>
                      </div>
                      <p className="text-sm text-green-700">
                        <strong>{selectedDoctor.name}</strong> on <strong>{selectedDay}</strong> at <strong>{selectedTime}</strong>
                      </p>
                      {discountData.useCoinDiscount ? (
                        <div className="text-sm text-green-700">
                          <p className="line-through opacity-60">
                            Original Fee: ₹{selectedDoctor.consultationFee.toLocaleString()}
                          </p>
                          <p className="font-bold">
                            Discounted Fee: <span className="text-lg">₹{discountData.finalAmount.toLocaleString()}</span>
                          </p>
                          <p className="flex items-center gap-1">
                            <Coins size={16} weight="regular" className="text-yellow-500" />
                            <span>100 coins used • 20% discount applied</span>
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-green-700">
                          Consultation Fee: <strong>₹{selectedDoctor.consultationFee.toLocaleString()}</strong>
                        </p>
                      )}
                    </motion.div>
                  )}

                  {selectedDay && selectedTime && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <CoinDiscount
                        originalAmount={selectedDoctor.consultationFee}
                        onDiscountChange={setDiscountData}
                      />
                    </motion.div>
                  )}

                  <Button
                    onClick={handleBookAppointment}
                    disabled={!selectedDay || !selectedTime || loading}
                    className="w-full bg-[oklch(0.6_0.2_45)] text-white hover:bg-[oklch(0.6_0.2_45)]/90 disabled:opacity-50 disabled:cursor-not-allowed font-sans font-semibold"
                  >
                    <CreditCard size={16} weight="regular" className="mr-2" />
                    {loading
                      ? "Processing..."
                      : `Pay ₹${discountData.useCoinDiscount ? discountData.finalAmount : selectedDoctor.consultationFee} & Book`
                    }
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-sans font-bold text-[#37322F] mb-2">
            Book Your Appointment
          </h1>
          <p className="text-[rgba(55,50,47,0.80)] font-sans">
            Choose from our experienced doctors and schedule your consultation
          </p>
        </motion.div>

        {appointments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="border border-[rgba(55,50,47,0.12)] shadow-sm bg-white">
              <CardHeader className="bg-white">
                <CardTitle className="font-instrument-serif font-bold text-[#151616] flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-blue-600" />
                  Your Upcoming Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="p-4 bg-white rounded-lg border border-[rgba(55,50,47,0.12)] shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-sans font-semibold text-[#37322F]">
                            {appointment.doctorName}
                          </h4>
                          <p className="text-sm text-[rgba(55,50,47,0.80)]">{appointment.specialization}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-1">
                              <Calendar size={16} weight="regular" className="text-green-600" />
                              <span className="text-sm">{formatDate(appointment.date)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={16} weight="regular" className="text-blue-600" />
                              <span className="text-sm">{appointment.time}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            {appointment.status}
                          </Badge>
                          <p className="text-sm font-semibold text-[#37322F] mt-1">
                            ₹{appointment.consultationFee.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor, index) => (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
            >
              <Card className="border border-[rgba(55,50,47,0.12)] shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer h-full">
                <CardContent className="bg-white p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-[oklch(0.6_0.2_45)] rounded-xl border-2 border-[#151616] flex items-center justify-center">
                      <Heartbeat size={32} weight="regular" className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-sans font-semibold text-[#37322F] text-lg">
                        {doctor.name}
                      </h3>
                      <p className="text-[#151616]/70">{doctor.specialization}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Star size={16} weight="fill" className="text-yellow-500" />
                        <span className="text-sm font-medium">{doctor.rating}</span>
                        <span className="text-sm text-[#151616]/70">• {doctor.experience}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[#151616]/70 text-sm mb-4">{doctor.bio}</p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <CurrencyInr size={16} weight="regular" className="text-green-600" />
                      <span className="font-semibold text-[#37322F]">
                        ₹{doctor.consultationFee.toLocaleString()}
                      </span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                      {doctor.availability.length} days available
                    </Badge>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-[#151616] mb-2">Available Days:</p>
                    <div className="flex flex-wrap gap-1">
                      {doctor.availability.slice(0, 3).map((day) => (
                        <Badge
                          key={day.day}
                          className="bg-green-100 text-green-800 border-green-200 text-xs"
                        >
                          {day.day}
                        </Badge>
                      ))}
                      {doctor.availability.length > 3 && (
                        <Badge className="bg-gray-100 text-gray-800 border-gray-200 text-xs">
                          +{doctor.availability.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                    <Button
                    onClick={() => handleDoctorSelect(doctor)}
                    className="w-full bg-[oklch(0.6_0.2_45)] text-white hover:bg-[oklch(0.6_0.2_45)]/90 transition-all duration-200 font-sans font-semibold"
                  >
                    <Calendar size={16} weight="regular" className="mr-2" />
                    Book Appointment
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
