import { safeApiResponse } from "@/lib/safety";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const { prompt } = body;

        if (!prompt) {
            return safeApiResponse({ error: "Prompt is required" }, 400);
        }

        const encodedPrompt = encodeURIComponent(prompt);
        const imageUrl = `https://pollinations.ai/p/${encodedPrompt}?width=1024&height=768&seed=${Math.floor(Math.random() * 1000)}`;

        return safeApiResponse({ imageUrl });
    } catch (error) {
        console.error("Error generating image:", error);
        return safeApiResponse({ error: "Failed to generate image" }, 500);
    }
}
