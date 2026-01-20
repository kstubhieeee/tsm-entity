import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { Task } from "@/lib/models/Task";
import Patient from "@/lib/models/Patient";
import { CoinTransaction } from "@/lib/models/CoinTransaction";
import { connectToDatabase } from "@/lib/mongodb-mongoose";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Get patient info
    const patient = await Patient.findOne({
      userId: session.user.email,
      role: "patient",
    }).select("_id");

    if (!patient) {
      return NextResponse.json(
        { success: false, error: "Patient not found" },
        { status: 404 }
      );
    }

    // Get all available tasks
    const allTasks = await Task.find({ isActive: true }).lean();

    // Get today's completed tasks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const completedToday = await CoinTransaction.find({
      userId: patient._id,
      completedAt: {
        $gte: today,
        $lt: tomorrow,
      },
    }).select("taskId");

    const completedTaskIds = new Set(
      completedToday.map((c) => c.taskId.toString())
    );

    // Select daily tasks (mix of different categories)
    const dailyTasks = selectDailyTasks(allTasks, completedTaskIds);

    return NextResponse.json({
      success: true,
      tasks: dailyTasks,
      completedCount: completedToday.length,
      totalAvailable: dailyTasks.length,
    });
  } catch (error) {
    console.error("Error fetching daily tasks:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch daily tasks",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

function selectDailyTasks(allTasks: any[], completedTaskIds: Set<string>) {
  // Categorize tasks
  const categories = {
    fitness: allTasks.filter((task) => task.category === "fitness"),
    nutrition: allTasks.filter((task) => task.category === "nutrition"),
    wellness: allTasks.filter((task) => task.category === "wellness"),
    medical: allTasks.filter((task) => task.category === "medical"),
  };

  // Select a balanced mix for daily tasks
  const selectedTasks = [];

  // Pick 2 fitness tasks
  const availableFitness = categories.fitness.filter(
    (task) => !completedTaskIds.has(task._id.toString())
  );
  selectedTasks.push(...shuffleArray(availableFitness).slice(0, 2));

  // Pick 2 nutrition tasks
  const availableNutrition = categories.nutrition.filter(
    (task) => !completedTaskIds.has(task._id.toString())
  );
  selectedTasks.push(...shuffleArray(availableNutrition).slice(0, 2));

  // Pick 2 wellness tasks
  const availableWellness = categories.wellness.filter(
    (task) => !completedTaskIds.has(task._id.toString())
  );
  selectedTasks.push(...shuffleArray(availableWellness).slice(0, 2));

  // Pick 2 medical tasks
  const availableMedical = categories.medical.filter(
    (task) => !completedTaskIds.has(task._id.toString())
  );
  selectedTasks.push(...shuffleArray(availableMedical).slice(0, 2));

  // Format tasks for frontend
  return selectedTasks.map((task) => ({
    id: task._id.toString(),
    title: task.title,
    description: task.description,
    category: task.category,
    coins: task.coins,
    difficulty: task.difficulty,
    icon: task.icon,
    completed: completedTaskIds.has(task._id.toString()),
    streak: 0, // This would be calculated based on user history
  }));
}

function shuffleArray(array: any[]) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Endpoint to complete a task
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

    const { taskId } = await request.json();

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: "Task ID is required" },
        { status: 400 }
      );
    }

    // Get patient and task info
    const [patient, task] = await Promise.all([
      Patient.findOne({
        userId: session.user.email,
        role: "patient",
      }),
      Task.findById(taskId),
    ]);

    if (!patient) {
      return NextResponse.json(
        { success: false, error: "Patient not found" },
        { status: 404 }
      );
    }

    if (!task) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    // Check if task was already completed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingCompletion = await CoinTransaction.findOne({
      userId: patient._id,
      taskId: taskId,
      completedAt: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    if (existingCompletion) {
      return NextResponse.json(
        { success: false, error: "Task already completed today" },
        { status: 409 }
      );
    }

    // Calculate streak bonus
    const recentCompletions = await CoinTransaction.find({
      userId: patient._id,
      taskId: taskId,
    })
      .sort({ completedAt: -1 })
      .limit(10);

    let currentStreak = 1;
    if (recentCompletions.length > 0) {
      // Calculate consecutive days
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      for (const completion of recentCompletions) {
        const completionDate = new Date(completion.completedAt);
        completionDate.setHours(0, 0, 0, 0);

        if (completionDate.getTime() === yesterday.getTime()) {
          currentStreak++;
          yesterday.setDate(yesterday.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Calculate bonus coins based on difficulty and streak
    let bonusCoins = 0;

    // Streak bonus (every 3 consecutive days)
    if (currentStreak >= 3 && currentStreak % 3 === 0) {
      bonusCoins += Math.floor(task.coins * 0.5);
    }

    // Difficulty bonus on weekends
    const isWeekend = today.getDay() === 0 || today.getDay() === 6;
    if (isWeekend && task.difficulty === "hard") {
      bonusCoins += Math.floor(task.coins * 0.3);
    }

    const totalCoins = task.coins + bonusCoins;

    // Create transaction record
    const transaction = new CoinTransaction({
      userId: patient._id,
      taskId: task._id,
      taskTitle: task.title,
      taskCategory: task.category,
      coinsEarned: task.coins,
      difficulty: task.difficulty,
      streakAtCompletion: currentStreak,
      bonusCoins: bonusCoins,
      totalCoinsAwarded: totalCoins,
      completedAt: new Date(),
    });

    await transaction.save();

    // Update patient stats
    const updatedPatient = await Patient.findByIdAndUpdate(
      patient._id,
      {
        $inc: {
          coins: totalCoins,
          completedTasks: 1,
          totalEarned: totalCoins,
        },
        $set: {
          streak: Math.max(patient.streak || 0, currentStreak),
          lastTaskCompletionDate: new Date(),
        },
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction._id,
        coinsEarned: totalCoins,
        bonusCoins: bonusCoins,
        streak: currentStreak,
        newLevel: updatedPatient.level,
      },
      userData: {
        coins: updatedPatient.coins,
        level: updatedPatient.level,
        streak: updatedPatient.streak,
        completedTasks: updatedPatient.completedTasks,
        totalEarned: updatedPatient.totalEarned,
      },
    });
  } catch (error) {
    console.error("Error completing task:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to complete task",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
