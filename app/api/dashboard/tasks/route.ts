import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { Task, UserTaskCompletion } from "@/lib/models/Task";
import Patient from "@/lib/models/Patient";
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

    // Get all active tasks
    const tasks = await Task.find({ isActive: true })
      .select("title description category coins difficulty icon")
      .lean();

    // Get today's completed tasks for this user
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get the patient document to use its _id
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

    const completedToday = await UserTaskCompletion.find({
      userId: patient._id,
      completedAt: {
        $gte: today,
        $lt: tomorrow,
      },
    }).select("taskId streak");

    const completedTaskIds = new Set(
      completedToday.map((c) => c.taskId.toString())
    );

    // Map tasks with completion status
    const tasksWithStatus = tasks.map((task) => ({
      id: task._id.toString(),
      title: task.title,
      description: task.description,
      category: task.category,
      coins: task.coins,
      difficulty: task.difficulty,
      icon: task.icon,
      completed: completedTaskIds.has(task._id.toString()),
      streak:
        completedToday.find((c) => c.taskId.toString() === task._id.toString())
          ?.streak || 0,
    }));

    return NextResponse.json({
      success: true,
      tasks: tasksWithStatus,
      completedCount: completedToday.length,
      totalTasks: tasks.length,
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch tasks",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Initialize default tasks if none exist
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const existingTasks = await Task.countDocuments();
    if (existingTasks > 0) {
      return NextResponse.json({
        success: true,
        message: "Tasks already exist",
        count: existingTasks,
      });
    }

    const defaultTasks = [
      {
        title: "Complete 7 Push-ups",
        description: "Build upper body strength with 7 push-ups",
        category: "fitness",
        coins: 50,
        difficulty: "easy",
        icon: "Activity",
      },
      {
        title: "Drink 8 Glasses of Water",
        description: "Stay hydrated throughout the day",
        category: "wellness",
        coins: 30,
        difficulty: "easy",
        icon: "Heart",
      },
      {
        title: "10-Minute Meditation",
        description: "Practice mindfulness and reduce stress",
        category: "wellness",
        coins: 40,
        difficulty: "medium",
        icon: "Star",
      },
      {
        title: "Take Daily Vitamins",
        description: "Don't forget your daily supplements",
        category: "medical",
        coins: 25,
        difficulty: "easy",
        icon: "Plus",
      },
      {
        title: "30-Minute Walk",
        description: "Get your daily cardio exercise",
        category: "fitness",
        coins: 60,
        difficulty: "medium",
        icon: "TrendingUp",
      },
      {
        title: "Eat 5 Servings of Fruits/Vegetables",
        description: "Maintain a balanced, nutritious diet",
        category: "nutrition",
        coins: 45,
        difficulty: "medium",
        icon: "Heart",
      },
    ];

    const createdTasks = await Task.insertMany(defaultTasks);

    return NextResponse.json({
      success: true,
      message: "Default tasks created successfully",
      tasks: createdTasks.length,
    });
  } catch (error) {
    console.error("Error creating default tasks:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create default tasks",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
