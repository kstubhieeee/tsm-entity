import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Task } from "@/lib/models/Task";
import Patient from "@/lib/models/Patient";
import { CoinTransaction } from "@/lib/models/CoinTransaction";
import { connectToDatabase } from "@/lib/mongodb-mongoose";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    await connectToDatabase();

    const formData = await request.formData();
    const taskId = formData.get("taskId") as string;
    const videoFile = formData.get("video") as File;

    if (!taskId || !videoFile) {
      return NextResponse.json(
        { success: false, error: "Task ID and video file are required" },
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

    // Validate video file
    if (videoFile.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "Video file size exceeds 50MB limit" },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "video/mp4",
      "video/mpeg",
      "video/mov",
      "video/avi",
      "video/webm",
      "video/quicktime",
    ];

    if (!allowedTypes.includes(videoFile.type)) {
      return NextResponse.json(
        { success: false, error: "Unsupported video format" },
        { status: 400 }
      );
    }

    // Generate task-specific verification prompt
    const verificationPrompt = generateTaskPrompt(task);

    // Process video with Gemini AI
    const videoBytes = await videoFile.arrayBuffer();
    const videoBase64 = Buffer.from(videoBytes).toString("base64");

    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = [
      {
        inlineData: {
          data: videoBase64,
          mimeType: videoFile.type,
        },
      },
      { text: verificationPrompt },
    ];

    const startTime = Date.now();
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);

    // Parse AI response
    let verification;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        verification = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback parsing if JSON is not properly formatted
        verification = parseTextResponse(responseText, task);
      }
    } catch (parseError) {
      verification = parseTextResponse(responseText, task);
    }

    // If task verification passed, award coins
    if (verification.taskCompleted) {
      // Calculate streak and bonus coins (similar to daily-tasks endpoint)
      const recentCompletions = await CoinTransaction.find({
        userId: patient._id,
        taskId: taskId,
      })
        .sort({ completedAt: -1 })
        .limit(10);

      let currentStreak = 1;
      if (recentCompletions.length > 0) {
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

      // Calculate bonus coins
      let bonusCoins = 0;

      // Video verification bonus (20% extra for verified tasks)
      bonusCoins += Math.floor(task.coins * 0.2);

      // Streak bonus (every 3 consecutive days)
      if (currentStreak >= 3 && currentStreak % 3 === 0) {
        bonusCoins += Math.floor(task.coins * 0.5);
      }

      // Perfect execution bonus
      if (verification.qualityScore && verification.qualityScore >= 90) {
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
        taskCompleted: true,
        verification: verification,
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
        processingTime: `${processingTime}s`,
      });
    } else {
      return NextResponse.json({
        success: true,
        taskCompleted: false,
        verification: verification,
        processingTime: `${processingTime}s`,
      });
    }
  } catch (error) {
    console.error("Error verifying task:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to verify task",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

function generateTaskPrompt(task: any): string {
  const basePrompt = `You are an AI fitness and health coach analyzing a video to verify if a user completed a specific task correctly. 

Task Details:
- Title: ${task.title}
- Description: ${task.description}
- Category: ${task.category}
- Difficulty: ${task.difficulty}

Please analyze the video carefully and determine:
1. Did the person complete the task as described?
2. If it's a fitness task, was the form/technique correct?
3. Did they meet the required repetitions/duration?
4. Rate the overall quality of execution (0-100)

`;

  let specificInstructions = "";

  // Generate task-specific verification criteria
  switch (task.category) {
    case "fitness":
      if (
        task.title.toLowerCase().includes("push-up") ||
        task.title.toLowerCase().includes("pushup")
      ) {
        specificInstructions = `
For Push-ups specifically:
- Count the number of push-ups performed
- Check if they went down to at least 90-degree elbow angle
- Verify they pushed back up to fully extended arms
- Ensure proper plank position (straight back, no sagging)
- Required count: ${extractNumber(task.title)} push-ups
`;
      } else if (task.title.toLowerCase().includes("squat")) {
        specificInstructions = `
For Squats specifically:
- Count the number of squats performed
- Check if thighs went parallel to ground or below
- Verify they stood back up fully
- Ensure proper form (knees tracking over toes, back straight)
- Required count: ${extractNumber(task.title)} squats
`;
      } else if (task.title.toLowerCase().includes("walk")) {
        specificInstructions = `
For Walking/Cardio tasks:
- Estimate the duration of continuous movement
- Check if the person maintained a good pace
- Verify they stayed active for the required time
- Required duration: ${extractDuration(task.title)} minutes
`;
      } else {
        specificInstructions = `
For general fitness tasks:
- Verify the specific movement/exercise was performed
- Count repetitions if applicable
- Check form and technique
- Ensure they met the task requirements
`;
      }
      break;

    case "wellness":
      if (
        task.title.toLowerCase().includes("meditation") ||
        task.title.toLowerCase().includes("breathing")
      ) {
        specificInstructions = `
For Meditation/Breathing tasks:
- Verify the person was seated or lying in a calm position
- Check if they maintained stillness for the required duration
- Look for signs of focused breathing or meditation posture
- Required duration: ${extractDuration(task.title)} minutes
`;
      } else {
        specificInstructions = `
For wellness tasks:
- Verify the person performed the wellness activity
- Check if they maintained focus and proper form
- Ensure they completed the full duration or requirement
`;
      }
      break;

    default:
      specificInstructions = `
Verify that the person completed the task as described in the title and description.
Check for proper execution and completion of all requirements.
`;
  }

  return (
    basePrompt +
    specificInstructions +
    `

Return your analysis in this EXACT JSON format:
{
  "taskCompleted": true/false,
  "qualityScore": number (0-100),
  "detectedCount": number (if counting reps),
  "requiredCount": number (if counting reps),
  "feedback": "Detailed explanation of what you observed",
  "failureReason": "Why the task failed (if taskCompleted is false)",
  "suggestions": "Tips for improvement (if any)"
}

Be strict but fair in your evaluation. The user should genuinely complete the task to earn coins.`
  );
}

function extractNumber(text: string): number {
  const match = text.match(/\d+/);
  return match ? parseInt(match[0]) : 1;
}

function extractDuration(text: string): number {
  const match = text.match(/(\d+)[\s-]*(minute|min)/i);
  return match ? parseInt(match[1]) : 10;
}

function parseTextResponse(responseText: string, task: any): any {
  // Fallback parser for non-JSON responses
  const completed =
    responseText.toLowerCase().includes("completed") ||
    responseText.toLowerCase().includes("success") ||
    responseText.toLowerCase().includes("correct");

  return {
    taskCompleted: completed,
    qualityScore: completed ? 75 : 25,
    detectedCount: 0,
    requiredCount: extractNumber(task.title),
    feedback: responseText,
    failureReason: completed
      ? null
      : "AI could not verify task completion from video",
    suggestions: "Please ensure good lighting and clear view of the exercise",
  };
}

export async function GET() {
  return NextResponse.json({
    status: "active",
    supportedCategories: ["fitness", "wellness"],
    maxFileSize: "50MB",
    supportedFormats: [
      "video/mp4",
      "video/mpeg",
      "video/mov",
      "video/avi",
      "video/webm",
    ],
    features: [
      "Fitness exercise verification",
      "Repetition counting",
      "Form analysis",
      "Quality scoring",
      "Automatic coin rewards",
    ],
    model: "gemini-3-flash-preview",
  });
}
