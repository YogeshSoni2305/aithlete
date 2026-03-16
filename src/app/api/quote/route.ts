import { safeApiResponse } from "@/lib/safety";
import OpenAI from "openai";

export const dynamic = "force-dynamic";

const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY || "",
    baseURL: "https://api.groq.com/openai/v1",
});

export async function GET() {
    try {
        if (!process.env.GROQ_API_KEY) {
            return safeApiResponse({ error: "Groq API Key not configured" }, 500);
        }

        const completion = await openai.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: "You are a motivational fitness coach. Generate short, powerful motivational quotes about fitness, health, and personal growth. Keep them under 20 words."
                },
                {
                    role: "user",
                    content: "Give me one powerful motivational quote about fitness and transformation."
                },
            ],
        }, { timeout: 5000 }).catch(() => null);

        const quote = completion?.choices[0]?.message?.content || "Your only limit is you.";

        return safeApiResponse({ quote });
    } catch (error) {
        console.error("Error generating quote:", error);
        return safeApiResponse({ quote: "Your only limit is you." });
    }
}
