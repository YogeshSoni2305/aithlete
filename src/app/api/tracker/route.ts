import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type"); // workout, meal, weight

        const dbUser = await prisma.user.findUnique({
            where: { clerkId: user.id },
        });

        if (!dbUser) {
            return NextResponse.json([]);
        }

        let logs;
        if (type === "workout") {
            logs = await prisma.workoutLog.findMany({
                where: { userId: dbUser.id },
                orderBy: { date: "desc" },
            });
        } else if (type === "meal") {
            logs = await prisma.mealLog.findMany({
                where: { userId: dbUser.id },
                orderBy: { date: "desc" },
            });
        } else if (type === "weight") {
            logs = await prisma.weightLog.findMany({
                where: { userId: dbUser.id },
                orderBy: { date: "asc" },
            });
        } else {
            return NextResponse.json({ error: "Invalid type" }, { status: 400 });
        }

        return NextResponse.json(logs);
    } catch (error) {
        console.error("Error fetching logs:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { type, data } = body;

        // Date Feature Restriction
        // All users can log, but only "Yogesh" or "Vijay" can backdate/future-date.
        // Others are forced to use "today".
        const userName = (user.firstName || "").toLowerCase();
        const isAdmin = ["yogesh", "vijay"].includes(userName);
        const todayStr = new Date().toISOString().split("T")[0];
        const requestDateStr = new Date(data.date).toISOString().split("T")[0];

        if (!isAdmin && requestDateStr !== todayStr) {
            return NextResponse.json({ error: "Date Selection Restricted: Only Yogesh or Vijay can select custom dates." }, { status: 403 });
        }

        // Ensure user exists in DB
        // NOTE: Replaced upsert with findUnique + create to avoid P2010 (Transactions not supported) on standalone Mongo
        let dbUser = await prisma.user.findUnique({
            where: { clerkId: user.id },
        });

        if (!dbUser) {
            dbUser = await prisma.user.create({
                data: {
                    clerkId: user.id,
                    email: user.emailAddresses[0].emailAddress,
                    name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
                },
            });
        }

        let newLog;
        if (type === "workout") {
            newLog = await prisma.workoutLog.create({
                data: {
                    userId: dbUser.id,
                    date: new Date(data.date),
                    exercise: data.exercise,
                    sets: Number(data.sets),
                    reps: Number(data.reps),
                    weight: Number(data.weight),
                },
            });
        } else if (type === "meal") {
            newLog = await prisma.mealLog.create({
                data: {
                    userId: dbUser.id,
                    date: new Date(data.date),
                    name: data.name,
                    calories: Number(data.calories),
                    protein: Number(data.protein),
                    carbs: Number(data.carbs),
                    fats: Number(data.fats),
                },
            });
        } else if (type === "weight") {
            newLog = await prisma.weightLog.create({
                data: {
                    userId: dbUser.id,
                    date: new Date(data.date),
                    weight: Number(data.weight),
                },
            });
        } else {
            return NextResponse.json({ error: "Invalid type" }, { status: 400 });
        }

        return NextResponse.json(newLog);
    } catch (error) {
        console.error("Error saving log:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
export async function DELETE(req: Request) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type");
        const id = searchParams.get("id");
        const all = searchParams.get("all");

        const dbUser = await prisma.user.findUnique({
            where: { clerkId: user.id },
        });

        if (!dbUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (type === "weight" && all === "true") {
            await prisma.weightLog.deleteMany({
                where: { userId: dbUser.id },
            });
            return NextResponse.json({ success: true });
        }

        if (!id) {
            return NextResponse.json({ error: "Missing ID" }, { status: 400 });
        }

        if (type === "workout") {
            await prisma.workoutLog.delete({ where: { id } });
        } else if (type === "meal") {
            await prisma.mealLog.delete({ where: { id } });
        } else if (type === "weight") {
            await prisma.weightLog.delete({ where: { id } });
        } else {
            return NextResponse.json({ error: "Invalid type" }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting log:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
