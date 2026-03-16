import { NextResponse } from "next/server";
import OpenAI from "openai";
import { UserData } from "@/types";
import { safeJsonParse, safeApiResponse } from "@/lib/safety";

export const dynamic = "force-dynamic";

const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY || "",
    baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const userData: UserData = body;

        if (!process.env.GROQ_API_KEY) {
            return safeApiResponse(
                { error: "Groq API Key not configured" },
                500
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
      Act as an expert fitness coach and nutritionist specializing in Indian cuisine. Generate a specialized, high-quality 7-day workout and diet plan for ${userData.name}.
      
      User Profile:
      - Goal: ${userData.goal} (${userData.level})
      - Location: ${userData.location}
      - Stats: ${userData.age}yr / ${userData.gender} / ${userData.height}cm / ${userData.weight}kg
      - Diet: ${userData.dietaryPreferences}
      - Medical: ${userData.medicalHistory || "None"}

      *** WORKOUT STRATEGY ***
      ${levelInstructions}

      *** EQUIPMENT STRATEGY ***
      ${locationInstructions}

      *** DIETARY RULES (Indian Context) ***
      - All meals must be authentic Indian dishes.
      - Use high protein sources like Paneer, Soya, Chicken, Dal.
      - TARGET CALORIES: 1800 - 2500 kcal.
      - Lunch/Dinner must include Main Protein, Carbs (Roti/Rice), and Fiber (Salad).

      *** RULES FOR VARIETY ***
      1. NO REPETITION: Every day must feel unique.
      2. No text outside JSON. No markdown.

      *** STRICT JSON STRUCTURE ***
      {
        "workoutPlan": [{"day": "Day 1", "focus": "", "exercises": [{"name": "", "sets": "", "reps": "", "rest": "60s", "notes": "", "videoUrl": ""}]}],
        "dietPlan": [{"day": "Day 1", "breakfast": {"name": "", "description": "", "calories": "", "protein": "", "carbs": "", "fats": "", "recipeUrl": ""}, "lunch": {...}, "dinner": {...}, "snacks": [...] }],
        "tips": ["Tip 1", "Tip 2", "Tip 3"],
        "motivation": "Short quote"
      }
    `;

        const completion = await openai.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: "You are a specialized fitness AI. Response MUST be valid JSON only. NO MARKDOWN. NO EXPLANATION." },
                { role: "user", content: prompt },
            ],
            temperature: 0.1, // Lower temperature for more consistent JSON
        });

        const text = completion.choices[0].message.content || "";
        const plan = safeJsonParse(text, null);

        if (!plan) {
            console.error("Failed to parse AI response:", text);
            return NextResponse.json({ error: "Failed to generate valid plan format. Please try again." }, { status: 500 });
        }

        return NextResponse.json(plan);
    } catch (error) {
        console.error("Error generating plan:", error);
        return NextResponse.json(
            { error: "Failed to generate plan", details: error instanceof Error ? error.message : "Internal Server Error" },
            { status: 500 }
        );
    }
}
