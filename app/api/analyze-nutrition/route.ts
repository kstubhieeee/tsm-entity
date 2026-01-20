import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  try {
    const { image, userInfo } = await request.json();

    if (!image) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    // Prepare comprehensive nutrition analysis prompt
    const prompt = `You are an expert AI nutritionist and dietitian. Analyze the food image provided and give comprehensive nutritional insights and personalized recommendations.

${userInfo ? `User Context: ${userInfo}` : ""}

Please analyze the food in the image and provide detailed information in the following JSON format:

{
  "foodItems": [
    {
      "name": "Food item name",
      "quantity": "Estimated serving size",
      "calories": 150,
      "nutrients": {
        "protein": "10g",
        "carbs": "25g", 
        "fat": "8g",
        "fiber": "3g",
        "sugar": "5g",
        "sodium": "200mg"
      }
    }
  ],
  "totalCalories": 450,
  "nutritionalBreakdown": {
    "protein": { "amount": "25g", "percentage": 22 },
    "carbs": { "amount": "60g", "percentage": 53 },
    "fat": { "amount": "12g", "percentage": 25 },
    "fiber": "8g",
    "vitamins": ["Vitamin C", "Vitamin A", "B Vitamins"],
    "minerals": ["Iron", "Calcium", "Potassium"]
  },
  "healthScore": 75,
  "mealType": "Breakfast" | "Lunch" | "Dinner" | "Snack" | "Mixed",
  "healthAssessment": {
    "pros": ["High in protein", "Good source of fiber"],
    "cons": ["High in sodium", "Contains processed ingredients"],
    "improvements": ["Add more vegetables", "Reduce portion size"]
  },
  "personalizedRecommendations": {
    "forWeightLoss": ["Replace with smaller portions", "Add salad"],
    "forMuscleGain": ["Add protein shake", "Include more lean protein"],
    "forDiabetes": ["Monitor portion size", "Add fiber"],
    "forHeartHealth": ["Reduce sodium", "Add omega-3 rich foods"],
    "general": ["Balance with vegetables", "Stay hydrated"]
  },
  "alternativeOptions": {
    "healthier": ["Grilled instead of fried", "Whole grain alternatives"],
    "lowerCalorie": ["Steam vegetables", "Use air fryer"],
    "higherProtein": ["Add Greek yogurt", "Include nuts/seeds"]
  },
  "groceryList": [
    {
      "category": "Proteins",
      "items": ["Chicken breast", "Greek yogurt", "Eggs"]
    },
    {
      "category": "Vegetables", 
      "items": ["Spinach", "Broccoli", "Bell peppers"]
    }
  ],
  "mealPlanSuggestions": {
    "breakfast": ["Oatmeal with berries", "Egg white omelet"],
    "lunch": ["Grilled chicken salad", "Quinoa bowl"],
    "dinner": ["Baked salmon", "Vegetable stir-fry"],
    "snacks": ["Apple with almonds", "Greek yogurt"]
  },
  "nutritionalDeficiencies": ["May be low in Vitamin D", "Could use more fiber"],
  "confidence": 85
}

Analysis Guidelines:
1. Identify ALL visible food items and estimate portions accurately
2. Calculate nutritional values based on standard food databases
3. Consider the user's personal information for customized advice
4. Provide health score (0-100) based on nutritional quality
5. Give specific, actionable recommendations for different health goals
6. Suggest realistic alternatives and improvements
7. Create practical grocery lists based on recommendations  
8. Design balanced meal plans complementing the analyzed food
9. Identify potential nutritional gaps or concerns
10. Consider cooking methods and preparation effects on nutrition
11. Factor in food combinations and meal timing
12. Provide culturally appropriate and accessible alternatives

Health Score Criteria:
- 80-100: Excellent nutritional profile, well-balanced
- 60-79: Good nutrition with minor improvements needed
- 40-59: Average nutrition, several areas for improvement
- 20-39: Poor nutrition, significant changes recommended
- 0-19: Very poor nutrition, major overhaul needed

Special Considerations:
- Portion control and serving sizes
- Hidden ingredients and processing levels
- Nutrient density vs calorie density
- Glycemic impact for blood sugar management
- Sodium content for cardiovascular health
- Fiber content for digestive health
- Protein quality and completeness
- Healthy vs unhealthy fats
- Added sugars vs natural sugars
- Micronutrient diversity

Return ONLY the JSON object, no additional text.`;

    // Convert base64 to the format Gemini expects
    const imagePart = {
      inlineData: {
        data: image,
        mimeType: "image/jpeg",
      },
    };

    // Generate content
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    try {
      // Clean the response to extract JSON
      let cleanedResponse = text.trim();

      // Remove any markdown code blocks
      if (cleanedResponse.startsWith("```json")) {
        cleanedResponse = cleanedResponse
          .replace(/^```json\s*/, "")
          .replace(/\s*```$/, "");
      } else if (cleanedResponse.startsWith("```")) {
        cleanedResponse = cleanedResponse
          .replace(/^```\s*/, "")
          .replace(/\s*```$/, "");
      }

      // Parse the JSON response
      const analysis = JSON.parse(cleanedResponse);

      // Validate required fields
      if (!analysis.foodItems || analysis.foodItems.length === 0) {
        throw new Error("Could not identify food items");
      }

      return NextResponse.json(analysis);
    } catch (parseError) {
      console.error("Error parsing Gemini response:", parseError);
      console.log("Raw response:", text);

      // Fallback response if JSON parsing fails
      return NextResponse.json({
        foodItems: [
          {
            name: "Food Analysis Available",
            quantity: "See detailed analysis",
            calories: 0,
            nutrients: {
              protein: "Analysis available",
              carbs: "Analysis available",
              fat: "Analysis available",
              fiber: "Analysis available",
              sugar: "Analysis available",
              sodium: "Analysis available",
            },
          },
        ],
        totalCalories: 0,
        nutritionalBreakdown: {
          protein: { amount: "Analysis available", percentage: 0 },
          carbs: { amount: "Analysis available", percentage: 0 },
          fat: { amount: "Analysis available", percentage: 0 },
          fiber: "Analysis available",
          vitamins: ["Detailed analysis available"],
          minerals: ["Detailed analysis available"],
        },
        healthScore: 50,
        mealType: "Mixed",
        healthAssessment: {
          pros: ["Detailed analysis available in raw response"],
          cons: ["Professional nutritionist consultation recommended"],
          improvements: ["Refer to detailed analysis for suggestions"],
        },
        personalizedRecommendations: {
          forWeightLoss: [
            "Consult nutrition professional for personalized advice",
          ],
          forMuscleGain: ["Professional guidance recommended"],
          forDiabetes: ["Consult with registered dietitian"],
          forHeartHealth: ["Seek professional nutrition counseling"],
          general: ["Maintain balanced diet with variety of nutrients"],
        },
        alternativeOptions: {
          healthier: ["Detailed suggestions available in analysis"],
          lowerCalorie: ["Professional guidance recommended"],
          higherProtein: ["Consult with nutritionist"],
        },
        groceryList: [
          {
            category: "General",
            items: ["Fruits and vegetables", "Whole grains", "Lean proteins"],
          },
        ],
        mealPlanSuggestions: {
          breakfast: ["Balanced breakfast with protein and fiber"],
          lunch: ["Nutritious lunch with vegetables"],
          dinner: ["Well-rounded dinner with lean protein"],
          snacks: ["Healthy snacks with nutrients"],
        },
        nutritionalDeficiencies: ["Professional assessment recommended"],
        confidence: 60,
        rawAnalysis: text,
      });
    }
  } catch (error) {
    console.error("Error analyzing nutrition:", error);

    if (error instanceof Error && error.message.includes("API key")) {
      return NextResponse.json(
        { error: "API configuration error. Please check GEMINI_API_KEY." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to analyze nutrition. Please try again." },
      { status: 500 }
    );
  }
}
