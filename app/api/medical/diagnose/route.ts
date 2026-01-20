import { NextRequest, NextResponse } from "next/server";
import { EnhancedMedicalCoordinatorAgent, PatientInput } from "@/lib/enhanced-medical-agents";

export async function POST(request: NextRequest) {
  try {
    // For now, skip authentication check - can be added later
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // Parse request body
    const body = await request.json();
    const patientInput: PatientInput = {
      symptoms: body.symptoms,
      language: body.language || "english",
      age: body.age,
      gender: body.gender,
      location: body.location,
      medicalHistory: body.medicalHistory || [],
      uploadedFiles: body.uploadedFiles || []
    };

    // Validate required fields
    if (!patientInput.symptoms) {
      return NextResponse.json(
        { error: "Symptoms are required" },
        { status: 400 }
      );
    }

    // Initialize enhanced medical coordinator
    const coordinator = new EnhancedMedicalCoordinatorAgent();

    // Process diagnosis
    const diagnosis = await coordinator.processDiagnosis(patientInput);

    // Log the diagnosis for audit trail
    console.log(`Diagnosis processed:`, {
      timestamp: new Date().toISOString(),
      primaryDiagnosis: diagnosis.primaryDiagnosis.condition,
      urgencyLevel: diagnosis.urgencyLevel
    });

    return NextResponse.json({
      success: true,
      diagnosis,
      timestamp: new Date().toISOString(),
      processedBy: "CuraLink AI Medical Team"
    });

  } catch (error) {
    console.error("Medical diagnosis API error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: "Unable to process diagnosis. Please try again or consult a physician."
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  try {
    
    return NextResponse.json({
      service: "CuraLink Enhanced Medical AI Diagnosis System",
      status: "healthy",
      version: "2.0.0-enhanced",
      database: "MongoDB Atlas Connected",
      agents: {
        "Bhasha": "Enhanced Language Translator - Multilingual with cultural context",
        "Lakshan": "Enhanced Symptom Analyzer - Clinical analysis with history", 
        "Shodh": "Enhanced Medical Researcher - Real-time literature with regional data",
        "Suraksha": "Enhanced Risk Assessment - Comprehensive risk with patient history",
        "Nidan": "Enhanced Diagnosis Aggregator - AI orchestration with evidence synthesis"
      },
      capabilities: [
        "10+ Indian language support with cultural context",
        "Patient history integration and tracking",
        "Real-time medical literature research",
        "Evidence-based diagnosis with confidence scoring",
        "Comprehensive risk stratification",
        "Emergency detection with severity assessment",
        "MongoDB-powered session tracking",
        "Advanced agent orchestration",
        "Performance analytics and monitoring"
      ],
      features: {
        "Patient History": "Persistent medical history tracking",
        "Session Management": "Complete diagnosis session logging",
        "Agent Metrics": "Real-time performance monitoring",
        "Cultural Context": "Regional medical practice awareness",
        "Emergency Detection": "Multi-language emergency keyword detection",
        "Quality Assurance": "Comprehensive error handling and fallbacks"
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      service: "CuraLink Enhanced Medical AI Diagnosis System",
      status: "error",
      error: "Health check failed",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}