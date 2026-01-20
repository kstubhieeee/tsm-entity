import { NextRequest, NextResponse } from "next/server";
import Patient from "@/lib/models/Patient";
import { connectToDatabase } from "@/lib/mongodb-mongoose";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Get top 10 patients sorted by total coins (only patients, not clinicians)
    const topPatients = await Patient.find({ role: "patient" })
      .select(
        "userId personalInfo.name coins level streak completedTasks avatar totalEarned bestStreak"
      )
      .sort({ coins: -1, totalEarned: -1 })
      .limit(10)
      .lean();

    // Calculate weekly rankings
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // For now, we'll use a simple ranking based on current coins
    // In a more complex system, you could track weekly coin earnings
    const leaderboard = topPatients.map((patient, index) => ({
      id: patient._id.toString(),
      name: patient.personalInfo?.name || "Anonymous Patient",
      coins: patient.coins || 0,
      level: patient.level || 1,
      streak: patient.streak || 0,
      completedTasks: patient.completedTasks || 0,
      avatar: patient.avatar || "Users",
      totalEarned: patient.totalEarned || 0,
      bestStreak: patient.bestStreak || 0,
      rankThisWeek: index + 1,
    }));

    return NextResponse.json({
      success: true,
      leaderboard,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch leaderboard",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Update user ranking (called periodically or after significant changes)
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    // Update weekly rankings for all patients
    const patients = await Patient.find({ role: "patient" })
      .sort({ coins: -1, totalEarned: -1 })
      .select("_id");

    const updatePromises = patients.map((patient, index) =>
      Patient.findByIdAndUpdate(patient._id, { rankThisWeek: index + 1 })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: "Rankings updated successfully",
      updatedPatients: patients.length,
    });
  } catch (error) {
    console.error("Error updating rankings:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update rankings",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
