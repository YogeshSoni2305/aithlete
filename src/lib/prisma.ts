import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
    return new PrismaClient({
        log: ["error", "warn"],
        errorFormat: "minimal",
    });
};

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

// Basic error handling for the singleton
if (prisma) {
    prisma.$connect().catch((err) => {
        console.error("Prisma Initial Connection Error:", err.message);
    });
}

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
