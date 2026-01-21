import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import Patient from "@/lib/models/Patient";
import { Task } from "@/lib/models/Task";
import { connectToDatabase } from "@/lib/mongodb-mongoose";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Check if current user's patient document exists, if not create it
    let currentPatient = await Patient.findOne({
      userId: session.user.email,
      role: "patient",
    });

    if (!currentPatient) {
      currentPatient = await Patient.create({
        userId: session.user.email,
        role: "patient",
        hasCompletedInfo: false,
        personalInfo: {
          email: session.user.email,
        },
        medicalHistory: {
          conditions: [],
          medications: [],
          allergies: [],
          surgeries: [],
          familyHistory: [],
        },
        coins: 0,
        level: 1,
        streak: 0,
        completedTasks: 0,
        avatar: "Users",
        totalEarned: 0,
        bestStreak: 0,
        rankThisWeek: 0,
      });
    } else {
      // Update existing patient to ensure all leaderboard fields exist
      const updateFields: any = {};
      if (currentPatient.coins === undefined || currentPatient.coins === null) updateFields.coins = 0;
      if (currentPatient.level === undefined || currentPatient.level === null) updateFields.level = 1;
      if (currentPatient.streak === undefined || currentPatient.streak === null) updateFields.streak = 0;
      if (currentPatient.completedTasks === undefined || currentPatient.completedTasks === null) updateFields.completedTasks = 0;
      if (currentPatient.totalEarned === undefined || currentPatient.totalEarned === null) updateFields.totalEarned = 0;
      if (currentPatient.bestStreak === undefined || currentPatient.bestStreak === null) updateFields.bestStreak = 0;
      if (!currentPatient.avatar) updateFields.avatar = "Users";

      if (Object.keys(updateFields).length > 0) {
        await Patient.findByIdAndUpdate(currentPatient._id, { $set: updateFields });
      }
    }

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
      {
        title: "Complete 10 Push-ups",
        description: "Build upper body strength with 10 push-ups. Record yourself performing proper form push-ups.",
        category: "fitness",
        coins: 50,
        difficulty: "easy",
        icon: "Activity",
      },
      {
        title: "30-Minute Walk",
        description: "Get your daily cardio exercise with a brisk walk. Record yourself walking continuously for 30 minutes.",
        category: "fitness",
        coins: 60,
        difficulty: "medium",
        icon: "TrendingUp",
      },
      {
        title: "15-Minute Yoga Session",
        description: "Practice yoga for flexibility and strength. Record yourself performing yoga poses for 15 minutes.",
        category: "fitness",
        coins: 70,
        difficulty: "medium",
        icon: "Activity",
      },
      {
        title: "20 Squats Challenge",
        description: "Complete 20 squats to strengthen your legs. Record yourself performing proper form squats.",
        category: "fitness",
        coins: 55,
        difficulty: "medium",
        icon: "Activity",
      },
      {
        title: "Complete 15 Jumping Jacks",
        description: "Boost your heart rate with 15 jumping jacks. Record yourself performing the exercise.",
        category: "fitness",
        coins: 45,
        difficulty: "easy",
        icon: "Activity",
      },
      {
        title: "30-Second Plank Hold",
        description: "Strengthen your core with a 30-second plank. Record yourself holding proper plank form.",
        category: "fitness",
        coins: 50,
        difficulty: "easy",
        icon: "Activity",
      },
      {
        title: "Complete 20 Lunges",
        description: "Build leg strength with 20 lunges (10 per leg). Record yourself performing proper form lunges.",
        category: "fitness",
        coins: 60,
        difficulty: "medium",
        icon: "Activity",
      },
      {
        title: "10-Minute Stretching Routine",
        description: "Improve flexibility with a 10-minute stretching session. Record yourself performing stretches.",
        category: "fitness",
        coins: 40,
        difficulty: "easy",
        icon: "Activity",
      },
      {
        title: "Complete 25 Sit-ups",
        description: "Strengthen your core with 25 sit-ups. Record yourself performing proper form sit-ups.",
        category: "fitness",
        coins: 55,
        difficulty: "medium",
        icon: "Activity",
      },
      {
        title: "5-Minute High-Intensity Workout",
        description: "Complete a 5-minute high-intensity workout. Record yourself performing the exercises.",
        category: "fitness",
        coins: 65,
        difficulty: "hard",
        icon: "Activity",
      },
      {
        title: "Complete 30 Burpees",
        description: "Full-body exercise challenge with 30 burpees. Record yourself performing the complete movement.",
        category: "fitness",
        coins: 80,
        difficulty: "hard",
        icon: "Activity",
      },
      {
        title: "20-Minute Cardio Session",
        description: "Get your heart pumping with 20 minutes of cardio. Record yourself during the workout.",
        category: "fitness",
        coins: 70,
        difficulty: "medium",
        icon: "TrendingUp",
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

      {
        title: "10-Minute Meditation",
        description: "Practice mindfulness and reduce stress. Record yourself in a calm, meditative state for 10 minutes.",
        category: "wellness",
        coins: 60,
        difficulty: "medium",
        icon: "Star",
      },
      {
        title: "Practice Deep Breathing",
        description: "5 minutes of deep breathing exercises. Record yourself performing breathing exercises.",
        category: "wellness",
        coins: 35,
        difficulty: "easy",
        icon: "Star",
      },
      {
        title: "15-Minute Guided Meditation",
        description: "Follow a guided meditation session for 15 minutes. Record yourself during the meditation.",
        category: "wellness",
        coins: 65,
        difficulty: "medium",
        icon: "Star",
      },
      {
        title: "Morning Stretch Routine",
        description: "Start your day with a 10-minute morning stretch. Record yourself performing the stretches.",
        category: "wellness",
        coins: 45,
        difficulty: "easy",
        icon: "Star",
      },
      {
        title: "Evening Relaxation Session",
        description: "Wind down with a 15-minute relaxation session. Record yourself in a calm, relaxed state.",
        category: "wellness",
        coins: 55,
        difficulty: "medium",
        icon: "Star",
      },
      {
        title: "Tai Chi Practice",
        description: "Practice Tai Chi movements for 10 minutes. Record yourself performing the slow, flowing movements.",
        category: "wellness",
        coins: 60,
        difficulty: "medium",
        icon: "Star",
      },
      {
        title: "Progressive Muscle Relaxation",
        description: "Practice progressive muscle relaxation for 10 minutes. Record yourself during the exercise.",
        category: "wellness",
        coins: 50,
        difficulty: "medium",
        icon: "Star",
      },
      {
        title: "Sun Salutation Sequence",
        description: "Complete 3 rounds of sun salutation. Record yourself performing the yoga sequence.",
        category: "wellness",
        coins: 55,
        difficulty: "medium",
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
        description: "Complete an hour-long exercise session. Record yourself performing various exercises throughout the session.",
        category: "fitness",
        coins: 150,
        difficulty: "hard",
        icon: "Activity",
      },
      {
        title: "Complete 50 Push-ups",
        description: "Advanced upper body challenge with 50 push-ups. Record yourself performing proper form push-ups.",
        category: "fitness",
        coins: 120,
        difficulty: "hard",
        icon: "Activity",
      },
      {
        title: "45-Minute Running Session",
        description: "Complete a 45-minute running or jogging session. Record yourself during the run.",
        category: "fitness",
        coins: 100,
        difficulty: "hard",
        icon: "TrendingUp",
      },
      {
        title: "Full Body Strength Training",
        description: "Complete a 30-minute full body strength training session. Record yourself performing the exercises.",
        category: "fitness",
        coins: 90,
        difficulty: "hard",
        icon: "Activity",
      },
      {
        title: "Complete 100 Squats",
        description: "Ultimate leg strength challenge with 100 squats. Record yourself performing proper form squats.",
        category: "fitness",
        coins: 130,
        difficulty: "hard",
        icon: "Activity",
      },
      {
        title: "30-Minute Yoga Flow",
        description: "Complete a 30-minute yoga flow sequence. Record yourself performing the yoga poses.",
        category: "wellness",
        coins: 80,
        difficulty: "medium",
        icon: "Star",
      },
      {
        title: "20-Minute Meditation Session",
        description: "Deep meditation practice for 20 minutes. Record yourself in a calm, meditative state.",
        category: "wellness",
        coins: 75,
        difficulty: "hard",
        icon: "Star",
      },
    ];

    const existingTasks = await Task.countDocuments();
    let createdTasksCount = 0;

    console.log(`Existing tasks in database: ${existingTasks}`);
    console.log(`Default tasks to create: ${defaultTasks.length}`);

    if (existingTasks === 0) {
      console.log(`Creating ${defaultTasks.length} default tasks...`);
      try {
        const result = await Task.insertMany(defaultTasks);
        createdTasksCount = result.length;
        console.log(`Successfully created ${createdTasksCount} tasks`);
      } catch (error) {
        console.error('Error inserting tasks:', error);
      }
    } else if (existingTasks < defaultTasks.length) {
      // Some tasks are missing, let's add the rest
      console.log(`Only ${existingTasks} tasks exist, should be ${defaultTasks.length}. Adding missing tasks...`);
      try {
        // Get existing task titles to avoid duplicates
        const existingTaskTitles = await Task.find({}).select('title').lean();
        const existingTitles = new Set(existingTaskTitles.map(t => t.title));
        
        // Filter out tasks that already exist
        const tasksToAdd = defaultTasks.filter(task => !existingTitles.has(task.title));
        
        if (tasksToAdd.length > 0) {
          const result = await Task.insertMany(tasksToAdd);
          createdTasksCount = result.length;
          console.log(`Successfully created ${createdTasksCount} additional tasks`);
        }
      } catch (error) {
        console.error('Error adding missing tasks:', error);
      }
    } else {
      console.log(`Tasks already exist, skipping creation`);
    }

    const finalTaskCount = await Task.countDocuments();
    console.log(`Total tasks in database after init: ${finalTaskCount}`);

    return NextResponse.json({
      success: true,
      message: "Database initialized successfully",
      currentPatientInitialized: true,
      demoPatientsCreated: createdPatientsCount,
      existingPatientsUpdated: updatedPatientsCount,
      tasksCreated: createdTasksCount,
      existingTasks: finalTaskCount,
      totalTasks: finalTaskCount,
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
