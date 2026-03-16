import { NextResponse } from "next/server";
import OpenAI from "openai";
import { UserData, GeneratedPlan } from "@/types";
import { safeJsonParse, safeApiResponse } from "@/lib/safety";

export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "",
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  try {
    const userData: UserData = await req.json();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Groq API Key not configured" },
        { status: 500 }
      );
    }

    // Dynamic Logic based on User Data
    let levelInstructions = "";
    switch (userData.level) {
      case "Beginner":
        levelInstructions = `
        - Focus on mastering FORM and technique.
        - Volume: Low-Moderate (3-4 exercises per session).
        - Intensity: 2 Sets per exercise.
        - Rep Range: 10-12 controlled reps.
        - Focus on compound movements (Squats, Pushups, Lunges).
        `;
        break;
      case "Intermediate":
        levelInstructions = `
        - Focus on Hypertrophy (Muscle Growth) and progressive overload.
        - Volume: Moderate (4-5 exercises per session).
        - Intensity: 3 Sets per exercise.
        - Rep Range: 8-12 reps near failure.
        - Mix of compound and isolation movements.
        `;
        break;
      case "Advanced":
        levelInstructions = `
        - Focus on Max Strength and High Volume.
        - Volume: High (5-6+ exercises per session).
        - Intensity: 3-4 Sets per exercise.
        - Rep Range: Varied (6-12 reps).
        - Incorporate advanced techniques like Supersets, Dropsets, or Pyramids implicitly in the notes.
        `;
        break;
      default:
        levelInstructions = "- Standard balanced plan: 3 sets of 10-12 reps.";
    }

    let locationInstructions = "";
    switch (userData.location) {
      case "Home":
        locationInstructions = `
        - STRICTLY NO GYM MACHINES.
        - Use Bodyweight exercises (Pushups, Squats, Lunges, Burpees, Planks).
        - If weights are needed, assume common household items or dumbbells ONLY if specified, otherwise stick to Calisthenics.
        `;
        break;
      case "Gym":
        locationInstructions = `
        - Utilize FULL GYM EQUIPMENT: Barbells, Dumbbells, Machines, Cables.
        - Include heavy compound lifts (Bench Press, Deadlifts, Squats) where appropriate.
        `;
        break;
      case "Outdoor":
        locationInstructions = `
        - Focus on running, sprinting, and functional movements.
        - Use park benches for dips/step-ups.
        - High intensity cardio and plyometrics.
        `;
        break;
      default:
        locationInstructions = "- Use available equipment.";
    }

    const prompt = `
      Act as an expert fitness coach and nutritionist specializing in Indian cuisine and dietary habits. Generate a specialized, high-quality 7-day workout and diet plan for:
      
      User Profile:
      - Name: ${userData.name}
      - Goal: ${userData.goal} (${userData.level} Level)
      - Stats: ${userData.age}yr / ${userData.gender} / ${userData.height}cm / ${userData.weight}kg
      - Location: ${userData.location}
      - Diet: ${userData.dietaryPreferences}
      - Medical: ${userData.medicalHistory || "None"}

      *** WORKOUT STRATEGY Based on Level (${userData.level}) ***
      ${levelInstructions}

      *** EQUIPMENT STRATEGY Based on Location (${userData.location}) ***
      ${locationInstructions}

      *** IMPORTANT DIETARY GUIDELINES (Indian Context) ***
      - All meals must be authentic Indian dishes.
      - For "Non-Veg": Balanced mix (40-50% Veg, rest Non-Veg).
      - For "Veg + Non-Veg": Explicitly mostly Veg with 3-4 Non-Veg meals/week.
      - For "Veg": High protein Vegetarian (Paneer, Soya, Dal, Legumes).
      - For "Vegan": Plant-based Indian (Tofu, Lentils, Chana).
      - For "Keto": Low carb Indian (Paneer/Chicken/Fish tikka, Leafy greens, Ghee).
      - Use Indian cooking styles (Curry, Tandoori, Stir-fry).
      
      *** CALORIE & MACRO GUIDELINES (CRITICAL) ***
      - TARGET CALORIES: 1800 - 2500+ kcal (Never below 1500 unless specifically requested).
      - Ensure portions are realistic for an adult human.
      - Breakfast: ~400-600 kcal.
      - Lunch: ~700-900 kcal.
      - Dinner: ~600-800 kcal.
      - Snack: ~200-400 kcal.

      *** MEAL COMPOSITION RULES (Complete Indian Meals) ***
      - LUNCH & DINNER MUST BE COMPLETE MEALS, consisting of:
        1. Main Protein/Curry (Dal, Paneer, Chicken, Fish, etc.)
        2. Carbohydrate Source (2-3 Rotis, large bowl Rice)
        3. Side Dish (Sabzi/Dry Veg)
        4. Fiber/Probiotic (Salad, Cucumber, Curd/Raita)
      - Example: "Paneer Butter Masala (1 bowl) + 3 Chapatis + Bhindi Fry + Green Salad"
      - DO NOT suggest single items like "1 bowl dal" or "Grilled Chicken" alone.
      
      *** CRITICAL RULES FOR VARIETY & USABILITY ***
      1. NO REPETITION: Every day must feel unique. Do not repeat the same exact meal structure.
      2. PROGRESSION: The workout should feel like a structured week, not random exercises.
      3. REALISM: Ensure the diet is practical for an Indian household.
      4. USABILITY:
         - Beginner: Keep it simple, 2 sets.
         - Intermediate/Advanced: Ramp up volume to 3-4 sets.
      
      Return the response strictly in the following JSON format:
      {
        "workoutPlan": [
          {
            "day": "Day 1",
            "focus": "Target Muscle Group",
            "exercises": [
              { 
                "name": "Exercise Name", 
                "sets": "Based on Level", 
                "reps": "Range", 
                "rest": "60s", 
                "notes": "Form tip",
                "videoUrl": "Real YouTube Link" 
              }
            ]
          }
        ],
        "dietPlan": [
          {
            "day": "Day 1",
            "breakfast": { "name": "", "description": "", "calories": "", "protein": "", "carbs": "", "fats": "", "recipeUrl": "" },
            "lunch": { "name": "", "description": "", "calories": "", "protein": "", "carbs": "", "fats": "", "recipeUrl": "" },
            "dinner": { "name": "", "description": "", "calories": "", "protein": "", "carbs": "", "fats": "", "recipeUrl": "" },
            "snacks": [{ "name": "", "description": "", "calories": "", "protein": "", "carbs": "", "fats": "", "recipeUrl": "" }]
          }
        ],
        "tips": ["Tip 1", "Tip 2", "Tip 3"],
        "motivation": "Short punchy quote"
      }
      
      Ensure valid JSON. No markdown.
    `;

    console.log("Calling Groq API with model: llama-3.3-70b-versatile...");
    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are an expert Indian fitness coach and nutritionist. You specialize in creating culturally appropriate diet plans with authentic Indian cuisine. You MUST ALWAYS return response in VALID JSON format."
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        max_tokens: 6000,
        temperature: 0.7,
      });
    } catch (apiError: any) {
      console.error("PRIMARY MODEL FAILED:", apiError.message);
      console.log("Attempting fallback to llama3-8b-8192...");
      
      completion = await openai.chat.completions.create({
        model: "llama3-8b-8192", // Faster, smaller fallback
        messages: [
          {
            role: "system",
            content: "You are an expert Indian fitness coach and nutritionist. Return VALID JSON."
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        max_tokens: 4000,
        temperature: 0.5,
      });
    }

    if (!completion.choices?.[0]) {
      throw new Error("No response choices from AI");
    }

    console.log("AI finish reason:", completion.choices[0].finish_reason);
    const text = completion.choices[0].message.content || "";
    console.log("AI Raw Response (first 100 chars):", text.substring(0, 100));

    const plan = safeJsonParse<GeneratedPlan | null>(text, null);
    console.log("Parsed Plan exists:", !!plan);

    if (!plan || !Array.isArray(plan.workoutPlan) || !Array.isArray(plan.dietPlan)) {
      console.error("Plan structure invalid or missing required arrays. Text:", text);
      return safeApiResponse({
        error: "Generated plan was incomplete. Please try again.",
        details: "Missing workoutPlan or dietPlan"
      }, 500);
    }

    return safeApiResponse(plan);
  } catch (error) {
    console.error("CRITICAL GENERATION ERROR:", error);
    return safeApiResponse(
      { error: "Failed to generate plan", details: error instanceof Error ? error.message : "Internal Server Error" },
      500
    );
  }
}
