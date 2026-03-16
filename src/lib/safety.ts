import { NextResponse } from "next/server";

/**
 * Safely parses a JSON string. Returns fallback if parsing fails.
 */
export function safeJsonParse<T>(text: string, fallback: T): T {
    try {
        if (!text || typeof text !== "string") return fallback;
        
        // Remove markdown blocks and any leading/trailing non-JSON characters
        let cleaned = text.trim();
        if (cleaned.includes("```")) {
            const matches = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
            if (matches && matches[1]) {
                cleaned = matches[1].trim();
            }
        }
        
        // Remove text before start of JSON
        const startIndex = cleaned.indexOf("{");
        const endIndex = cleaned.lastIndexOf("}");
        if (startIndex !== -1 && endIndex !== -1) {
            cleaned = cleaned.substring(startIndex, endIndex + 1);
        }

        return JSON.parse(cleaned) as T;
    } catch (error) {
        console.error("JSON Parse Error:", error, "Input Snippet:", text.substring(0, 100));
        return fallback;
    }
}

/**
 * Safely executes a database call. Handles timeouts and connection errors.
 */
export async function safeDbCall<T>(callback: () => Promise<T>, fallback: T): Promise<T> {
    try {
        // Enforce a timeout for DB operations
        const timeout = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Database operation timed out")), 8000)
        );
        
        return await Promise.race([callback(), timeout]) as T;
    } catch (error) {
        console.error("Database Error:", error);
        return fallback;
    }
}

/**
 * Standardized API response helper to ensure valid JSON and consistent structure.
 */
export function safeApiResponse(data: any, status: number = 200) {
    try {
        // Ensure data is not undefined
        const responseData = data ?? { error: "Unknown error occurred" };
        return NextResponse.json(responseData, { status });
    } catch (error) {
        console.error("API Response Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
