import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { safeDbCall, safeApiResponse } from "@/lib/safety";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const user = await currentUser();
        if (!user) {
            return safeApiResponse({ error: "Unauthorized" }, 401);
        }

        const dbUser = await safeDbCall(() => prisma.user.findUnique({
            where: { clerkId: user.id },
            include: {
                plans: {
                    where: { isActive: true },
                    orderBy: { createdAt: "desc" },
                    take: 1,
                },
            },
        }), null);

        if (!dbUser || !dbUser.plans || dbUser.plans.length === 0) {
            return safeApiResponse(null);
        }

        return safeApiResponse(dbUser.plans[0].planData);
    } catch (error) {
        console.error("Error fetching plan:", error);
        return safeApiResponse({ error: "Internal Server Error" }, 500);
    }
}

export async function POST(req: Request) {
    try {
        const user = await currentUser();
        if (!user) {
            return safeApiResponse({ error: "Unauthorized" }, 401);
        }

        const planData = await req.json().catch(() => null);
        if (!planData) {
            return safeApiResponse({ error: "Invalid plan data" }, 400);
        }

        // Ensure user exists in DB
        const dbUser = await safeDbCall(() => prisma.user.upsert({
            where: { clerkId: user.id },
            update: {},
            create: {
                clerkId: user.id,
                email: user.emailAddresses[0].emailAddress,
                name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
            },
        }), null);

        if (!dbUser) {
            return safeApiResponse({ error: "Database unreachable" }, 503);
        }

        // Deactivate old plans
        await safeDbCall(() => prisma.generatedPlan.updateMany({
            where: { userId: dbUser.id, isActive: true },
            data: { isActive: false },
        }), null);

        // Create new plan
        const newPlan = await safeDbCall(() => prisma.generatedPlan.create({
            data: {
                userId: dbUser.id,
                planData: planData,
                isActive: true,
            },
        }), null);

        return safeApiResponse(newPlan);
    } catch (error) {
        console.error("Error saving plan:", error);
        return safeApiResponse({ error: "Internal Server Error" }, 500);
    }
}
