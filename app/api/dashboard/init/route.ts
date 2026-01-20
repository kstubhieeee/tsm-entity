import { NextRequest, NextResponse } from "next/server";
import Patient from "@/lib/models/Patient";
import { Task } from "@/lib/models/Task";
import { connectToDatabase } from "@/lib/mongodb-mongoose";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    // Initialize leaderboard data for existing patients
    // First, add some demo patients with leaderboard data
    const demoPatients = [
      {
        userId: "sarah.chen@example.com",
        role: "patient",
        hasCompletedInfo: true,
        personalInfo: {
          name: "Sarah Chen",
          email: "sarah.chen@example.com",
          age: 28,
          gender: "female",
        },
        medicalHistory: {
          conditions: [],
          medications: [],
          allergies: [],
          surgeries: [],
          familyHistory: [],
        },
        coins: 1180,
        level: 7,
        streak: 8,
        completedTasks: 142,
        avatar: "Stethoscope",
        totalEarned: 2500,
        bestStreak: 15,
        rankThisWeek: 2,
      },
      {
        userId: "dr.mike@example.com",
        role: "patient",
        hasCompletedInfo: true,
        personalInfo: {
          name: "Dr. Mike",
          email: "dr.mike@example.com",
          age: 34,
          gender: "male",
        },
        medicalHistory: {
          conditions: [],
          medications: [],
          allergies: [],
          surgeries: [],
          familyHistory: [],
        },
        coins: 1050,
        level: 6,
        streak: 15,
        completedTasks: 128,
        avatar: "UserCheck",
        totalEarned: 2200,
        bestStreak: 28,
        rankThisWeek: 3,
      },
      {
        userId: "alex.runner@example.com",
        role: "patient",
        hasCompletedInfo: true,
        personalInfo: {
          name: "Alex Runner",
          email: "alex.runner@example.com",
          age: 25,
          gender: "other",
        },
        medicalHistory: {
          conditions: [],
          medications: [],
          allergies: [],
          surgeries: [],
          familyHistory: [],
        },
        coins: 980,
        level: 6,
        streak: 6,
        completedTasks: 119,
        avatar: "Zap",
        totalEarned: 1980,
        bestStreak: 12,
        rankThisWeek: 4,
      },
    ];

    // Check if demo patients exist, if not create them
    let createdPatientsCount = 0;
    for (const demoPatient of demoPatients) {
      const existingPatient = await Patient.findOne({
        userId: demoPatient.userId,
      });
      if (!existingPatient) {
        await Patient.create(demoPatient);
        createdPatientsCount++;
      }
    }

    // Update existing patients to have default leaderboard fields
    const existingPatients = await Patient.find({
      role: "patient",
      $or: [{ coins: { $exists: false } }, { coins: null }],
    });

    let updatedPatientsCount = 0;
    for (const patient of existingPatients) {
      await Patient.findByIdAndUpdate(patient._id, {
        $set: {
          coins: 0,
          level: 1,
          streak: 0,
          completedTasks: 0,
          avatar: "Users",
          totalEarned: 0,
          bestStreak: 0,
          rankThisWeek: 0,
        },
      });
      updatedPatientsCount++;
    }

    // Initialize comprehensive health tasks
    const defaultTasks = [
      // Fitness Tasks
      {
        title: "Complete 10 Push-ups",
        description: "Build upper body strength with 10 push-ups",
        category: "fitness",
        coins: 50,
        difficulty: "easy",
        icon: "Activity",
      },
      {
        title: "30-Minute Walk",
        description: "Get your daily cardio exercise with a brisk walk",
        category: "fitness",
        coins: 60,
        difficulty: "medium",
        icon: "TrendingUp",
      },
      {
        title: "15-Minute Yoga Session",
        description: "Practice yoga for flexibility and strength",
        category: "fitness",
        coins: 70,
        difficulty: "medium",
        icon: "Activity",
      },
      {
        title: "Climb 5 Flights of Stairs",
        description: "Take the stairs instead of elevator today",
        category: "fitness",
        coins: 40,
        difficulty: "easy",
        icon: "TrendingUp",
      },
      {
        title: "20 Squats Challenge",
        description: "Complete 20 squats to strengthen your legs",
        category: "fitness",
        coins: 55,
        difficulty: "medium",
        icon: "Activity",
      },

      // Nutrition Tasks
      {
        title: "Eat 5 Servings of Fruits/Vegetables",
        description: "Maintain a balanced, nutritious diet",
        category: "nutrition",
        coins: 80,
        difficulty: "medium",
        icon: "Heart",
      },
      {
        title: "Drink 8 Glasses of Water",
        description: "Stay properly hydrated throughout the day",
        category: "nutrition",
        coins: 30,
        difficulty: "easy",
        icon: "Heart",
      },
      {
        title: "Avoid Processed Foods",
        description: "Choose whole foods over processed options today",
        category: "nutrition",
        coins: 75,
        difficulty: "hard",
        icon: "Heart",
      },
      {
        title: "Eat a Healthy Breakfast",
        description: "Start your day with a nutritious breakfast",
        category: "nutrition",
        coins: 45,
        difficulty: "easy",
        icon: "Heart",
      },
      {
        title: "Limit Sugar Intake",
        description: "Keep added sugar under 25g today",
        category: "nutrition",
        coins: 65,
        difficulty: "medium",
        icon: "Heart",
      },

      // Wellness Tasks
      {
        title: "10-Minute Meditation",
        description: "Practice mindfulness and reduce stress",
        category: "wellness",
        coins: 60,
        difficulty: "medium",
        icon: "Star",
      },
      {
        title: "Get 8 Hours of Sleep",
        description: "Ensure adequate rest for recovery and health",
        category: "wellness",
        coins: 70,
        difficulty: "medium",
        icon: "Star",
      },
      {
        title: "Practice Deep Breathing",
        description: "5 minutes of deep breathing exercises",
        category: "wellness",
        coins: 35,
        difficulty: "easy",
        icon: "Star",
      },
      {
        title: "Digital Detox Hour",
        description: "Spend 1 hour away from screens today",
        category: "wellness",
        coins: 50,
        difficulty: "medium",
        icon: "Star",
      },
      {
        title: "Practice Gratitude",
        description: "Write down 3 things you're grateful for today",
        category: "wellness",
        coins: 40,
        difficulty: "easy",
        icon: "Star",
      },

      // Medical Tasks
      {
        title: "Take Daily Vitamins",
        description: "Don't forget your daily supplements",
        category: "medical",
        coins: 25,
        difficulty: "easy",
        icon: "Plus",
      },
      {
        title: "Check Blood Pressure",
        description: "Monitor your blood pressure if you have a device",
        category: "medical",
        coins: 45,
        difficulty: "easy",
        icon: "Plus",
      },
      {
        title: "Medication Adherence",
        description: "Take all prescribed medications as directed",
        category: "medical",
        coins: 50,
        difficulty: "easy",
        icon: "Plus",
      },
      {
        title: "Track Symptoms",
        description: "Log any symptoms or health changes today",
        category: "medical",
        coins: 35,
        difficulty: "easy",
        icon: "Plus",
      },
      {
        title: "Hand Hygiene",
        description: "Wash hands thoroughly at least 6 times today",
        category: "medical",
        coins: 30,
        difficulty: "easy",
        icon: "Plus",
      },

      // Bonus Challenge Tasks
      {
        title: "Complete Health Assessment",
        description: "Fill out a comprehensive health questionnaire",
        category: "medical",
        coins: 100,
        difficulty: "hard",
        icon: "Plus",
      },
      {
        title: "Meal Prep Sunday",
        description: "Prepare healthy meals for the week",
        category: "nutrition",
        coins: 120,
        difficulty: "hard",
        icon: "Heart",
      },
      {
        title: "60-Minute Workout",
        description: "Complete an hour-long exercise session",
        category: "fitness",
        coins: 150,
        difficulty: "hard",
        icon: "Activity",
      },
      {
        title: "Mindful Eating Practice",
        description: "Eat at least one meal without distractions",
        category: "wellness",
        coins: 55,
        difficulty: "medium",
        icon: "Star",
      },
    ];

    const existingTasks = await Task.countDocuments();
    let createdTasksCount = 0;

    if (existingTasks === 0) {
      await Task.insertMany(defaultTasks);
      createdTasksCount = defaultTasks.length;
    }

    return NextResponse.json({
      success: true,
      message: "Database initialized successfully",
      demoPatientsCreated: createdPatientsCount,
      existingPatientsUpdated: updatedPatientsCount,
      tasksCreated: createdTasksCount,
      existingTasks: existingTasks > 0 ? existingTasks : createdTasksCount,
    });
  } catch (error) {
    console.error("Error initializing database:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to initialize database",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
