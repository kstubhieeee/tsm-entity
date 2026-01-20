import { NextRequest, NextResponse } from "next/server";
import { EnhancedMedicalCoordinatorAgent } from "@/lib/enhanced-medical-agents";
import connectDB from "@/lib/mongodb-mongoose";
import Patient from "@/lib/models/Patient";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const coordinator = new EnhancedMedicalCoordinatorAgent();
    const history = await coordinator.getPatientHistory(userId, limit);

    // Also get patient profile
    await connectDB();
    const patient = await Patient.findOne({ userId });

    return NextResponse.json({
      success: true,
      data: {
        patient: patient || null,
        diagnosisHistory: history,
        totalSessions: history.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Patient history API error:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch patient history",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, personalInfo, medicalHistory } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    await connectDB();
    
    const updateData: Record<string, unknown> = {};
    if (personalInfo) {
      Object.keys(personalInfo).forEach(key => {
        if (personalInfo[key] !== undefined) {
          updateData[`personalInfo.${key}`] = personalInfo[key];
        }
      });
    }
    
    if (medicalHistory) {
      Object.keys(medicalHistory).forEach(key => {
        if (medicalHistory[key] !== undefined) {
          updateData[`medicalHistory.${key}`] = medicalHistory[key];
        }
      });
    }

    const patient = await Patient.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      data: patient,
      message: "Patient information updated successfully",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Update patient info API error:", error);
    return NextResponse.json(
      { 
        error: "Failed to update patient information",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}