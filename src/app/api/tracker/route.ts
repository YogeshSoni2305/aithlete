import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { safeDbCall, safeApiResponse } from "@/lib/safety";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const user = await currentUser();
        if (!user) {
            return safeApiResponse({ error: "Unauthorized" }, 401);
        }

        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type"); // workout, meal, weight

        const dbUser = await safeDbCall(() => prisma.user.findUnique({
            where: { clerkId: user.id },
        }), null);

        if (!dbUser) {
            return safeApiResponse([]);
        }

        let logs;
        if (type === "workout") {
            logs = await safeDbCall(() => prisma.workoutLog.findMany({
                where: { userId: dbUser.id },
                orderBy: { date: "desc" },
            }), []);
        } else if (type === "meal") {
            logs = await safeDbCall(() => prisma.mealLog.findMany({
                where: { userId: dbUser.id },
                orderBy: { date: "desc" },
            }), []);
        } else if (type === "weight") {
            logs = await safeDbCall(() => prisma.weightLog.findMany({
                where: { userId: dbUser.id },
                orderBy: { date: "asc" },
            }), []);
        } else {
            return safeApiResponse({ error: "Invalid type" }, 400);
        }

        return safeApiResponse(logs);
    } catch (error) {
        console.error("Error fetching logs:", error);
        return safeApiResponse({ error: "Internal Server Error" }, 500);
    }
}

export async function POST(req: Request) {
    try {
        const user = await currentUser();
        if (!user) {
            return safeApiResponse({ error: "Unauthorized" }, 401);
        }

        const body = await req.json().catch(() => null);
        if (!body) return safeApiResponse({ error: "Invalid JSON" }, 400);

        const { type, data } = body;

        // Date Feature Restriction
        // All users can log, but only "Yogesh" or "Vijay" can backdate/future-date.
        const userName = (user.firstName || "").toLowerCase();
        const isAdmin = ["yogesh", "vijay"].includes(userName);
        const todayStr = new Date().toISOString().split("T")[0];
        const requestDateStr = new Date(data.date).toISOString().split("T")[0];

        if (!isAdmin && requestDateStr !== todayStr) {
            return safeApiResponse({ error: "Date Selection Restricted: Only Yogesh or Vijay can select custom dates." }, 403);
        }

        // Ensure user exists in DB
        let dbUser = await safeDbCall(() => prisma.user.findUnique({
            where: { clerkId: user.id },
        }), null);

        if (!dbUser) {
            dbUser = await safeDbCall(() => prisma.user.create({
                data: {
                    clerkId: user.id,
                    email: user.emailAddresses[0].emailAddress,
                    name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
                },
            }), null);
        }

        if (!dbUser) return safeApiResponse({ error: "Database unreachable" }, 503);

        let newLog;
        if (type === "workout") {
            newLog = await safeDbCall(() => prisma.workoutLog.create({
                data: {
                    userId: dbUser!.id,
                    date: new Date(data.date),
                    exercise: data.exercise,
                    sets: Number(data.sets),
                    reps: Number(data.reps),
                    weight: Number(data.weight),
                },
            }), null);
        } else if (type === "meal") {
            newLog = await safeDbCall(() => prisma.mealLog.create({
                data: {
                    userId: dbUser!.id,
                    date: new Date(data.date),
                    name: data.name,
                    calories: Number(data.calories),
                    protein: Number(data.protein),
                    carbs: Number(data.carbs),
                    fats: Number(data.fats),
                },
            }), null);
        } else if (type === "weight") {
            newLog = await safeDbCall(() => prisma.weightLog.create({
                data: {
                    userId: dbUser!.id,
                    date: new Date(data.date),
                    weight: Number(data.weight),
                },
            }), null);
        } else {
            return safeApiResponse({ error: "Invalid type" }, 400);
        }

        if (!newLog) return safeApiResponse({ error: "Failed to save log" }, 503);

        return safeApiResponse(newLog);
    } catch (error) {
        console.error("Error saving log:", error);
        return safeApiResponse({ error: "Internal Server Error" }, 500);
    }
}

export async function DELETE(req: Request) {
    try {
        const user = await currentUser();
        if (!user) {
            return safeApiResponse({ error: "Unauthorized" }, 401);
        }

        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type");
        const id = searchParams.get("id");
        const all = searchParams.get("all");

        const dbUser = await safeDbCall(() => prisma.user.findUnique({
            where: { clerkId: user.id },
        }), null);

        if (!dbUser) {
            return safeApiResponse({ error: "User not found" }, 404);
        }

        if (type === "weight" && all === "true") {
            await safeDbCall(() => prisma.weightLog.deleteMany({
                where: { userId: dbUser.id },
            }), null);
            return safeApiResponse({ success: true });
        }

        if (!id) {
            return safeApiResponse({ error: "Missing ID" }, 400);
        }

        const result = await safeDbCall(async () => {
            if (type === "workout") {
                return await prisma.workoutLog.delete({ where: { id: id! } });
            } else if (type === "meal") {
                return await prisma.mealLog.delete({ where: { id: id! } });
            } else if (type === "weight") {
                return await prisma.weightLog.delete({ where: { id: id! } });
            }
            return null;
        }, null);

        if (!result) return safeApiResponse({ error: "Failed to delete" }, 503);

        return safeApiResponse({ success: true });
    } catch (error) {
        console.error("Error deleting log:", error);
        return safeApiResponse({ error: "Internal Server Error" }, 500);
    }
}
