import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-helpers"
import { connectDB } from "@/lib/mongodb-mongoose"
import Appointment from "@/lib/models/Appointment"
import Doctor from "@/lib/models/Doctor"
import Payment from "@/lib/models/Payment"

export interface Appointment {
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

export async function GET() {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    await connectDB()
    
    const appointments = await Appointment.find({ 
      patientId: session.user.email 
    }).sort({ createdAt: -1 })

    const formattedAppointments = appointments.map(apt => ({
      id: apt._id.toString(),
      patientId: apt.patientId,
      doctorId: apt.doctorId,
      doctorName: apt.doctorName,
      specialization: apt.specialization,
      date: apt.date,
      time: apt.time,
      status: apt.status,
      consultationFee: apt.consultationFee,
      paymentId: apt.paymentId,
      createdAt: apt.createdAt.toISOString()
    }))

    return NextResponse.json({ 
      appointments: formattedAppointments,
      success: true 
    })
  } catch (error) {
    console.error("Failed to fetch appointments:", error)
    return NextResponse.json(
      { error: "Failed to fetch appointments", success: false },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    await connectDB()

    const body = await request.json()
    const { doctorId, doctorName, specialization, date, time, consultationFee, paymentId, originalFee, discountAmount, coinsUsed } = body

    console.log('Creating appointment with data:', { doctorId, doctorName, specialization, date, time, consultationFee, paymentId });

    if (!doctorId || !doctorName || !date || !time || !consultationFee) {
      console.error('Missing required fields:', { doctorId, doctorName, date, time, consultationFee });
      return NextResponse.json(
        { error: "Missing required fields", success: false },
        { status: 400 }
      )
    }

    // Try to find doctor but don't block appointment creation if not found
    let doctor = null;
    try {
      doctor = await Doctor.findById(doctorId)
      console.log(`Doctor found: ${doctor ? doctor.name : 'Not found'}`);
    } catch (error) {
      console.warn('Error finding doctor:', error);
    }
    
    // Note: We're being lenient with slot checking to avoid blocking legitimate appointments
    // In production, you may want stricter validation

    // Create unique appointment ID
    const appointmentId = `apt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Get patient name from email if not in session
    const patientName = session.user.name || session.user.email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    // Create the appointment
    const appointment = new Appointment({
      appointmentId,
      patientId: session.user.email,
      doctorId,
      patientName,
      doctorName,
      specialization: specialization || 'General',
      date,
      time,
      consultationFee,
      originalFee: originalFee || consultationFee,
      discountAmount: discountAmount || 0,
      coinsUsed: coinsUsed || 0,
      status: "scheduled",
      paymentId,
      paymentStatus: paymentId ? "completed" : "pending"
    })

    await appointment.save()
    console.log("Appointment saved successfully:", appointmentId);

    // Book the slot with the doctor if doctor exists
    if (doctor && typeof doctor.bookSlot === 'function') {
      try {
        await doctor.bookSlot(date, time, session.user.email)
      } catch (error) {
        console.warn('Failed to book slot with doctor:', error)
        // Continue anyway - appointment is created
      }
    }

    console.log("New appointment created:", appointment.appointmentId)

    return NextResponse.json({ 
      appointment: {
        id: appointment._id.toString(),
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        doctorName: appointment.doctorName,
        specialization: appointment.specialization,
        date: appointment.date,
        time: appointment.time,
        status: appointment.status,
        consultationFee: appointment.consultationFee,
        paymentId: appointment.paymentId,
        createdAt: appointment.createdAt.toISOString()
      },
      success: true 
    })
  } catch (error) {
    console.error("Failed to create appointment:", error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error details:", errorMessage);
    return NextResponse.json(
      { error: "Failed to create appointment", details: errorMessage, success: false },
      { status: 500 }
    )
  }
}
